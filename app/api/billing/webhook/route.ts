export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLAN_PRICING, RECHARGE_PACKS } from '@/lib/razorpay/client'
import crypto from 'crypto'

// Razorpay webhook — configure this URL in the Razorpay dashboard under
// Settings → Webhooks, subscribed to the 'payment.captured' event.
// The webhook secret set there (separate from your API key secret) must
// match RAZORPAY_WEBHOOK_SECRET below.

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')
  // Constant-time comparison — avoids timing attacks on signature check
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

  if (event.event !== 'payment.captured') {
    // Acknowledge anything we're not handling yet — Razorpay retries
    // webhooks that don't return 2xx, so unhandled events should still 200.
    return NextResponse.json({ received: true })
  }

  const payment = event.payload.payment.entity
  const notes = payment.notes ?? {}
  const { user_id, type, key } = notes

  if (!user_id || !type || !key) {
    console.error('Razorpay webhook: payment.captured missing expected notes', notes)
    return NextResponse.json({ error: 'Missing order metadata' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    if (type === 'plan_upgrade') {
      const planInfo = PLAN_PRICING[key]
      if (!planInfo) throw new Error(`Unknown plan key in webhook: ${key}`)

      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + 30)

      // Update plan + reset credits to the new plan's full allowance —
      // an upgrade should feel immediate and generous, not prorated.
      await supabase
        .from('profiles')
        .update({ plan: key, credits_balance: planInfo.credits, credits_reset_at: periodEnd.toISOString() })
        .eq('id', user_id)

      await supabase.from('subscriptions').insert({
        user_id,
        gateway_subscription_id: payment.order_id,
        gateway_plan_id: key,
        gateway: 'razorpay',
        plan: key,
        status: 'active',
        current_period_end: periodEnd.toISOString(),
      })

      await supabase.from('credit_transactions').insert({
        user_id,
        feature: 'plan_upgrade',
        credits_used: planInfo.credits, // positive = added, matches existing sign convention
        balance_after: planInfo.credits,
        metadata: { razorpay_payment_id: payment.id, plan: key },
      })

    } else if (type === 'recharge') {
      const packInfo = RECHARGE_PACKS[key]
      if (!packInfo) throw new Error(`Unknown recharge pack key in webhook: ${key}`)

      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', user_id)
        .single()

      const newBalance = (profile?.credits_balance ?? 0) + packInfo.credits

      await supabase
        .from('profiles')
        .update({ credits_balance: newBalance })
        .eq('id', user_id)

      await supabase.from('credit_transactions').insert({
        user_id,
        feature: 'recharge',
        credits_used: packInfo.credits,
        balance_after: newBalance,
        metadata: { razorpay_payment_id: payment.id, pack: key },
      })
    }

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('Razorpay webhook processing failed:', err)
    // Still return 200 here would hide a real failure from Razorpay's retry
    // mechanism — a 500 lets Razorpay retry the webhook automatically.
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}