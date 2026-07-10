export const revalidate = 30

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
  if (score >= 800) return 'Elite — top 10%'
  if (score >= 600) return 'Market ready'
  if (score >= 400) return 'Getting there'
  return 'Needs work'
}

function hrsColor(score: number): string {
  if (score >= 700) return 'var(--teal)'
  if (score >= 400) return 'var(--amber)'
  return 'var(--red)'
}

function chsColor(score: number): string {
  if (score >= 70) return 'var(--teal)'
  if (score >= 40) return 'var(--amber)'
  return 'var(--red)'
}

function chsLabel(score: number): string {
  if (score >= 70) return 'Strong momentum'
  if (score >= 40) return 'Building momentum'
  return 'Just getting started'
}

function interviewColor(score: number): string {
  if (score >= 70) return 'var(--teal)'
  if (score >= 50) return 'var(--amber)'
  return 'var(--red)'
}

// Determines the single most important action for this user right now
function getNextMove(params: {
  hrsScore: number | null
  cvScore: number | null
  interviewScore: number | null
  hasGrowPath: boolean
  hasDna: boolean
}): { icon: string; title: string; desc: string; href: string; urgent: boolean } {
  if (!params.hasDna) {
    return { icon: '🧬', title: 'Start your GrowDNA assessment', desc: 'Discover your exact earning gap in 4 minutes', href: '/growdna', urgent: true }
  }
  if (!params.cvScore) {
    return { icon: '📄', title: 'Upload your CV for ATS analysis', desc: 'Find out how your resume scores against real job requirements', href: '/cv', urgent: true }
  }
  if (params.interviewScore !== null && params.interviewScore < 50) {
    return { icon: '🎯', title: 'Practice your interview skills', desc: `Your last interview scored ${params.interviewScore}/100 — a 10-point improvement closes your gap 2× faster`, href: '/interview', urgent: true }
  }
  if (params.hrsScore !== null && params.hrsScore < 400) {
    return { icon: '🎯', title: 'Book an AI interview session', desc: 'Your HRS is below 400 — interview practice is your fastest lever right now', href: '/interview', urgent: false }
  }
  if (params.cvScore !== null && params.cvScore < 60) {
    return { icon: '📄', title: 'Improve your CV score', desc: `CV scoring ${params.cvScore}/100 — apply the AI suggestions to reach 70+`, href: '/cv', urgent: false }
  }
  return { icon: '🗺️', title: 'Check your GrowPath milestones', desc: 'You\'re on track — see what\'s next on your roadmap', href: '/gap', urgent: false }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: dnaAttempts },
    { data: cvData },
    { data: chs },
    { data: latestInterview },
  ] = await Promise.all([
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
    supabase.from('career_health_scores')
      .select('score, computed_at')
      .eq('user_id', user.id)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('interview_sessions')
      .select('id, overall_score, mode, created_at, status')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const rawName = profile?.full_name || user.email?.split('@')[0] || 'there'
  const name = rawName.split(' ')[0]
  const plan = profile?.plan ?? 'free'

  const dna = dnaAttempts?.[0]
  const prevDna = dnaAttempts?.[1]
  const hasGap = !!dna

  const changeNarrative = dna && prevDna ? getChangeNarrative(dna, prevDna) : null
  const hasRecentPositiveMove = !!changeNarrative?.isCelebration

  const nextMove = getNextMove({
    hrsScore: dna?.hrs_score ?? null,
    cvScore: cvData?.market_score ?? null,
    interviewScore: latestInterview?.overall_score ?? null,
    hasGrowPath: false,
    hasDna: hasGap,
  })

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
          <Link href="/pricing" className="dash-upgrade-btn">
            ⚡ Upgrade to Grow
          </Link>
        )}
      </div>

      {/* ── NO DNA — ONBOARDING ── */}
      {!hasGap && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--teal-d), var(--teal))', borderRadius: 'var(--r-xl)', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
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

      {/* ── HAS DNA — COMMAND CENTER ── */}
      {hasGap && (
        <>
          {/* Change narrative */}
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

          {/* ── YOUR MOVE TODAY — Command Center primary CTA ── */}
          <Link href={nextMove.href} style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}>
            <div style={{
              background: nextMove.urgent
                ? 'linear-gradient(135deg, var(--teal-d), var(--teal))'
                : 'var(--paper)',
              border: nextMove.urgent ? 'none' : '1.5px solid var(--teal-mid)',
              borderRadius: 'var(--r-xl)',
              padding: '18px 22px',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: nextMove.urgent ? '0 4px 20px rgba(14,122,90,0.2)' : 'none',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--r-lg)', flexShrink: 0,
                background: nextMove.urgent ? 'rgba(255,255,255,0.15)' : 'var(--teal-l)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {nextMove.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: nextMove.urgent ? 'rgba(255,255,255,0.6)' : 'var(--teal)', marginBottom: 4 }}>
                  Your move today
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: nextMove.urgent ? '#fff' : 'var(--ink)', marginBottom: 3 }}>
                  {nextMove.title}
                </div>
                <div style={{ fontSize: 12, color: nextMove.urgent ? 'rgba(255,255,255,0.7)' : 'var(--muted)', lineHeight: 1.4 }}>
                  {nextMove.desc}
                </div>
              </div>
              <div style={{ fontSize: 20, color: nextMove.urgent ? 'rgba(255,255,255,0.6)' : 'var(--teal)', flexShrink: 0 }}>→</div>
            </div>
          </Link>

          {/* ── STAT CARDS — 4-column on desktop, 2×2 on tablet, 1-col on mobile ── */}
          <div className="dash-stats-grid">

            {/* 1. Earning Gap */}
            <div className="dash-stat-card dashboard-kpi">
              <div className="stat-label">Annual Gap</div>
              <div className="stat-value gap-value">{fmt(dna.earning_gap)}</div>
              <div className="stat-sub">per year</div>
              <div style={{ margin: '10px 0', height: 1, background: 'var(--border-l)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
                <span>{fmt(dna.current_salary)}</span>
                <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{fmt(dna.target_salary)}</span>
              </div>
              <div className="stat-footer" style={{ marginTop: 10 }}>
                <Link href="/gap" className="stat-link">Full analysis →</Link>
              </div>
            </div>

            {/* 2. HRS Score */}
            <div className="dash-stat-card dashboard-kpi" style={{ position: 'relative' }}>
              {hasRecentPositiveMove && (
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', animation: 'hrsPulseDot 2s ease-in-out infinite', display: 'inline-block' }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Up</span>
                </div>
              )}
              <div className="stat-label">HRS Score</div>
              <div className="stat-value" style={{ color: hrsColor(dna.hrs_score ?? 0) }}>
                {dna.hrs_score ?? '—'}
                <span className="stat-denom">/1000</span>
              </div>
              <HRSBar score={dna.hrs_score ?? 0} />
              <div className="stat-sub" style={{ marginTop: 6 }}>
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

            {/* 3. Interview Score — NEW in command center */}
            <div className="dash-stat-card dashboard-kpi" style={{ borderTop: `3px solid ${latestInterview?.overall_score ? interviewColor(latestInterview.overall_score) : 'var(--border)'}` }}>
              <div className="stat-label">Last Interview</div>
              {latestInterview?.overall_score ? (
                <>
                  <div className="stat-value" style={{ color: interviewColor(latestInterview.overall_score) }}>
                    {latestInterview.overall_score}
                    <span className="stat-denom">/100</span>
                  </div>
                  <div className="stat-sub" style={{ marginTop: 4, textTransform: 'capitalize' }}>
                    {latestInterview.mode} · {new Date(latestInterview.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="stat-footer" style={{ marginTop: 10 }}>
                    <Link href={`/interview/${latestInterview.id}`} className="stat-link">View report →</Link>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--muted-l)', marginBottom: 4 }}>—</div>
                  <div className="stat-sub">No sessions yet</div>
                  <div className="stat-footer" style={{ marginTop: 10 }}>
                    <Link href="/interview" className="stat-link">Start practising →</Link>
                  </div>
                </>
              )}
            </div>

            {/* 4. Gap closes / Career Health */}
            {chs ? (
              <div className="dash-stat-card dashboard-kpi" style={{ borderTop: `3px solid ${chsColor(chs.score)}` }}>
                <div className="stat-label">Career Health</div>
                <div className="stat-value" style={{ color: chsColor(chs.score) }}>
                  {chs.score}
                  <span className="stat-denom">/100</span>
                </div>
                <div className="stat-sub" style={{ marginTop: 4 }}>{chsLabel(chs.score)}</div>
                <div style={{ margin: '10px 0', height: 1, background: 'var(--border-l)' }} />
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>From GrowPath milestones</div>
              </div>
            ) : (
              <div className="dash-stat-card dashboard-kpi">
                <div className="stat-label">Gap Closes In</div>
                <div className="stat-value">
                  {dna.months_to_close ?? '—'}
                  <span className="stat-denom"> mo</span>
                </div>
                <div className="stat-sub">at current trajectory</div>
                <div style={{ margin: '10px 0', height: 1, background: 'var(--border-l)' }} />
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {Array.from({ length: Math.min(dna.months_to_close ?? 12, 12) }, (_, i) => (
                    <div key={i} style={{ flex: 1, minWidth: 6, height: 4, borderRadius: 99, background: i < 3 ? 'var(--teal)' : 'var(--border)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                  {dna.months_to_close ? `${Math.round((3 / dna.months_to_close) * 100)}% into your journey` : 'Start your GrowPath'}
                </div>
              </div>
            )}
          </div>


          {/* CV score strip */}
          {cvData?.market_score && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 22 }}>📄</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{cvData.name ?? 'Resume'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>ATS market score</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: cvData.market_score >= 70 ? 'var(--teal)' : cvData.market_score >= 45 ? 'var(--amber)' : 'var(--red)' }}>
                  {cvData.market_score}
                </div>
                <Link href={`/cv/analysis/${cvData.id}`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', textDecoration: 'none', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', padding: '5px 12px', borderRadius: 99 }}>
                  View report →
                </Link>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="dash-section-title" style={{ marginTop: 4 }}>Continue your GrowPath</div>
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
              href={plan === 'free' ? '/pricing' : '/growpath'}
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

          {/* Motivation footer */}
          <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginTop: 4, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>💡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-d)', marginBottom: 3 }}>
                Every week you wait costs you {fmt(Math.round((dna.earning_gap ?? 0) / 52))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                Professionals who practise interview skills weekly close their gap 3× faster.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}