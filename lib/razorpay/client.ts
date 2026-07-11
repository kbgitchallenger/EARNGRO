// Razorpay server-side client. Requires these env vars once you have
// your test (or live) keys from the Razorpay dashboard:
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//   RAZORPAY_WEBHOOK_SECRET   (separate secret, set when creating the webhook)
//
// Uses Orders API (one-time payments), not Subscriptions — see note in
// app/api/billing/checkout/route.ts for why.

import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!

// ── Plan and recharge pricing — single source of truth, kept in sync with
// the pricing page and billing page cards. Amounts in paise (Razorpay's unit).
export const PLAN_PRICING: Record<string, { amountPaise: number; credits: number; label: string }> = {
  grow:       { amountPaise: 9900,  credits: 1500, label: 'Grow — 30 days' },
  accelerate: { amountPaise: 29900, credits: 5000, label: 'Accelerate — 30 days' },
}

export const RECHARGE_PACKS: Record<string, { amountPaise: number; credits: number; label: string }> = {
  grow_recharge:       { amountPaise: 4900, credits: 1000, label: 'Recharge — 1,000 credits' },
  accelerate_recharge: { amountPaise: 9900, credits: 2500, label: 'Recharge — 2,500 credits' },
}