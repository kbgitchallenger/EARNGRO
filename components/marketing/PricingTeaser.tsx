import Link from 'next/link'

const PLANS = [
  { name: 'Free', price: '₹0', tag: '300 credits, one-time' },
  { name: 'Grow', price: '₹99', tag: '1,500 credits/month', highlight: true },
  { name: 'Accelerate', price: '₹299', tag: '5,000 credits/month' },
]

export default function PricingTeaser() {
  return (
    <section style={{ padding: '72px 24px', background: 'var(--paper-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 32 }}>
          Simple plans, real value
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 28 }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: p.highlight ? 'var(--teal)' : 'var(--paper)', border: p.highlight ? 'none' : '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '22px 18px' }}>
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