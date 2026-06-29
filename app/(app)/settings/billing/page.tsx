export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTransactionHistory, getFeatureLabel } from '@/services/credits.service'

export const metadata = { title: 'Billing & Usage — EarnGro' }

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_balance, credits_reset_at')
    .eq('id', user.id)
    .single()

  const { data: planConfig } = await supabase
    .from('plan_credits_config')
    .select('monthly_credits')
    .eq('plan', profile?.plan ?? 'free')
    .single()

  const history = await getTransactionHistory(user.id, 20)

  const monthlyAllowance = planConfig?.monthly_credits ?? 300
  const balance = profile?.credits_balance ?? 0
  const usedPct = monthlyAllowance > 0 ? Math.min(100, Math.round(((monthlyAllowance - balance) / monthlyAllowance) * 100)) : 0

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
        Billing & Usage
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
        Your current plan and how you've used your monthly allowance
      </p>

      {/* Plan card */}
      <div style={{ background: 'linear-gradient(135deg, var(--teal-d), var(--teal))', borderRadius: 'var(--r-xl)', padding: '24px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Current plan
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
              {profile?.plan ?? 'Free'}
            </div>
          </div>
          {(profile?.plan ?? 'free') === 'free' && (
            <Link href="/pricing" style={{ background: '#fff', color: 'var(--teal-d)', fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 99, textDecoration: 'none' }}>
              Upgrade →
            </Link>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            <span>This month's usage</span>
            <span>{balance} / {monthlyAllowance} remaining</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#fff', width: `${100 - usedPct}%`, borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>

      {/* Usage history */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Usage history</div>

        {history.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>
            No activity yet
          </div>
        )}

        {history.map((tx, i) => {
          const isReset = tx.credits_used > 0
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
                </div>
              </div>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: isReset ? 'var(--teal)' : 'var(--muted)',
              }}>
                {isReset ? '✓ Included' : 'Used'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}