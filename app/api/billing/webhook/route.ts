export const dynamic = 'force-dynamic'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { PLAN_PRICING, RECHARGE_PACKS } from '@/lib/razorpay/client'
import crypto from 'crypto'

// FIX: this webhook previously used the cookie/session-based Supabase
// client (from '@/lib/supabase/server'), which enforces Row Level
// Security based on whoever's browser session is attached to the request.
// A Razorpay webhook call has NO browser session — no cookies, no logged
// -in user — so any RLS policy requiring auth.uid() = user_id silently
// blocked every write here. The Supabase JS client doesn't throw on an
// RLS-blocked update by default, it just returns zero affected rows with
// no error, which is why this logged "successfully upgraded" while the
// database was never actually touched.
//
// This request has already been cryptographically verified as genuinely
// from Razorpay (signature check below) before any of this runs, so using
// the service-role key here — which bypasses RLS entirely — is the
// correct trust boundary: we're not trusting the request because it has
// a session, we're trusting it because we verified who sent it.
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  if (!verifySignature(rawBody, signature)) {
    console.error('Razorpay webhook: signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  // NEW: payment.failed is now handled explicitly instead of being
  // silently skipped like every other non-captured event. This is real,
  // useful data for support ("why didn't my payment go through") that was
  // previously discarded entirely.
  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity
    const notes = payment.notes ?? {}
    const { user_id, type, key } = notes

    if (user_id && type && key) {
      const { error } = await supabaseAdmin.from('payments').insert({
        user_id,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        type,
        plan_or_pack_key: key,
        amount_paise: payment.amount,
        currency: payment.currency,
        status: 'failed',
        payment_method: payment.method,
        failure_reason: payment.error_description ?? payment.error_reason ?? 'Unknown',
      })
      if (error) console.error('Failed to log payment.failed record:', error.message)
      else console.log(`Razorpay webhook: logged failed payment ${payment.id} for user ${user_id}`)
    }
    return NextResponse.json({ received: true, logged: 'failed_payment' })
  }

  if (event.event !== 'payment.captured') {
    console.log(`Razorpay webhook: skipped event type "${event.event}" (not payment.captured)`)
    return NextResponse.json({ received: true, skipped: event.event })
  }

  const payment = event.payload.payment.entity
  const notes = payment.notes ?? {}
  const { user_id, type, key } = notes

  if (!user_id || !type || !key) {
    console.error('Razorpay webhook: payment.captured missing expected notes', notes)
    return NextResponse.json({ error: 'Missing order metadata' }, { status: 400 })
  }

  console.log(`Razorpay webhook: processing payment.captured for user ${user_id}, type=${type}, key=${key}, payment_id=${payment.id}`)

  try {
    if (type === 'plan_upgrade') {
      const planInfo = PLAN_PRICING[key]
      if (!planInfo) throw new Error(`Unknown plan key in webhook: ${key}`)

      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + 30)

      // Verify the row exists BEFORE updating, rather than trying to get
      // a row count back from the update call itself — that combined
      // update().select(col, {count}) syntax has version-sensitive
      // TypeScript overloads across different @supabase/supabase-js
      // releases. This is simpler and works the same everywhere.
      const { data: existingProfile, error: checkErr } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', user_id)
        .maybeSingle()

      if (checkErr) throw new Error(`profiles lookup failed: ${checkErr.message}`)
      if (!existingProfile) throw new Error(`No profile found for user_id ${user_id}`)

      const { error: profileErr } = await supabaseAdmin
        .from('profiles')
        .update({ plan: key, credits_balance: planInfo.credits, credits_reset_at: periodEnd.toISOString() })
        .eq('id', user_id)

      if (profileErr) throw new Error(`profiles update failed: ${profileErr.message}`)

      const { error: subErr } = await supabaseAdmin.from('subscriptions').insert({
        user_id,
        gateway_subscription_id: payment.order_id,
        gateway_plan_id: key,
        gateway: 'razorpay',
        plan: key,
        status: 'active',
        current_period_end: periodEnd.toISOString(),
      })
      if (subErr) throw new Error(`subscriptions insert failed: ${subErr.message}`)

      const { error: txErr } = await supabaseAdmin.from('credit_transactions').insert({
        user_id,
        feature: 'plan_upgrade',
        credits_used: planInfo.credits,
        balance_after: planInfo.credits,
        metadata: { razorpay_payment_id: payment.id, plan: key },
      })
      if (txErr) throw new Error(`credit_transactions insert failed: ${txErr.message}`)

      console.log(`Razorpay webhook: successfully upgraded user ${user_id} to ${key}`)

      // Real billing-history record — separate from the credits ledger
      // above, which tracks balance changes, not payment/transaction detail.
      const { error: payErr } = await supabaseAdmin.from('payments').insert({
        user_id,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        type,
        plan_or_pack_key: key,
        amount_paise: payment.amount,
        currency: payment.currency,
        status: 'captured',
        payment_method: payment.method,
      })
      if (payErr) console.error('Failed to log payments record (non-fatal, credits already applied):', payErr.message)

    } else if (type === 'recharge') {
      const packInfo = RECHARGE_PACKS[key]
      if (!packInfo) throw new Error(`Unknown recharge pack key in webhook: ${key}`)

      const { data: profile, error: fetchErr } = await supabaseAdmin
        .from('profiles')
        .select('credits_balance')
        .eq('id', user_id)
        .single()

      if (fetchErr) throw new Error(`profiles fetch failed: ${fetchErr.message}`)

      const newBalance = (profile?.credits_balance ?? 0) + packInfo.credits

      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({ credits_balance: newBalance })
        .eq('id', user_id)

      if (updateErr) throw new Error(`profiles update failed: ${updateErr.message}`)

      const { error: txErr } = await supabaseAdmin.from('credit_transactions').insert({
        user_id,
        feature: 'recharge',
        credits_used: packInfo.credits,
        balance_after: newBalance,
        metadata: { razorpay_payment_id: payment.id, pack: key },
      })
      if (txErr) throw new Error(`credit_transactions insert failed: ${txErr.message}`)

      console.log(`Razorpay webhook: successfully recharged user ${user_id} with ${packInfo.credits} credits`)

      const { error: payErr } = await supabaseAdmin.from('payments').insert({
        user_id,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        type,
        plan_or_pack_key: key,
        amount_paise: payment.amount,
        currency: payment.currency,
        status: 'captured',
        payment_method: payment.method,
      })
      if (payErr) console.error('Failed to log payments record (non-fatal, credits already applied):', payErr.message)
    }

    return NextResponse.json({ received: true, processed: true })

  } catch (err) {
    console.error('Razorpay webhook processing failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}