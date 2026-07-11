export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { razorpay, RAZORPAY_KEY_ID, PLAN_PRICING, RECHARGE_PACKS } from '@/lib/razorpay/client'
import { z } from 'zod'

const BodySchema = z.object({
  type: z.enum(['plan_upgrade', 'recharge']),
  key: z.string().min(1), // 'grow' | 'accelerate' for plan_upgrade, pack key for recharge
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { type, key } = BodySchema.parse(await request.json())

    const catalog = type === 'plan_upgrade' ? PLAN_PRICING : RECHARGE_PACKS
    const item = catalog[key]
    if (!item) {
      return NextResponse.json({ error: 'Unknown plan or pack' }, { status: 400 })
    }

    // Razorpay order — one-time payment. The receipt encodes what this
    // order is FOR (type + key + user), so the webhook can act on it
    // without a separate lookup table. Short receipt ids only (max 40
    // chars per Razorpay), so we use a compact format, not raw UUIDs.
    const order = await razorpay.orders.create({
      amount: item.amountPaise,
      currency: 'INR',
      receipt: `${type}_${key}_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        type,
        key,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      label: item.label,
    })

  } catch (err) {
    console.error('Checkout order creation failed:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}