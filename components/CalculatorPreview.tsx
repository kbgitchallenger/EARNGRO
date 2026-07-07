'use client'

// Static, non-interactive preview of what the Earning Gap result looks like.
// Replaces the live anonymous Calculator on the homepage — no live AI call,
// no IP rate-limiting surface, routes straight to signup. Numbers shown here
// are clearly labelled as an example, not a live computation.

import Link from 'next/link'

export default function CalculatorPreview() {
  return (
    <div style={{ position: 'relative', background: 'var(--paper)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--sh-lg)' }}>

      {/* Header — matches the real Calculator's header chrome */}
      <div style={{ padding: '28px 32px 22px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg,var(--teal-xl),var(--paper))' }}>
        <div style={{ fontSize: 11, color: 'var(--teal-d)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Step 1 of your GrowPath
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 5 }}>Earning Gap Calculator</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Here's what your result looks like — example shown below</div>
      </div>

      {/* Blurred example result */}
      <div style={{ filter: 'blur(4px)', opacity: 0.75, pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ padding: '24px 32px 28px' }}>

          <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-lg)', padding: 28, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Your annual earning gap</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 1 }}>₹6.8L</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 7 }}>27% more than your current salary · every year</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-md)', padding: 13 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 5 }}>Current CTC</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>₹18.0L/yr</div>
            </div>
            <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-md)', padding: 13 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 5 }}>Your market value</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--teal)' }}>₹24.8L/yr</div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Why this gap exists — AI analysis</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>You're earning below market median for your city and premium skill set…</div>
          </div>
        </div>
      </div>

      {/* CTA overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
        background: 'linear-gradient(180deg, rgba(250,247,240,0) 0%, rgba(250,247,240,0.85) 35%, rgba(250,247,240,0.97) 100%)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 8, maxWidth: 360 }}>
          See your real Earning Gap
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 340, lineHeight: 1.6, marginBottom: 20 }}>
          Create a free account and answer a few questions about your role — we'll calculate your actual gap against real market data.
        </p>
        <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--teal)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '14px 30px', borderRadius: 99, textDecoration: 'none', boxShadow: '0 4px 16px rgba(14,122,90,0.22)' }}>
          Calculate my Earning Gap — free →
        </Link>
        <span style={{ fontSize: 11, color: 'var(--muted-l)', marginTop: 10 }}>No credit card · 2 minutes</span>
      </div>
    </div>
  )
}
