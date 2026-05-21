import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

function fmt(n: number | null | undefined): string {
  if (!n) return '—'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  return '₹' + n.toLocaleString('en-IN')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('id', user.id)
    .single()

  const { data: dna } = await supabase
    .from('grow_dna')
    .select('earning_gap, target_salary, hrs_score, months_to_close, role, city, career_archetype, current_salary')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: sessions } = await supabase
    .from('interview_sessions')
    .select('id, overall_score, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const name = profile?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const hasGap = !!dna

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, {name} 👋</h1>
          <p className="dash-sub">
            {hasGap
              ? `Your gap is ${fmt(dna.earning_gap)}/yr — let's close it.`
              : 'Complete your GrowDNA profile to reveal your Earning Gap.'}
          </p>
        </div>
        {profile?.plan === 'free' && (
          <Link href="/settings" className="dash-upgrade-btn">
            ⚡ Upgrade to Grow
          </Link>
        )}
      </div>

      {/* No DNA yet — onboarding CTA */}
      {!hasGap && (
        <div className="dash-onboard">
          <div className="dash-onboard-inner">
            <div className="dash-onboard-ico">🧬</div>
            <h2>Discover your Earning Gap</h2>
            <p>Answer 10 quick questions. Our AI will calculate your exact gap in rupees and build your personalised GrowPath.</p>
            <Link href="/growdna" className="btn-primary-app">
              Start GrowDNA Assessment →
            </Link>
          </div>
        </div>
      )}

      {/* Has DNA — main dashboard */}
      {hasGap && (
        <>
          {/* Top stat cards */}
          <div className="dash-stats">
            <div className="dash-stat-card gap-card">
              <div className="stat-label">Annual Earning Gap</div>
              <div className="stat-value gap-value">{fmt(dna.earning_gap)}</div>
              <div className="stat-sub">per year left on the table</div>
              <div className="stat-footer">
                <span>Target: {fmt(dna.target_salary)}/yr</span>
                <Link href="/gap" className="stat-link">View details →</Link>
              </div>
            </div>

            <div className="dash-stat-card hrs-card">
              <div className="stat-label">Hiring Readiness Score</div>
              <div className="stat-value hrs-value">{dna.hrs_score ?? '—'}<span className="stat-denom">/1000</span></div>
              <div className="hrs-bar-wrap">
                <div className="hrs-bar-track">
                  <div
                    className="hrs-bar-fill"
                    style={{ width: `${Math.min(100, ((dna.hrs_score ?? 0) / 1000) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="stat-sub">
                {(dna.hrs_score ?? 0) < 400 ? 'Needs work — start interview practice'
                  : (dna.hrs_score ?? 0) < 700 ? 'Getting there — keep practising'
                  : 'Strong — you\'re close to market-ready'}
              </div>
            </div>

            <div className="dash-stat-card timeline-card">
              <div className="stat-label">Gap Closes In</div>
              <div className="stat-value">{dna.months_to_close ?? '—'}<span className="stat-denom"> mo</span></div>
              <div className="stat-sub">at your current trajectory</div>
              <div className="stat-footer">
                <span className="archetype-tag">{dna.career_archetype ?? 'Complete DNA'}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="dash-section-title">Continue your GrowPath</div>
          <div className="dash-actions">
            <Link href="/interview" className="action-card">
              <div className="action-ico">🎯</div>
              <div className="action-body">
                <div className="action-title">AI Interview Practice</div>
                <div className="action-desc">Boost your HRS score with a mock interview session</div>
              </div>
              <div className="action-arrow">→</div>
            </Link>

            <Link href="/cv" className="action-card">
              <div className="action-ico">📄</div>
              <div className="action-body">
                <div className="action-title">CV Builder & ATS Scorer</div>
                <div className="action-desc">Score your CV against real job descriptions</div>
              </div>
              <div className="action-arrow">→</div>
            </Link>

            <Link href={profile?.plan === 'free' ? '/settings' : '/growpath'} className={`action-card${profile?.plan === 'free' ? ' locked' : ''}`}>
              <div className="action-ico">🗺️</div>
              <div className="action-body">
                <div className="action-title">GrowPath Roadmap {profile?.plan === 'free' && <span className="action-lock-badge">Grow+</span>}</div>
                <div className="action-desc">Your month-by-month plan to close the gap</div>
              </div>
              <div className="action-arrow">→</div>
            </Link>
          </div>

          {/* Recent interview sessions */}
          {sessions && sessions.length > 0 && (
            <>
              <div className="dash-section-title">Recent Practice Sessions</div>
              <div className="dash-sessions">
                {sessions.map(s => (
                  <div key={s.id} className="session-row">
                    <div className="session-ico">🎯</div>
                    <div className="session-body">
                      <div className="session-title">Mock Interview</div>
                      <div className="session-date">{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <div className={`session-score ${(s.overall_score ?? 0) >= 70 ? 'good' : (s.overall_score ?? 0) >= 50 ? 'ok' : 'low'}`}>
                      {s.overall_score ?? '—'}/100
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}