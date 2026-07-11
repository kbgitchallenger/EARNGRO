import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CheckoutButton from '@/components/billing/CheckoutButton'

export const metadata = { title: 'Pricing — EarnGro' }

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    tagline: 'Get your real number, no strings attached',
    credits: '300 credits — one-time',
    features: [
      '1 complete GrowDNA assessment',
      '1 CV parse & profile extraction',
      'Up to 5 AI bullet-point optimizations',
      'Your full result, no paywalled sections',
    ],
    highlight: false,
  },
  {
    key: 'grow',
    name: 'Grow',
    price: '₹99',
    originalPrice: '₹199',
    period: '/month',
    tagline: 'For people actively closing their gap',
    credits: '1,500 credits — refresh every 30 days',
    features: [
      'Everything in Free',
      'Full CV Analysis — ATS score, keyword gaps, market alignment',
      'GrowPath — your month-by-month roadmap',
      'Unlimited GrowDNA retakes (credit-limited)',
      'Progress tracking & change narratives',
      'Buy extra credits anytime — ₹49 / 1,000 credits',
    ],
    highlight: true,
    badge: '50% off — limited time',
  },
  {
    key: 'accelerate',
    name: 'Accelerate',
    price: '₹299',
    originalPrice: '₹399',
    period: '/month',
    tagline: 'For serious career builders',
    credits: '5,000 credits — refresh every 30 days',
    features: [
      'Everything in Grow',
      'AI Interview Arena — practice sessions with scored feedback',
      'Priority AI processing',
      'Buy extra credits anytime — ₹99 / 2,500 credits',
    ],
    highlight: false,
  },
]

export default async function PricingPage() {
  // This page is reachable both signed-out (from the marketing homepage)
  // and signed-in (from Settings/Billing) — behavior branches accordingly
  // per plan card below, since an anonymous visitor hitting the checkout
  // API directly would just get a silent 401.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: string | null = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    currentPlan = profile?.plan ?? 'free'
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Back navigation — goes to dashboard if signed in, home if not */}
      <Link
        href={user ? '/dashboard' : '/'}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', textDecoration: 'none', marginBottom: 28 }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {user ? 'Back to dashboard' : 'Back to home'}
      </Link>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>
          Simple pricing, real value
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
          Start free with a complete GrowDNA result. Upgrade when you're ready for full CV analysis, GrowPath, and AI interview practice.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.key
          const isPaidPlan = plan.key === 'grow' || plan.key === 'accelerate'

          return (
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

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
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

              <div style={{
                display: 'inline-flex', alignSelf: 'flex-start', fontSize: 11.5, fontWeight: 600,
                color: plan.highlight ? 'rgba(255,255,255,0.85)' : 'var(--teal-d)',
                background: plan.highlight ? 'rgba(255,255,255,0.12)' : 'var(--teal-l)',
                border: plan.highlight ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--teal-mid)',
                padding: '3px 10px', borderRadius: 99, marginBottom: 20,
              }}>
                {plan.credits}
              </div>

              <div style={{ flex: 1, marginBottom: 24 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.9)' : 'var(--ink)', lineHeight: 1.5 }}>
                    <span style={{ color: plan.highlight ? '#fff' : 'var(--teal)', flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              {/* ── CTA logic ──
                  1. Signed out + Free  → straight to signup
                  2. Signed out + paid  → signup, with intended plan carried
                     via query param so post-signup we know what to route to
                  3. Signed in + this is their current plan → disabled label
                  4. Signed in + Free plan card (but on a paid plan) → no
                     action, free is a downgrade, not a self-serve button
                  5. Signed in + paid plan card, different from current →
                     real CheckoutButton, actual payment */}
              {!user && plan.key === 'free' && (
                <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#fff' : 'var(--teal)', color: plan.highlight ? 'var(--teal-d)' : '#fff', fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 99, textDecoration: 'none' }}>
                  Get started free →
                </Link>
              )}

              {!user && isPaidPlan && (
                <Link href={`/signup?plan=${plan.key}`} style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#fff' : 'var(--teal)', color: plan.highlight ? 'var(--teal-d)' : '#fff', fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 99, textDecoration: 'none' }}>
                  Sign up to upgrade →
                </Link>
              )}

              {user && isCurrent && (
                <div style={{ textAlign: 'center', background: plan.highlight ? 'rgba(255,255,255,0.15)' : 'var(--paper-2)', color: plan.highlight ? '#fff' : 'var(--muted)', fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 99, border: plan.highlight ? '1px solid rgba(255,255,255,0.25)' : '1px solid var(--border)' }}>
                  Current plan
                </div>
              )}

              {user && !isCurrent && plan.key === 'free' && (
                <div style={{ textAlign: 'center', fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--muted)', padding: '12px' }}>
                  Contact support to downgrade
                </div>
              )}

              {user && !isCurrent && isPaidPlan && (
                <CheckoutButton
                  type="plan_upgrade"
                  planKey={plan.key}
                  label={`Upgrade to ${plan.name} →`}
                  style={plan.highlight ? { background: '#fff', color: 'var(--teal-d)' } : undefined}
                />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: 'var(--muted)' }}>
        Credits reset every 30 days on paid plans and don't roll over. Free plan credits are one-time only.
      </div>
    </div>
  )
}