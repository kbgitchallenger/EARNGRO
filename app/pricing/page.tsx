import Link from 'next/link'

export const metadata = { title: 'Pricing — EarnGro' }

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    tagline: 'Get your real number, no strings attached',
    features: [
      '1 complete GrowDNA assessment — fully unlocked',
      '1 complete CV analysis — fully unlocked',
      'Unlimited Earning Gap Calculator',
      'See your full results, every time',
    ],
    cta: 'Current plan',
    highlight: false,
  },
  {
    name: 'Grow',
    price: '₹99',
    originalPrice: '₹199',
    period: '/month',
    tagline: 'For people actively closing their gap',
    features: [
      'Unlimited GrowDNA retakes',
      'Up to 5 CV versions with full analysis',
      'AI Interview practice',
      'Progress tracking & change narratives',
      'Priority support',
    ],
    cta: 'Upgrade to Grow',
    highlight: true,
    badge: '50% off — limited time',
  },
  {
    name: 'Accelerate',
    price: '₹499',
    period: '/month',
    tagline: 'For serious career builders',
    features: [
      'Everything in Grow, unlimited',
      'Full GrowPath roadmap',
      'Unlimited CV versions',
      'Priority AI processing',
      'Add extra credits anytime — ₹99 / 1000 credits',
    ],
    cta: 'Upgrade to Accelerate',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>
          Simple pricing, real value
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
          Start free with a complete, unlocked result. Upgrade when you're ready to keep tracking and closing your gap.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {PLANS.map(plan => (
          <div
            key={plan.name}
            style={{
              background: plan.highlight ? 'linear-gradient(135deg, var(--teal-d), var(--teal))' : 'var(--paper)',
              border: plan.highlight ? 'none' : '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              padding: '28px 24px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute', top: -12, right: 20,
                background: 'var(--amber)', color: '#fff', fontSize: 11, fontWeight: 700,
                padding: '4px 12px', borderRadius: 99,
              }}>
                {plan.badge}
              </div>
            )}

            <div style={{ fontSize: 16, fontWeight: 700, color: plan.highlight ? '#fff' : 'var(--ink)', marginBottom: 4 }}>
              {plan.name}
            </div>
            <div style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--muted)', marginBottom: 16 }}>
              {plan.tagline}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
              {plan.originalPrice && (
                <span style={{ fontSize: 16, color: plan.highlight ? 'rgba(255,255,255,0.5)' : 'var(--muted-l)', textDecoration: 'line-through' }}>
                  {plan.originalPrice}
                </span>
              )}
              <span style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 700, color: plan.highlight ? '#fff' : 'var(--ink)' }}>
                {plan.price}
              </span>
              <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
                {plan.period}
              </span>
            </div>

            <div style={{ flex: 1, marginBottom: 24 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.9)' : 'var(--ink)', lineHeight: 1.5 }}>
                  <span style={{ color: plan.highlight ? '#fff' : 'var(--teal)', flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>

            <Link
              href={plan.name === 'Free' ? '/dashboard' : '/settings/billing'}
              style={{
                display: 'block', textAlign: 'center',
                background: plan.highlight ? '#fff' : 'var(--teal)',
                color: plan.highlight ? 'var(--teal-d)' : '#fff',
                fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 99,
                textDecoration: 'none',
              }}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: 'var(--muted)' }}>
        Need more credits on Accelerate? Add ₹99 for 1000 extra credits anytime, no plan change needed.
      </div>
    </div>
  )
}