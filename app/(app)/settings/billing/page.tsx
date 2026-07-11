export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTransactionHistory, getFeatureLabel } from '@/services/credits.service'
import CheckoutButton from '@/components/billing/CheckoutButton'

export const metadata = { title: 'Billing & Usage — EarnGro' }

const PLAN_META: Record<string, { label: string; color: string; credits: number }> = {
  free:       { label: 'Free',       color: 'var(--muted)', credits: 300 },
  grow:       { label: 'Grow',       color: '#6D28D9',      credits: 1500 },
  accelerate: { label: 'Accelerate', color: 'var(--teal-d)', credits: 5000 },
}

const UPGRADE_OPTIONS = [
  {
    plan: 'grow',
    name: 'Grow',
    price: '₹99',
    originalPrice: '₹199',
    period: '/month',
    credits: '1,500 credits / 30 days',
    perks: ['Full CV Analysis', 'GrowPath roadmap', 'Unlimited GrowDNA retakes'],
  },
  {
    plan: 'accelerate',
    name: 'Accelerate',
    price: '₹299',
    originalPrice: '₹399',
    period: '/month',
    credits: '5,000 credits / 30 days',
    perks: ['Everything in Grow', 'AI Interview Arena', 'Priority AI processing'],
  },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_balance, credits_reset_at')
    .eq('id', user.id)
    .single()

  const currentPlan = profile?.plan ?? 'free'

  const { data: planConfig } = await supabase
    .from('plan_credits_config')
    .select('monthly_credits')
    .eq('plan', currentPlan)
    .single()

  // Real subscription record, if one exists yet — will be null until
  // Razorpay is actually wired in and a payment has gone through.
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end, gateway_plan_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const history = await getTransactionHistory(user.id, 20)

  const meta = PLAN_META[currentPlan] ?? PLAN_META.free
  const monthlyAllowance = planConfig?.monthly_credits ?? meta.credits
  const balance = profile?.credits_balance ?? 0
  const usedPct = monthlyAllowance > 0 ? Math.min(100, Math.round(((monthlyAllowance - balance) / monthlyAllowance) * 100)) : 0
  const remainingPct = 100 - usedPct
  const isLow = balance / monthlyAllowance <= 0.2

  const renewalLabel = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : currentPlan === 'free'
      ? 'Free plan — credits are one-time, no renewal'
      : 'No active subscription on file yet'

  const upgradesToShow = UPGRADE_OPTIONS.filter(o => o.plan !== currentPlan)

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
        Billing & Usage
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
        Everything about your plan, credits, and past activity — in one place.
      </p>

      {/* Plan + usage card */}
      <div style={{ background: 'linear-gradient(135deg, var(--teal-d), var(--teal))', borderRadius: 'var(--r-xl)', padding: '24px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Current plan
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: '#fff' }}>
              {meta.label}
            </div>
          </div>
          {currentPlan === 'free' && (
            <Link href="/pricing" style={{ background: '#fff', color: 'var(--teal-d)', fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 99, textDecoration: 'none' }}>
              Upgrade →
            </Link>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 18 }}>
          {currentPlan === 'free' ? renewalLabel : `Renews ${renewalLabel}`}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            <span>Credits this cycle</span>
            <span style={{ fontWeight: 700 }}>{balance.toLocaleString('en-IN')} / {monthlyAllowance.toLocaleString('en-IN')} remaining</span>
          </div>
          <div style={{ height: 9, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: isLow ? '#FBBF24' : '#fff', width: `${remainingPct}%`, borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
          {isLow && (
            <div style={{ fontSize: 11.5, color: '#FEF3C7', marginTop: 8 }}>
              Running low — {currentPlan === 'free' ? 'upgrade for a fresh monthly pool' : 'add credits below to avoid interruptions'}.
            </div>
          )}
        </div>
      </div>

      {/* Upgrade options — shown directly, not just linked out, so the
          next step is one click away rather than a navigation away. */}
      {upgradesToShow.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>
            {currentPlan === 'free' ? 'Upgrade your plan' : 'Other plans'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${upgradesToShow.length}, 1fr)`, gap: 12 }}>
            {upgradesToShow.map(opt => (
              <div key={opt.plan} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{opt.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted-l)', textDecoration: 'line-through' }}>{opt.originalPrice}</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{opt.price}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{opt.period}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--teal-d)', fontWeight: 600, marginBottom: 10 }}>{opt.credits}</div>
                {opt.perks.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>
                    <span style={{ color: 'var(--teal)', flexShrink: 0 }}>✓</span>{p}
                  </div>
                ))}
                <CheckoutButton
                  type="plan_upgrade"
                  planKey={opt.plan}
                  label={`Upgrade to ${opt.name} →`}
                  style={{ marginTop: 10 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage history */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Usage history</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Last 20 activities</div>
        </div>

        {history.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '30px 0' }}>
            No activity yet — your first GrowDNA assessment or CV analysis will show up here.
          </div>
        )}

        {history.map((tx, i) => {
          const isCredit = tx.credits_used < 0 ? false : true // positive = added (reset/purchase), negative = spent
          const isSpend = tx.credits_used < 0
          return (
            <div
              key={tx.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < history.length - 1 ? '1px solid var(--border-l)' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                  {getFeatureLabel(tx.feature)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}Balance after: {tx.balance_after.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: isSpend ? 'var(--muted)' : 'var(--teal)',
              }}>
                {isSpend ? `−${Math.abs(tx.credits_used)}` : `+${tx.credits_used}`}
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
        Every credit maps to real AI processing cost — nothing here is inflated or hidden.
        Questions about a charge? Reach out anytime.
      </p>
    </div>
  )
}