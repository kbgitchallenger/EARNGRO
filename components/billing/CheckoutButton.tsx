'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

interface CheckoutButtonProps {
  type: 'plan_upgrade' | 'recharge'
  planKey: string // 'grow' | 'accelerate' | 'grow_recharge' | 'accelerate_recharge'
  label: string
  style?: React.CSSProperties
  className?: string
}

// Loads Razorpay's checkout.js once, creates an order via our own API,
// opens the Razorpay modal, and refreshes the page on success — the
// webhook (not this component) is what actually credits the account, so
// the refresh here is just to reflect a balance that may already have
// updated by the time the modal closes.
export default function CheckoutButton({ type, planKey, label, style, className }: CheckoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function startCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, key: planKey }),
      })
      if (!res.ok) throw new Error('Could not start checkout')
      const order = await res.json()

      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'EarnGro',
        description: order.label,
        theme: { color: '#0E7A5A' },
        handler: function () {
          // Payment succeeded client-side — the webhook credits the account
          // server-side, usually within a second or two. Refresh to pick it up.
          router.refresh()
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      })

      rzp.open()
    } catch {
      setError('Something went wrong starting checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={startCheckout}
        disabled={loading}
        className={className}
        style={{
          display: 'block', width: '100%', textAlign: 'center',
          background: 'var(--teal)', color: '#fff', fontSize: 13, fontWeight: 700,
          padding: '10px', borderRadius: 99, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1, fontFamily: 'var(--sans)',
          ...style,
        }}
      >
        {loading ? 'Opening checkout…' : label}
      </button>
      {error && (
        <div style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 6, textAlign: 'center' }}>{error}</div>
      )}
    </>
  )
}