import Link from 'next/link'

const PLANS = [
  { name: 'Free', price: '₹0', tag: '300 credits, one-time' },
  { name: 'Grow', price: '₹99', tag: '1,500 credits/month', highlight: true },
  { name: 'Accelerate', price: '₹299', tag: '5,000 credits/month' },
]

export default function PricingTeaser() {
  return (
    // FIX: background var(--paper-2) here plus var(--paper-2) again on the
    // calculator section right above it meant two back-to-back sections
    // were the same flat cream tone with nothing to separate them visually
    // except a 1px border. Lightened to a much subtler wash and let the
    // cards themselves (now white + real shadow) do the visual work.
    <section style={{ padding: '96px 24px', background: 'var(--paper-3)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 40 }}>
          Simple plans, real value
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18, marginBottom: 32 }}>
          {PLANS.map(p => (
            <div
              key={p.name}
              style={{
                background: p.highlight ? 'var(--teal)' : '#ffffff',
                border: p.highlight ? 'none' : '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                boxShadow: p.highlight ? 'var(--shadow-teal)' : 'var(--shadow-sm)',
                padding: '26px 20px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? '#fff' : 'var(--ink)', marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: p.highlight ? '#fff' : 'var(--ink)', marginBottom: 4 }}>{p.price}<span style={{ fontSize: 13, fontWeight: 400 }}>/mo</span></div>
              <div style={{ fontSize: 12, color: p.highlight ? 'rgba(255,255,255,0.75)' : 'var(--muted)' }}>{p.tag}</div>
            </div>
          ))}
        </div>
        <Link href="/pricing" style={{ fontSize: 14, fontWeight: 600, color: 'var(--teal-d)', textDecoration: 'none' }}>
          Compare full plan details →
        </Link>
      </div>
    </section>
  )
}