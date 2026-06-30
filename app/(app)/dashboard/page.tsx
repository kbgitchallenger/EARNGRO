import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HRSBar from '@/components/dashboard/HRSBar'
import ChangeNarrativeCard from '@/components/shared/ChangeNarrativeCard'
import { getChangeNarrative } from '@/lib/growdna/changeNarrative'

function fmt(n: number | null | undefined): string {
  if (!n) return '—'
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  return '₹' + n.toLocaleString('en-IN')
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function hrsLabel(score: number): string {
  if (score >= 800) return 'Elite — top 10% of candidates'
  if (score >= 600) return 'Market ready — keep pushing'
  if (score >= 400) return 'Getting there — keep practising'
  return 'Needs work — start interview practice'
}

function hrsColor(score: number): string {
  if (score >= 700) return 'var(--teal)'
  if (score >= 400) return 'var(--amber)'
  return 'var(--red)'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: dnaAttempts }, { data: cvData }] = await Promise.all([
    supabase.from('profiles').select('full_name, plan').eq('id', user.id).single(),
    supabase.from('grow_dna')
      .select('earning_gap, target_salary, hrs_score, months_to_close, role, city, career_archetype, current_salary, created_at, dimension_scores')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2),
    supabase.from('cv_versions')
      .select('id, market_score, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Reliable name fallback
  const rawName = profile?.full_name || user.email?.split('@')[0] || 'there'
  const name = rawName.split(' ')[0]
  const plan = profile?.plan ?? 'free'

  const dna = dnaAttempts?.[0]
  const prevDna = dnaAttempts?.[1]
  const hasGap = !!dna

  const changeNarrative = dna && prevDna ? getChangeNarrative(dna, prevDna) : null
  const hasRecentPositiveMove = !!changeNarrative?.isCelebration

  return (
    <div className="dashboard">

      {/* ── HEADER ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">
            {getGreeting()}, {name} 👋
          </h1>
          <p className="dash-sub">
            {hasGap
              ? `Your gap is ${fmt(dna.earning_gap)}/yr — let's close it.`
              : 'Complete your GrowDNA to reveal your Earning Gap.'}
          </p>
        </div>
        {plan === 'free' && (
          <Link href="/settings" className="dash-upgrade-btn">
            ⚡ Upgrade to Grow
          </Link>
        )}
      </div>

      {/* ── NO DNA — ONBOARDING ── */}
      {!hasGap && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Primary CTA */}
          <div style={{ background: 'linear-gradient(135deg, var(--teal-d), var(--teal))', borderRadius: 'var(--r-xl)', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, background: 'rgba(232,146,42,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🧬</div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 600, color: '#fff', marginBottom: 10 }}>
                Discover your Earning Gap
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 460, marginBottom: 24 }}>
                10 questions · 4 minutes · Your exact gap in rupees, your career archetype, and a personalised AI roadmap to close it.
              </p>
              <Link href="/growdna" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--teal-d)', fontSize: 14, fontWeight: 700, padding: '12px 26px', borderRadius: 99, textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                Start GrowDNA Assessment →
              </Link>
            </div>
          </div>

          {/* What you'll get */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
            {[
              { ico: '💰', t: 'Your Earning Gap', d: 'Exact rupee amount you leave on the table every year' },
              { ico: '🧬', t: 'Career Archetype', d: 'Your unique career profile and market positioning' },
              { ico: '📊', t: 'HRS Score', d: 'Hiring Readiness Score benchmarked against peers' },
              { ico: '🗺️', t: 'GrowPath', d: 'Month-by-month roadmap to your target salary' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px 14px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.ico}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{item.t}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HAS DNA — MAIN DASHBOARD ── */}
      {hasGap && (
        <>
          {/* Welcome-back narrative — the first thing a returning user sees */}
          {changeNarrative && (
            <ChangeNarrativeCard narrative={changeNarrative} attemptId={dna.created_at} compact />
          )}

          {/* Profile context strip */}
          {(dna.role || dna.city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {dna.career_archetype && (
                <span style={{ fontSize: 12, fontWeight: 600, background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', color: 'var(--teal-d)', padding: '4px 12px', borderRadius: 99 }}>
                  {dna.career_archetype}
                </span>
              )}
              {dna.role && (
                <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--paper-2)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 99 }}>
                  {dna.role}
                </span>
              )}
              {dna.city && (
                <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--paper-2)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 99 }}>
                  📍 {dna.city}
                </span>
              )}
              <Link href="/growdna" style={{ fontSize: 11, color: 'var(--teal)', textDecoration: 'none', marginLeft: 'auto' }}>
                Retake assessment →
              </Link>
            </div>
          )}

          {/* Stat cards */}
          <div className="dash-stats">

            {/* Earning Gap */}
            <div className="dash-stat-card gap-card">
              <div className="stat-label">Annual Earning Gap</div>
              <div className="stat-value gap-value">{fmt(dna.earning_gap)}</div>
              <div className="stat-sub">per year left on the table</div>
              <div style={{ margin: '12px 0', height: 1, background: 'var(--border-l)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Current</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{fmt(dna.current_salary)}/yr</div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--border)' }}>→</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Target</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>{fmt(dna.target_salary)}/yr</div>
                </div>
              </div>
              <div className="stat-footer" style={{ marginTop: 12 }}>
                <Link href="/gap" className="stat-link">View full analysis →</Link>
              </div>
            </div>

            {/* HRS Score — animated, with live pulse on recent positive movement */}
            <div className="dash-stat-card hrs-card" style={{ position: 'relative' }}>
              {hasRecentPositiveMove && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--teal)', flexShrink: 0,
                    animation: 'hrsPulseDot 2s ease-in-out infinite',
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Trending up
                  </span>
                </div>
              )}
              <div className="stat-label">Hiring Readiness Score</div>
              <div className="stat-value hrs-value" style={{ color: hrsColor(dna.hrs_score ?? 0) }}>
                {dna.hrs_score ?? '—'}
                <span className="stat-denom">/1000</span>
              </div>
              <HRSBar score={dna.hrs_score ?? 0} />
              <div className="stat-sub" style={{ marginTop: 8 }}>
                {hrsLabel(dna.hrs_score ?? 0)}
              </div>
              {hasRecentPositiveMove && (
                <style>{`
                  @keyframes hrsPulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.4); }
                  }
                `}</style>
              )}
            </div>

            {/* Timeline */}
            <div className="dash-stat-card timeline-card">
              <div className="stat-label">Gap Closes In</div>
              <div className="stat-value">
                {dna.months_to_close ?? '—'}
                <span className="stat-denom"> mo</span>
              </div>
              <div className="stat-sub">at your current trajectory</div>
              <div style={{ margin: '12px 0', height: 1, background: 'var(--border-l)' }} />
              {/* Mini timeline dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                {Array.from({ length: Math.min(dna.months_to_close ?? 12, 12) }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < 3 ? 'var(--teal)' : 'var(--border)', transition: 'background 0.3s' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {dna.months_to_close ? `${Math.round((3 / dna.months_to_close) * 100)}% into your journey` : 'Start your GrowPath'}
              </div>
            </div>

          </div>

          {/* CV score strip — if CV uploaded */}
          {cvData?.market_score && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>📄</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{cvData.name ?? 'Resume'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>ATS market score</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: cvData.market_score >= 70 ? 'var(--teal)' : cvData.market_score >= 45 ? 'var(--amber)' : 'var(--red)' }}>
                  {cvData.market_score}
                </div>
                <Link href={`/cv/analysis/${cvData.id}`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', padding: '5px 12px', borderRadius: 99 }}>
                  View report →
                </Link>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="dash-section-title" style={{ marginTop: 8 }}>Continue your GrowPath</div>
          <div className="dash-actions">

            <Link href="/cv" className="action-card">
              <div className="action-ico">📄</div>
              <div className="action-body">
                <div className="action-title">CV Builder & ATS Scorer</div>
                <div className="action-desc">Score your CV against real job descriptions</div>
              </div>
              <div className="action-arrow">→</div>
            </Link>
            <Link href="/interview" className="action-card" style={{ borderTop: '3px solid var(--teal)' }}>
              <div className="action-ico">🎯</div>
              <div className="action-body">
                <div className="action-title">AI Interview Practice</div>
                <div className="action-desc">Boost your HRS score with a mock interview session</div>
              </div>
              <div className="action-arrow">→</div>
            </Link>

            <Link
              href={plan === 'free' ? '/settings' : '/growpath'}
              className={`action-card${plan === 'free' ? ' locked' : ''}`}
            >
              <div className="action-ico">🗺️</div>
              <div className="action-body">
                <div className="action-title">
                  GrowPath Roadmap{' '}
                  {plan === 'free' && <span className="action-lock-badge">Grow+</span>}
                </div>
                <div className="action-desc">Your month-by-month plan to close the gap</div>
              </div>
              <div className="action-arrow">→</div>
            </Link>

          </div>

          {/* Gap motivation footer */}
          <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginTop: 4, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 32, flexShrink: 0 }}>💡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-d)', marginBottom: 3 }}>
                Every week you wait costs you {fmt(Math.round((dna.earning_gap ?? 0) / 52))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                Professionals who practice interview skills weekly close their gap 3x faster.
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  )
}