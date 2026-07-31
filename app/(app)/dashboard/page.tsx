export const revalidate = 30

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ChangeNarrativeCard from '@/components/shared/ChangeNarrativeCard'
import StreakCard from '@/components/dashboard/StreakCard'
import PremiumHero from '@/components/ui/PremiumHero'
import { getChangeNarrative } from '@/lib/growdna/changeNarrative'
import { getStreak } from '@/services/streaks.service'
import { getUserCompetencies } from '@/services/skillsProfile.service'

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

// Real interpretive label for each ring card — a bare number in a circle
// doesn't explain itself; this is the direct fix for "rings aren't
// informative."
function scoreInterpretation(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.8) return 'Excellent'
  if (pct >= 0.6) return 'On track'
  if (pct >= 0.4) return 'Needs focus'
  return 'Priority area'
}

function getNextMove(params: {
  hrsScore: number | null; cvScore: number | null; interviewScore: number | null; hasDna: boolean; plan: string
}): { icon: string; title: string; desc: string; href: string; urgent: boolean } {
  const canInterview = params.plan === 'accelerate'
  if (!params.hasDna) return { icon: '🧬', title: 'Start your GrowDNA assessment', desc: 'Discover your exact earning gap in 4 minutes', href: '/growdna', urgent: true }
  if (!params.cvScore) return { icon: '📄', title: 'Upload your CV for ATS analysis', desc: 'Find out how your resume scores against real job requirements', href: '/cv', urgent: true }
  if (canInterview && params.interviewScore !== null && params.interviewScore < 50) return { icon: '🎯', title: 'Practice your interview skills', desc: `Your last interview scored ${params.interviewScore}/100 — a 10-point improvement closes your gap 2× faster`, href: '/interview', urgent: true }
  if (canInterview && params.hrsScore !== null && params.hrsScore < 400) return { icon: '🎯', title: 'Book an AI interview session', desc: 'Your HRS is below 400 — interview practice is your fastest lever right now', href: '/interview', urgent: false }
  if (params.cvScore !== null && params.cvScore < 60) return { icon: '📄', title: 'Improve your CV score', desc: `CV scoring ${params.cvScore}/100 — apply the AI suggestions to reach 70+`, href: '/cv', urgent: false }
  if (!canInterview && params.hrsScore !== null && params.hrsScore < 400) return { icon: '⚡', title: 'Unlock AI Interview with Accelerate', desc: 'Interview practice is the fastest lever to close your gap — available on the Accelerate plan', href: '/pricing', urgent: false }
  return { icon: '🗺️', title: 'Check your GrowPath milestones', desc: 'You\'re on track — see what\'s next on your roadmap', href: '/growpath', urgent: false }
}

function KPIRing({ score, max, color }: { score: number; max: number; color: string }) {
  const size = 76, r = 31, circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(1, score / max)))
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 21, color }}>{score}</div>
    </div>
  )
}

// Empty-state ring — shown instead of a missing KPI card so a first-time
// user (who's only done GrowDNA) sees an inviting "go do this" slot
// rather than the grid silently shrinking to 1-2 asymmetric cards.
function EmptyRing({ label, cta, href, color }: { label: string; cta: string; href: string; color: string }) {
  return (
    <Link href={href} className="dash-kpi-card dash-kpi-empty" style={{ borderLeft: `3px solid var(--border)` }}>
      <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
        <svg width={76} height={76} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={38} cy={38} r={31} fill="none" stroke="var(--border)" strokeWidth="7" strokeDasharray="4 6" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--muted-l)' }}>—</div>
      </div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-sub" style={{ color, fontWeight: 600 }}>{cta} →</div>
      </div>
    </Link>
  )
}

// Real trajectory chart — plots actual HRS scores across every GrowDNA
// attempt on file (newest fetch = up to 6, real rows only, never
// interpolated or padded). With only 2 points it draws a clean 2-node
// line; with more history it becomes a genuine multi-point trend.
function TrajectoryChart({ points }: { points: { score: number; date: string }[] }) {
  if (points.length < 2) return null
  const w = 560, h = 140, padX = 28, padY = 24
  const max = Math.max(...points.map(p => p.score), 100)
  const min = Math.min(...points.map(p => p.score), 0)
  const range = Math.max(max - min, 1)
  const stepX = (w - padX * 2) / (points.length - 1)
  const coords = points.map((p, i) => ({
    x: padX + i * stepX,
    y: padY + (1 - (p.score - min) / range) * (h - padY * 2),
    ...p,
  }))
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${h - padY} L ${coords[0].x} ${h - padY} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="trajFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1={padX} x2={w - padX} y1={padY + f * (h - padY * 2)} y2={padY + f * (h - padY * 2)} stroke="var(--border-l)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#trajFill)" />
      <path d={linePath} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={i === coords.length - 1 ? 5.5 : 4} fill="#fff" stroke="var(--teal)" strokeWidth="2.5" />
          <text x={c.x} y={c.y - 12} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--serif)" fill="var(--teal-d)">{c.score}</text>
          <text x={c.x} y={h - 4} textAnchor="middle" fontSize="9.5" fill="var(--muted-l)">
            {new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </text>
        </g>
      ))}
    </svg>
  )
}

interface ActivityEntry { icon: string; text: string; time: string; color: string }

async function getRealActivity(userId: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<ActivityEntry[]> {
  const [{ data: dnaRuns }, { data: cvRuns }, { data: interviews }] = await Promise.all([
    supabase.from('grow_dna').select('created_at, hrs_score').eq('user_id', userId).order('created_at', { ascending: false }).limit(2),
    supabase.from('cv_versions').select('created_at, market_score, name').eq('user_id', userId).order('created_at', { ascending: false }).limit(2),
    supabase.from('interview_sessions').select('created_at, overall_score, mode').eq('user_id', userId).eq('status', 'completed').order('created_at', { ascending: false }).limit(2),
  ])
  const entries = [
    ...(dnaRuns ?? []).map(d => ({ icon: '🧬', text: `Completed GrowDNA Assessment — HRS ${d.hrs_score}/1000`, time: d.created_at, color: 'var(--purple)' })),
    ...(cvRuns ?? []).filter(c => c.market_score != null).map(c => ({ icon: '📄', text: `Analyzed "${c.name ?? 'Resume'}" — scored ${c.market_score}/100`, time: c.created_at, color: 'var(--blue)' })),
    ...(interviews ?? []).map(i => ({ icon: '🎯', text: `Completed a ${i.mode} interview — scored ${i.overall_score}/100`, time: i.created_at, color: 'var(--amber)' })),
  ]
  return entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4)
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
    streak,
    competencies,
    recentActivity,
    { data: growpathPlan },
    { data: latestCvAnalysis },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, plan').eq('id', user.id).single(),
    supabase.from('grow_dna')
      .select('earning_gap, target_salary, salary_range_min, salary_range_max, hrs_score, months_to_close, role, city, career_archetype, current_salary, created_at, dimension_scores, gap_reasons')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('cv_versions').select('id, market_score, name').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('career_health_scores').select('score, computed_at').eq('user_id', user.id).order('computed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('interview_sessions').select('id, overall_score, mode, created_at, status').eq('user_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    getStreak(user.id),
    getUserCompetencies(user.id),
    getRealActivity(user.id, supabase),
    // FIX: growpath_plans fetched as its own real parallel entry this
    // time, not nested inline inside another query — the earlier version
    // of this query blocked on a sequential sub-await during array
    // construction, which was flagged as a real inefficiency.
    supabase.from('growpath_plans').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('cv_analyses').select('critical_issues, keyword_gaps').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const { data: growpathPhases } = growpathPlan?.id
    ? await supabase.from('growpath_phases').select('id, title, start_month, end_month, growpath_milestones(status)').eq('plan_id', growpathPlan.id).order('start_month', { ascending: true })
    : { data: null }

  const rawName = profile?.full_name || user.email?.split('@')[0] || 'there'
  const name = rawName.split(' ')[0]
  const plan = profile?.plan ?? 'free'
  const dna = dnaAttempts?.[0]
  const prevDna = dnaAttempts?.[1]
  const hasGap = !!dna
  const changeNarrative = dna && prevDna ? getChangeNarrative(dna, prevDna) : null
  const hrsDelta = dna && prevDna ? (dna.hrs_score ?? 0) - (prevDna.hrs_score ?? 0) : null

  const nextMove = getNextMove({
    hrsScore: dna?.hrs_score ?? null, cvScore: cvData?.market_score ?? null,
    interviewScore: latestInterview?.overall_score ?? null, hasDna: hasGap, plan,
  })

  const primaryCompetencies = competencies.filter(c => c.tier === 'primary')
  const secondaryCompetencies = competencies.filter(c => c.tier === 'secondary')
  const avgConfidence = competencies.length > 0 ? Math.round((competencies.reduce((s, c) => s + c.aggregateConfidence, 0) / competencies.length) * 100) : 0

  const skillGapItems: { text: string; source: 'resume' | 'growdna' }[] = [
    ...(latestCvAnalysis?.critical_issues ?? []).slice(0, 1).map((t: string) => ({ text: t, source: 'resume' as const })),
    ...(dna?.gap_reasons ?? []).slice(0, 1).map((t: string) => ({ text: t, source: 'growdna' as const })),
  ]

  const trajectoryPoints = (dnaAttempts ?? [])
    .filter(d => d.hrs_score != null)
    .map(d => ({ score: d.hrs_score as number, date: d.created_at as string }))
    .reverse() // API order is newest-first; chart reads left→right chronologically

  const phaseProgress = (growpathPhases ?? []).map(p => {
    const ms = (p as unknown as { growpath_milestones: { status: string }[] }).growpath_milestones ?? []
    const done = ms.filter(m => m.status === 'done').length
    return { title: p.title, startMonth: p.start_month, endMonth: p.end_month, pct: ms.length > 0 ? Math.round((done / ms.length) * 100) : 0 }
  })

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{getGreeting()}, {name} 👋</h1>
          <p className="dash-sub">{hasGap ? `Your Hiring Readiness: ${hrsLabel(dna.hrs_score ?? 0)} · ${dna.hrs_score ?? 0}/1000` : 'Complete your GrowDNA to reveal your Earning Gap.'}</p>
        </div>
        {plan === 'free' && <Link href="/pricing" className="dash-upgrade-btn">⚡ Upgrade to Grow</Link>}
      </div>

      {!hasGap && (
        <PremiumHero>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🧬</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 600, color: '#fff', marginBottom: 10 }}>Discover your Earning Gap</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 460, marginBottom: 24 }}>10 questions · 4 minutes · Your exact gap in rupees, your career archetype, and a personalised AI roadmap to close it.</p>
          <Link href="/growdna" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--teal-d)', fontSize: 14, fontWeight: 700, padding: '12px 26px', borderRadius: 99, textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Start GrowDNA Assessment →</Link>
        </PremiumHero>
      )}

      {hasGap && (
        <>
          {/* ── Today's Focus — moved to the top. The single action that
              matters more than any score, since a score with no attached
              action doesn't advance anyone's career. This is the first
              thing seen, matching the daily-habit north star, not the
              6th scroll stop it used to be. ── */}
          <div className="dash-section">
            <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--amber)', background: 'var(--amber-l)' }}>🎯</span><h2 className="dash-section-title">Today's Focus</h2></div></div>
            <Link href={nextMove.href} style={{ textDecoration: 'none', display: 'block' }}>
              {nextMove.urgent ? (
                <PremiumHero>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', flexShrink: 0, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{nextMove.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Your daily mission</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{nextMove.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{nextMove.desc}</div>
                    </div>
                    <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>→</div>
                  </div>
                </PremiumHero>
              ) : (
                <div className="dash-white-panel" style={{ display: 'flex', alignItems: 'center', gap: 16, border: '1.5px solid var(--teal-mid)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', flexShrink: 0, background: 'var(--teal-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{nextMove.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: 4 }}>Your daily mission</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{nextMove.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{nextMove.desc}</div>
                  </div>
                  <div style={{ fontSize: 20, color: 'var(--teal)', flexShrink: 0 }}>→</div>
                </div>
              )}
            </Link>
          </div>

          {/* ── Your Current Standing ── */}
          <div className="dash-section">
            <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--blue)', background: 'var(--blue-l)' }}>📊</span><h2 className="dash-section-title">Your Current Standing</h2></div><p className="dash-section-sub">Measured honestly across every real signal we track</p></div>
            <div style={{ marginBottom: 18 }}><StreakCard currentStreak={streak.currentStreak} /></div>
            <div className="dash-kpi-row">
              {chs
                ? <div className="dash-kpi-card" style={{ borderLeft: '3px solid var(--blue)' }}><KPIRing score={chs.score} max={100} color="var(--blue)" /><div><div className="kpi-label">Career Health</div><div className="kpi-sub">{scoreInterpretation(chs.score, 100)}</div></div></div>
                : <EmptyRing label="Career Health" cta="Computed after your first check-in" href="/growdna" color="var(--blue)" />}
              <div className="dash-kpi-card" style={{ borderLeft: '3px solid var(--purple)' }}><KPIRing score={dna.hrs_score ?? 0} max={1000} color="var(--purple)" /><div><div className="kpi-label">HRS Score</div><div className="kpi-sub">{hrsLabel(dna.hrs_score ?? 0)}</div></div></div>
              {cvData?.market_score
                ? <div className="dash-kpi-card" style={{ borderLeft: '3px solid var(--teal)' }}><KPIRing score={cvData.market_score} max={100} color="var(--teal)" /><div><div className="kpi-label">CV Score</div><div className="kpi-sub">{scoreInterpretation(cvData.market_score, 100)}</div></div></div>
                : <EmptyRing label="CV Score" cta="Upload your resume" href="/cv" color="var(--teal)" />}
              {latestInterview?.overall_score
                ? <div className="dash-kpi-card" style={{ borderLeft: '3px solid var(--amber)' }}><KPIRing score={latestInterview.overall_score} max={100} color="var(--amber)" /><div><div className="kpi-label">Interview</div><div className="kpi-sub">{scoreInterpretation(latestInterview.overall_score, 100)}</div></div></div>
                : <EmptyRing label="Interview" cta={plan === 'accelerate' ? 'Start your first session' : 'Unlock with Accelerate'} href={plan === 'accelerate' ? '/interview' : '/pricing'} color="var(--amber)" />}
            </div>
          </div>

          {/* ── Your Earning Potential ── */}
          <div className="dash-section">
            <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--teal-d)', background: 'var(--teal-l)' }}>💰</span><h2 className="dash-section-title">Your Earning Potential</h2></div><p className="dash-section-sub">Your real gap against verified market rate for your exact profile</p></div>
            <div className="dash-white-panel">
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
                <div><div className="kpi-label">Current</div><div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{fmt(dna.current_salary)}</div></div>
                <div><div className="kpi-label">Annual Gap</div><div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>{fmt(dna.earning_gap)}</div></div>
                <div><div className="kpi-label">Target</div><div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>{fmt(dna.target_salary)}</div></div>
              </div>
              {dna.salary_range_min && dna.salary_range_max && (
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, position: 'relative' }}>
                  <div style={{ position: 'absolute', height: '100%', left: '0%', right: '0%', background: 'linear-gradient(90deg, var(--amber-mid), var(--teal))', borderRadius: 99 }} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions — moved up here per UX pass: this is where a
              user acts on the numbers they just saw above, not something
              buried after five more read-only sections. */}
          <div className="dash-section">
            <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--purple)', background: 'var(--purple-l)' }}>⚡</span><h2 className="dash-section-title">Quick Actions</h2></div></div>
            <div className="dash-actions-row">
              <Link href="/cv" className="dash-action-chip"><div className="action-chip-ico" style={{ background: 'var(--blue-l)' }}>📄</div><div><div className="action-chip-title">Analyze Resume</div><div className="action-chip-sub">Get AI feedback</div></div></Link>
              <Link href={plan === 'accelerate' ? '/interview' : '/pricing'} className="dash-action-chip"><div className="action-chip-ico" style={{ background: 'var(--purple-l)' }}>🎯</div><div><div className="action-chip-title">Start AI Interview</div><div className="action-chip-sub">{plan === 'accelerate' ? 'Practice now' : 'Accelerate only'}</div></div></Link>
              <Link href={plan === 'free' ? '/pricing' : '/growpath'} className="dash-action-chip"><div className="action-chip-ico" style={{ background: 'var(--teal-l)' }}>🗺️</div><div><div className="action-chip-title">Continue GrowPath</div><div className="action-chip-sub">{plan === 'free' ? 'Grow+ only' : 'Next milestone'}</div></div></Link>
              <Link href="/growdna" className="dash-action-chip"><div className="action-chip-ico" style={{ background: 'var(--amber-l)' }}>🧬</div><div><div className="action-chip-title">Retake GrowDNA</div><div className="action-chip-sub">Update your profile</div></div></Link>
            </div>
          </div>

          {/* ── Your Growth Trajectory ── */}
          {changeNarrative && (
            <div className="dash-section">
              <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--teal)', background: 'var(--teal-l)' }}>📈</span><h2 className="dash-section-title">Your Growth Trajectory</h2></div><p className="dash-section-sub">Real trajectory since your last assessment, not just a snapshot</p></div>
              {trajectoryPoints.length >= 2 && (
                <div className="dash-white-panel" style={{ marginBottom: 14, paddingBottom: 8 }}>
                  <TrajectoryChart points={trajectoryPoints} />
                </div>
              )}
              <div style={{ marginBottom: 4 }}><ChangeNarrativeCard narrative={changeNarrative} attemptId={dna.created_at} compact /></div>
              {hrsDelta !== null && (
                <div style={{ marginTop: 12, fontSize: 12, color: hrsDelta >= 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 600 }}>
                  {hrsDelta >= 0 ? `↑ HRS improved ${hrsDelta} points` : `↓ HRS dropped ${Math.abs(hrsDelta)} points`} since your last check-in
                </div>
              )}
            </div>
          )}

          {/* ── Skill Gaps to Close ── */}
          {skillGapItems.length > 0 && (
            <div className="dash-section">
              <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--amber)', background: 'var(--amber-l)' }}>🔍</span><h2 className="dash-section-title">Skill Gaps to Close</h2></div><p className="dash-section-sub">Real gaps, traced to exactly where they came from</p></div>
              <div className="dash-white-panel">
                {skillGapItems.map((g, i) => (
                  <div key={i} className="dash-gap-item" style={{ borderBottom: i < skillGapItems.length - 1 ? '1px solid var(--border-l)' : 'none' }}>
                    <span style={{ color: 'var(--amber)', flexShrink: 0 }}>⚠</span>
                    <span style={{ flex: 1 }}>{g.text}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 8px', borderRadius: 99, flexShrink: 0, background: g.source === 'resume' ? 'var(--blue-l)' : 'var(--teal-l)', color: g.source === 'resume' ? 'var(--blue)' : 'var(--teal-d)' }}>
                      {g.source === 'resume' ? '📄 Resume' : '🧬 GrowDNA'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Competency Profile — Pillar 1, supporting evidence for "what's holding me back" */}
          {competencies.length > 0 && (
            <div className="dash-section">
              <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--purple)', background: 'var(--purple-l)' }}>🧠</span><h2 className="dash-section-title">Your Competency Profile</h2></div><p className="dash-section-sub">A growing, verified record of what you actually know</p></div>
              <div className="dash-white-panel">
                <div className="comp-stats-row">
                  <div className="comp-stat"><div className="comp-stat-num" style={{ color: 'var(--teal)' }}>{primaryCompetencies.length}</div><div className="comp-stat-label">Primary skills</div></div>
                  <div className="comp-stat"><div className="comp-stat-num" style={{ color: 'var(--blue)' }}>{secondaryCompetencies.length}</div><div className="comp-stat-label">Secondary skills</div></div>
                  <div className="comp-stat"><div className="comp-stat-num" style={{ color: 'var(--purple)' }}>{avgConfidence}%</div><div className="comp-stat-label">Avg. confidence</div></div>
                </div>
                <div className="comp-chip-row">
                  {competencies.slice(0, 8).map(c => (
                    <span key={c.competencyId} className="comp-chip">{c.name}{c.sources.length > 1 && <span className="comp-chip-verified" title={`Confirmed by ${c.sources.length} sources`}>✓✓</span>}</span>
                  ))}
                  {competencies.length > 8 && <span className="comp-chip" style={{ color: 'var(--muted)' }}>+{competencies.length - 8} more</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Your Career Roadmap ── */}
          {phaseProgress.length > 0 && (
            <div className="dash-section">
              <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--teal-d)', background: 'var(--teal-l)' }}>🗺️</span><h2 className="dash-section-title">Your Career Roadmap</h2></div><p className="dash-section-sub">Your real, month-by-month roadmap to close the gap</p></div>
              <div className="dash-white-panel">
                {phaseProgress.map((p, i) => (
                  <div key={i} style={{ marginBottom: i < phaseProgress.length - 1 ? 10 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{p.title}</span><span style={{ color: 'var(--muted)' }}>Month {p.startMonth}–{p.endMonth}</span></div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${p.pct}%`, background: 'var(--teal)', borderRadius: 99 }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* ── Your AI Career Coach ──
              Honest placeholder — no AI Coach exists yet. Clearly marked
              as coming soon rather than a decorative chat box pretending
              to work, matching the same no-fabrication discipline used
              everywhere else in this build. */}
          <div className="dash-section">
            <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--purple)', background: 'var(--purple-l)' }}>🤖</span><h2 className="dash-section-title">Your AI Career Coach</h2></div></div>
            <div className="dash-white-panel" style={{ display: 'flex', alignItems: 'center', gap: 16, borderStyle: 'dashed' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', flexShrink: 0, background: 'var(--purple-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>AI Career Coach — coming soon</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>A real, always-available guide for your career questions. We're building this next.</div>
              </div>
            </div>
          </div>

          {recentActivity.length > 0 && (
            <div className="dash-section">
              <div className="dash-section-head"><div className="dash-section-head-row"><span className="dash-section-icon" style={{ color: 'var(--blue)', background: 'var(--blue-l)' }}>🕐</span><h2 className="dash-section-title">Recent Activity</h2></div><p className="dash-section-sub">Your real actions on EarnGro, most recent first</p></div>
              <div className="dash-white-panel">
                {recentActivity.map((a, i) => (
                  <div key={i} className="activity-row" style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-l)' : 'none' }}>
                    <div className="activity-icon" style={{ background: `${a.color}18`, color: a.color }}>{a.icon}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, color: 'var(--ink)' }}>{a.text}</div><div style={{ fontSize: 10.5, color: 'var(--muted-l)' }}>{new Date(a.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dash-section">
            <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>💡</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-d)', marginBottom: 3 }}>Every week you wait costs you {fmt(Math.round((dna.earning_gap ?? 0) / 52))}</div><div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>Professionals who practise interview skills weekly close their gap 3× faster.</div></div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .dash-section { animation: dashFadeUp 0.4s var(--ease-out-expo, ease) both; margin-bottom: 22px; background: #fff; border: 1px solid var(--border); border-radius: var(--r-xl); padding: 26px 28px; box-shadow: var(--shadow-sm); }
        .dash-section:last-child { margin-bottom: 0; }
        .dash-section-head { display: flex; flex-direction: column; gap: 4px; margin-bottom: 22px; }
        .dash-section-head-row { display: flex; align-items: center; gap: 10px; }
        .dash-section-icon { font-size: 14px; line-height: 1; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dash-section-title { font-family: var(--serif); font-size: 18px; font-weight: 600; color: var(--ink); margin: 0; }
        .dash-section-sub { font-size: 12px; color: var(--muted); margin: 0 0 0 38px; }
        .dashboard { background: #ffffff !important; padding: 4px; }
        .dashboard .dash-header { margin-bottom: 24px; }
        .dash-white-panel { background: var(--paper-2); border: 1px solid var(--border-l); border-radius: var(--r-lg); padding: 20px 22px; }
        .dash-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
        .dash-kpi-card { background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-sm); transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .dash-kpi-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .kpi-label { font-size: 11px; color: var(--muted); }
        .kpi-sub { font-size: 10px; color: var(--muted-l); }
        .dash-gap-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; font-size: 11.5px; }
        .comp-stats-row { display: flex; gap: 24px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-l); }
        .comp-stat-num { font-family: var(--serif); font-size: 26px; font-weight: 700; }
        .comp-stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .comp-chip-row { display: flex; flex-wrap: wrap; gap: 7px; }
        .comp-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 500; background: var(--teal-l); border: 1px solid var(--teal-mid); color: var(--teal-d); padding: 4px 11px; border-radius: 99px; }
        .comp-chip-verified { font-size: 9px; color: var(--teal); }
        .dash-actions-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .dash-action-chip { display: flex; align-items: center; gap: 10px; background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-md); padding: 11px 14px; text-decoration: none; box-shadow: var(--shadow-sm); transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
        .dash-action-chip:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--border-d); }
        .dash-kpi-empty { text-decoration: none; border-style: dashed; opacity: 0.85; transition: opacity 0.15s ease, transform 0.15s ease; }
        .dash-kpi-empty:hover { opacity: 1; transform: translateY(-2px); }
        .action-chip-ico { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .action-chip-title { font-size: 12px; font-weight: 600; color: var(--ink); }
        .action-chip-sub { font-size: 10.5px; color: var(--muted); }
        .activity-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
        .activity-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        @keyframes dashFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dash-section { animation: dashFadeUp 0.4s var(--ease-out-expo, ease) both; }
        @media (prefers-reduced-motion: reduce) { .dash-section { animation: none; } }
        @media (max-width: 860px) { .dash-actions-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .dash-kpi-row { grid-template-columns: 1fr 1fr; } .comp-stats-row { flex-wrap: wrap; gap: 16px; } }
      `}</style>
    </div>
  )
}