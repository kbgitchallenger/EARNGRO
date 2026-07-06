'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function fmt(n: number | null | undefined) {
  if (!n) return '—'
  const v = Math.round(n)
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + 'Cr'
  if (v >= 100000)   return '₹' + (v / 100000).toFixed(1) + 'L'
  return '₹' + v.toLocaleString('en-IN')
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  skill:       { label: 'Skill',       color: 'var(--teal-d)', bg: 'var(--teal-l)', icon: '⚡' },
  visibility:  { label: 'Visibility',  color: '#6D28D9',       bg: '#EEE9FE',       icon: '📢' },
  application: { label: 'Application', color: '#B91C1C',       bg: '#FEE2E2',       icon: '🏢' },
  negotiation: { label: 'Negotiation', color: '#B45309',       bg: '#FEF3C7',       icon: '🎯' },
}
const TYPE_CTA: Record<string, { href: string; label: string }> = {
  skill:       { href: '/cv',        label: 'Open CV Builder →' },
  application: { href: '/cv',        label: 'Open CV Builder →' },
  visibility:  { href: '/interview', label: 'Practice with AI Interview →' },
  negotiation: { href: '/interview', label: 'Practice with AI Interview →' },
}
const DIM_LABEL: Record<string, string> = {
  market_alignment: 'Market Alignment', skill_premium: 'Skill Premium', visibility: 'Visibility',
  mobility: 'Career Mobility', negotiation: 'Negotiation',
}
const PHASE_ICON = ['🏗️', '🚀', '💥', '🌱']
const PHASE_ACCENT = ['var(--teal)', '#6D28D9', '#B45309', '#0891B2']
const PHASE_DESC: Record<string, string> = {
  Foundation: 'Build strong core skills and close critical gaps.',
  Momentum: 'Grow visibility, apply what you\u2019ve built, and gain traction.',
  Breakthrough: 'Apply, interview, and negotiate for the role you want.',
  Sustain: 'Maintain your gains and keep compounding growth.',
}

interface Milestone {
  id: string; type: string; title: string; description: string
  why_it_matters?: string; how_to_improve?: string[]
  target_month: number; status: string
}
interface Phase {
  id: string; title: string; start_month: number; end_month: number
  growpath_milestones: Milestone[]
}
interface Company { id: string; company_name: string; rationale: string; est_salary_min: number; est_salary_max: number }
interface DimensionScores { market_alignment?: number; skill_premium?: number; visibility?: number; mobility?: number; negotiation?: number }
interface CareerHealth { score: number; from_milestones_pct?: number; from_practiced_skills?: number; computed_at?: string }
interface CVAnalysis { ats_score?: number; recruiter_score?: number; market_alignment?: number; keyword_gaps?: string[]; critical_issues?: string[]; improvements?: string[] }
interface Props {
  userId: string
  plan: { id: string; generated_at?: string } | null
  phases: Phase[]
  companies: Company[]
  dna: { current_salary: number; target_salary: number; earning_gap: number; months_to_close: number; dimension_scores?: DimensionScores; gap_reasons?: string[]; raw_ai_response?: any } | null
  careerHealth: CareerHealth | null
  cvAnalysis: CVAnalysis | null
  isFreePlan: boolean
}

function HealthGauge({ score, size = 128 }: { score: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, score)) / 100
  const angle = 180 * pct
  const color = score >= 70 ? 'var(--teal)' : score >= 40 ? 'var(--amber)' : 'var(--red)'
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Building' : 'Just starting'
  const r = size * 0.42, cx = size / 2, cy = size / 2
  const rad = (Math.PI / 180) * (180 - angle)
  const x = cx - r * Math.cos(rad)
  const y = cy - r * Math.sin(rad)
  const largeArc = angle > 180 ? 1 : 0
  const trackStart = cx - r
  const trackEnd = cx + r

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        <path d={`M ${trackStart} ${cy} A ${r} ${r} 0 0 1 ${trackEnd} ${cy}`} fill="none" stroke="var(--border)" strokeWidth={size * 0.08} strokeLinecap="round" />
        <path d={`M ${trackStart} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth={size * 0.08} strokeLinecap="round" />
      </svg>
      <div style={{ marginTop: -size * 0.12, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: size * 0.22, fontWeight: 700, color }}>
          {score}<span style={{ fontSize: size * 0.11, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
        </div>
        <div style={{ fontSize: size * 0.095, color, fontWeight: 600, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

function DarkHealthGauge({ score, size = 120 }: { score: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, score)) / 100
  const circumference = 2 * Math.PI * (size * 0.42)
  const offset = circumference * (1 - pct)
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Building' : 'Just starting'
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={size * 0.42} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={size * 0.06} />
        <circle cx={size / 2} cy={size / 2} r={size * 0.42} fill="none" stroke="#fff" strokeWidth={size * 0.06} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: size * 0.24, fontWeight: 700, color: '#fff' }}>
          {score}<span style={{ fontSize: size * 0.11, color: 'rgba(255,255,255,0.6)' }}>/100</span>
        </div>
        <div style={{ fontSize: size * 0.08, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Career Health</div>
        <div style={{ fontSize: size * 0.085, color: '#FBBF24', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  )
}

function MilestoneCard({ m, onToggle }: { m: Milestone; onToggle: (id: string, status: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const done = m.status === 'done'
  const meta = TYPE_META[m.type] ?? TYPE_META.skill
  const cta = TYPE_CTA[m.type]
  const hasDetail = !!(m.why_it_matters || (m.how_to_improve && m.how_to_improve.length > 0))

  return (
    <div className="gp-milestone" style={{ opacity: done ? 0.7 : 1 }}>
      <div className="gp-milestone-row">
        <button onClick={() => onToggle(m.id, done ? 'todo' : 'done')} className="gp-milestone-check"
          style={{ background: done ? 'var(--teal)' : 'var(--paper)', borderColor: done ? 'var(--teal)' : 'var(--border)' }}
          aria-label={done ? 'Mark as not done' : 'Mark as done'}>
          {done && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
        </button>
        <div className="gp-milestone-body" onClick={() => hasDetail && setExpanded(e => !e)} style={{ cursor: hasDetail ? 'pointer' : 'default' }}>
          <div className="gp-milestone-title" style={{ textDecoration: done ? 'line-through' : 'none' }}>{m.title}</div>
          <div className="gp-milestone-meta">
            <span className="gp-type-pill" style={{ color: meta.color, background: meta.bg }}><span aria-hidden>{meta.icon}</span> {meta.label}</span>
            <span className="gp-month">Month {m.target_month}</span>
            {hasDetail && <span className="gp-expand-hint">{expanded ? 'Hide details ▲' : 'Why + how ▼'}</span>}
          </div>
        </div>
      </div>
      {expanded && hasDetail && (
        <div className="gp-milestone-detail">
          {m.why_it_matters && (
            <div className="gp-detail-block">
              <div className="gp-detail-label">Why it matters</div>
              <div className="gp-detail-text">{m.why_it_matters}</div>
            </div>
          )}
          {m.how_to_improve && m.how_to_improve.length > 0 && (
            <div className="gp-detail-block">
              <div className="gp-detail-label">How to improve</div>
              {m.how_to_improve.map((step, i) => (
                <div key={i} className="gp-detail-step"><span className="gp-detail-step-num">{i + 1}</span><span>{step}</span></div>
              ))}
            </div>
          )}
          {cta && <Link href={cta.href} className="gp-detail-cta">{cta.label}</Link>}
        </div>
      )}
    </div>
  )
}

export default function GrowPathView({ userId, plan, phases, companies, dna, careerHealth, cvAnalysis, isFreePlan }: Props) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [localPhases, setLocalPhases] = useState(phases)
  const [companyDisplayLimit] = useState(6)
  const [showAllCompanies, setShowAllCompanies] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/growpath/generate', { method: 'POST' })
      if (res.status === 402) {
        const body = await res.json().catch(() => ({}))
        setError(body.message ?? 'Upgrade required.')
        setGenerating(false)
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? 'Generation failed')
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setGenerating(false)
    }
  }

  async function handleToggle(milestoneId: string, status: string) {
    setLocalPhases(prev => prev.map(p => ({ ...p, growpath_milestones: p.growpath_milestones.map(m => m.id === milestoneId ? { ...m, status } : m) })))
    await fetch(`/api/growpath/milestones/${milestoneId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    }).catch(() => {})
  }

  if (isFreePlan) {
    return (
      <div className="gp-page">
        <div className="gp-locked">
          <div style={{ fontSize: 44, marginBottom: 14 }}>🗺️</div>
          <h2 className="gp-h1">GrowPath is a Grow plan feature</h2>
          <p className="gp-lead">Get your month-by-month roadmap — skill targets, salary milestones, and companies to target.</p>
          <Link href="/settings" className="gp-btn-primary">Upgrade to Grow →</Link>
        </div>
        <style>{growPathStyles}</style>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="gp-page">
        <div className="gp-locked">
          <div style={{ fontSize: 44, marginBottom: 14 }}>🗺️</div>
          <h2 className="gp-h1">Build your GrowPath</h2>
          <p className="gp-lead">A phased, month-by-month plan built from your GrowDNA results — skill targets, visibility milestones, and companies to target.</p>
          {error && <div className="gp-error">{error}</div>}
          <button onClick={handleGenerate} disabled={generating} className="gp-btn-primary" style={{ opacity: generating ? 0.7 : 1 }}>
            {generating ? 'Building your plan…' : 'Generate my GrowPath →'}
          </button>
        </div>
        <style>{growPathStyles}</style>
      </div>
    )
  }

  const displayPhases = localPhases.length > 0 ? localPhases : phases
  const allMilestones = displayPhases.flatMap(p => p.growpath_milestones.map(m => ({ ...m, phaseId: p.id, phaseTitle: p.title })))
  const totalMilestones = allMilestones.length
  const doneMilestones = allMilestones.filter(m => m.status === 'done').length
  const pct = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0
  const monthsTotal = displayPhases.length > 0 ? Math.max(...displayPhases.map(p => p.end_month)) : dna?.months_to_close

  const incompleteSorted = allMilestones.filter(m => m.status !== 'done').sort((a, b) => a.target_month - b.target_month)
  const nextAction = incompleteSorted[0]
  const upcoming = incompleteSorted[1]

  function dueDateLabel(targetMonth: number): string {
    if (!plan?.generated_at) return `Month ${targetMonth}`
    const start = new Date(plan.generated_at)
    const due = new Date(start)
    due.setMonth(due.getMonth() + targetMonth)
    const daysLeft = Math.round((due.getTime() - Date.now()) / 86400000)
    if (daysLeft < 0) return 'Overdue'
    if (daysLeft === 0) return 'Due today'
    return `Due in ${daysLeft} days`
  }

  const dims = dna?.dimension_scores ?? {}
  const lowestDim = Object.entries(dims).sort((a, b) => (a[1] ?? 100) - (b[1] ?? 100))[0]?.[0]
  const skillGapItems: { text: string; priority: 'High' | 'Medium' }[] = [
    ...(cvAnalysis?.critical_issues ?? []).slice(0, 2).map(t => ({ text: t, priority: 'High' as const })),
    ...(cvAnalysis?.keyword_gaps ?? []).slice(0, 2).map(t => ({ text: t, priority: 'Medium' as const })),
    ...(dna?.gap_reasons ?? []).slice(0, 2).map(t => ({ text: t, priority: 'Medium' as const })),
  ].slice(0, 4)
  const resumeScore = cvAnalysis?.market_alignment ?? cvAnalysis?.ats_score
  const visibilityScore = dims.visibility

  const visibleCompanies = showAllCompanies ? companies : companies.slice(0, companyDisplayLimit)
  const chsScore = careerHealth?.score ?? 0

  return (
    <div className="gp-page">
      <div className="gp-header-row">
        <div>
          <div className="gp-header-title-row">
            <span aria-hidden style={{ fontSize: 20 }}>🗺️</span>
            <h1 className="gp-h1">GrowPath</h1>
          </div>
          <p className="gp-header-sub">Your personalised {monthsTotal ?? '—'}-month career growth roadmap</p>
        </div>
        <button className="gp-btn-outline" onClick={() => window.print()}>Export Plan</button>
      </div>

      {!cvAnalysis && (
        <div className="gp-cv-nudge">
          <div style={{ fontSize: 22, flexShrink: 0 }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>Upload your CV to unlock deeper insights</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Skill gap analysis and market positioning need a CV to compare against.</div>
          </div>
          <Link href="/cv" className="gp-btn-secondary">Upload CV →</Link>
        </div>
      )}

      {nextAction && (
        <div className="gp-hero">
          <div className="gp-hero-left">
            <div className="gp-next-label">🎯 Your Next Action</div>
            <div className="gp-next-title">{nextAction.title}</div>
            <div className="gp-next-meta">
              <span className="gp-type-pill" style={{ color: (TYPE_META[nextAction.type] ?? TYPE_META.skill).color, background: (TYPE_META[nextAction.type] ?? TYPE_META.skill).bg }}>
                {(TYPE_META[nextAction.type] ?? TYPE_META.skill).icon} {(TYPE_META[nextAction.type] ?? TYPE_META.skill).label}
              </span>
              <span className="gp-next-month">{nextAction.phaseTitle} · Month {nextAction.target_month}</span>
            </div>
            {TYPE_CTA[nextAction.type] && (
              <Link href={TYPE_CTA[nextAction.type].href} className="gp-btn-primary gp-btn-onhero">{TYPE_CTA[nextAction.type].label}</Link>
            )}
          </div>
          {careerHealth && <div className="gp-hero-right"><DarkHealthGauge score={chsScore} /></div>}
        </div>
      )}

      <div className="gp-stats-row">
        {careerHealth && (
          <div className="gp-stat-cell gp-stat-gauge">
            <div className="gp-stat-label">Career Health Score</div>
            <HealthGauge score={chsScore} size={100} />
          </div>
        )}
        <div className="gp-stat-cell">
          <div className="gp-stat-label">Current CTC</div>
          <div className="gp-stat-val">{fmt(dna?.current_salary)}</div>
          <div className="gp-stat-sub">Total package</div>
        </div>
        <div className="gp-stat-cell">
          <div className="gp-stat-label">Target CTC</div>
          <div className="gp-stat-val" style={{ color: 'var(--teal)' }}>{fmt(dna?.target_salary)}</div>
          <div className="gp-stat-sub">Expected package</div>
        </div>
        <div className="gp-stat-cell">
          <div className="gp-stat-label">Gap</div>
          <div className="gp-stat-val" style={{ color: 'var(--red)' }}>{fmt(dna?.earning_gap)}</div>
          <div className="gp-stat-sub">{dna?.current_salary ? Math.round(((dna.earning_gap ?? 0) / dna.current_salary) * 100) : 0}% increase</div>
        </div>
        <div className="gp-stat-cell">
          <div className="gp-stat-label">Target Timeline</div>
          <div className="gp-stat-val" style={{ color: 'var(--amber)' }}>{dna?.months_to_close ?? '—'} months</div>
          <div className="gp-stat-sub">{doneMilestones}/{totalMilestones} milestones completed</div>
        </div>
      </div>

      <div className="gp-insight-row">
        <div className="gp-card">
          <div className="gp-card-title-row"><span className="gp-card-title">Top Skill Gaps</span></div>
          {skillGapItems.length > 0 ? skillGapItems.map((g, i) => (
            <div key={i} className="gp-gap-row">
              <span aria-hidden style={{ color: g.priority === 'High' ? 'var(--red)' : 'var(--amber)', flexShrink: 0 }}>⚠</span>
              <span className="gp-gap-text">{g.text}</span>
              <span className={`gp-priority-pill gp-priority-${g.priority.toLowerCase()}`}>{g.priority}</span>
            </div>
          )) : <div className="gp-empty-note">Upload a CV to see specific skill gaps.</div>}
        </div>

        <div className="gp-card">
          <div className="gp-card-title-row"><span className="gp-card-title">Market Positioning</span></div>
          {resumeScore != null && (
            <div className="gp-position-row">
              <div className="gp-position-top"><span>Resume Score</span><span style={{ fontWeight: 700 }}>{resumeScore}/100</span></div>
              <div className="gp-position-track"><div className="gp-position-fill" style={{ width: `${resumeScore}%`, background: 'var(--teal)' }} /></div>
            </div>
          )}
          {visibilityScore != null && (
            <div className="gp-position-row">
              <div className="gp-position-top"><span>Visibility Score</span><span style={{ fontWeight: 700 }}>{visibilityScore}/100</span></div>
              <div className="gp-position-track"><div className="gp-position-fill" style={{ width: `${visibilityScore}%`, background: '#6D28D9' }} /></div>
            </div>
          )}
          <div className="gp-position-row gp-position-locked">
            <div className="gp-position-top"><span>LinkedIn Score</span><span className="gp-soon-tag">Not yet tracked</span></div>
          </div>
          <div className="gp-position-row gp-position-locked">
            <div className="gp-position-top"><span>Interview Readiness</span><span className="gp-soon-tag">Not yet tracked</span></div>
          </div>
          {lowestDim && (
            <div className="gp-position-note">Your lowest scoring area: <strong>{DIM_LABEL[lowestDim] ?? lowestDim}</strong> — focus on improving this.</div>
          )}
        </div>

        <div className="gp-card">
          <div className="gp-card-title-row"><span className="gp-card-title">Plan Highlights</span></div>
          <div className="gp-highlight-row"><span aria-hidden>📅</span><div><div className="gp-highlight-val">{monthsTotal ?? '—'} Months</div><div className="gp-highlight-sub">Duration</div></div></div>
          <div className="gp-highlight-row"><span aria-hidden>🧭</span><div><div className="gp-highlight-val">{displayPhases.length} Phases</div><div className="gp-highlight-sub">{displayPhases.map(p => p.title).join(' → ')}</div></div></div>
          <div className="gp-highlight-row"><span aria-hidden>✅</span><div><div className="gp-highlight-val">{totalMilestones} Milestones</div><div className="gp-highlight-sub">Actionable steps</div></div></div>
          <div className="gp-highlight-row"><span aria-hidden>🏢</span><div><div className="gp-highlight-val">{companies.length} Target Companies</div><div className="gp-highlight-sub">Personalised for you</div></div></div>
          <a href="#full-roadmap" className="gp-btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>View Full Plan Overview →</a>
        </div>
      </div>

      <div className="gp-roadmap-header">
        <div>
          <div className="gp-card-title" style={{ marginBottom: 2 }}>Your {monthsTotal ?? ''}-Month Roadmap</div>
          <div className="gp-roadmap-sub">Follow the phases and complete milestones to reach your target salary.</div>
        </div>
        <div className="gp-view-toggle">
          <span className="gp-view-btn gp-view-active">Timeline</span>
          <span className="gp-view-btn gp-view-disabled" title="Coming soon">Calendar</span>
        </div>
      </div>

      <div className="gp-phase-cards">
        {displayPhases.map((phase, idx) => {
          const done = phase.growpath_milestones.filter(m => m.status === 'done').length
          const total = phase.growpath_milestones.length
          return (
            <div key={phase.id} className="gp-phase-card">
              <div className="gp-phase-icon" style={{ background: `${PHASE_ACCENT[idx % PHASE_ACCENT.length]}18`, color: PHASE_ACCENT[idx % PHASE_ACCENT.length] }}>
                {PHASE_ICON[idx % PHASE_ICON.length]}
              </div>
              <div className="gp-phase-card-title">{phase.title}</div>
              <div className="gp-phase-card-range">Month {phase.start_month}–{phase.end_month}</div>
              <div className="gp-phase-card-desc">{PHASE_DESC[phase.title] ?? 'Build toward your target across this phase.'}</div>
              <div className="gp-phase-card-count">{done}/{total} Milestones</div>
              <a href={`#phase-${phase.id}`} className="gp-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>View Details →</a>
              {idx < displayPhases.length - 1 && <div className="gp-phase-connector" aria-hidden />}
            </div>
          )
        })}
      </div>

      {upcoming && (
        <div className="gp-upcoming">
          <span aria-hidden style={{ fontSize: 18, color: 'var(--amber)' }}>🚩</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="gp-upcoming-label">Upcoming Milestone</div>
            <div className="gp-upcoming-title">{upcoming.title}</div>
          </div>
          <span className="gp-type-pill" style={{ color: (TYPE_META[upcoming.type] ?? TYPE_META.skill).color, background: (TYPE_META[upcoming.type] ?? TYPE_META.skill).bg }}>
            {(TYPE_META[upcoming.type] ?? TYPE_META.skill).label} · Month {upcoming.target_month}
          </span>
          <span className="gp-upcoming-due">{dueDateLabel(upcoming.target_month)}</span>
          <button className="gp-btn-primary" onClick={() => handleToggle(upcoming.id, 'done')}>Mark as Done</button>
        </div>
      )}

      {companies.length > 0 && (
        <div className="gp-companies">
          <div className="gp-companies-title-row">
            <span className="gp-card-title">🏢 Target Companies for You</span>
          </div>
          <div className="gp-companies-grid">
            {visibleCompanies.map(c => (
              <div key={c.id} className="gp-company-card">
                <div className="gp-company-mono">{c.company_name.charAt(0)}</div>
                <div className="gp-company-name">{c.company_name}</div>
              </div>
            ))}
            {!showAllCompanies && companies.length > companyDisplayLimit && (
              <button className="gp-company-card gp-company-more" onClick={() => setShowAllCompanies(true)}>
                <div className="gp-company-mono" style={{ background: 'var(--paper-2)', color: 'var(--muted)' }}>+{companies.length - companyDisplayLimit}</div>
                <div className="gp-company-name">More</div>
              </button>
            )}
          </div>
        </div>
      )}

      <div id="full-roadmap">
        {displayPhases.map(phase => (
          <div key={phase.id} id={`phase-${phase.id}`} className="gp-phase">
            <div className="gp-phase-header">
              <span className="gp-phase-title">{phase.title}</span>
              <span className="gp-phase-range">Month {phase.start_month}–{phase.end_month}</span>
            </div>
            {phase.growpath_milestones.slice().sort((a, b) => a.target_month - b.target_month).map(m => (
              <MilestoneCard key={m.id} m={m} onToggle={handleToggle} />
            ))}
          </div>
        ))}
      </div>

      <div className="gp-tip-bar">
        <span aria-hidden>💡</span>
        <span>Tip: Regularly update your progress and complete milestones to maximise your GrowPath score.</span>
      </div>

      <style>{growPathStyles}</style>
    </div>
  )
}

const growPathStyles = `
  .gp-page { max-width: 1000px; margin: 0 auto; padding: 24px 16px 60px; }
  .gp-h1 { font-family: var(--serif); font-size: clamp(20px, 4vw, 26px); font-weight: 600; color: var(--ink); }
  .gp-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .gp-header-title-row { display: flex; align-items: center; gap: 8px; }
  .gp-header-sub { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .gp-lead { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 24px; }
  .gp-locked { max-width: 480px; margin: 40px auto 0; text-align: center; }

  .gp-btn-primary { display: inline-flex; align-items: center; background: var(--teal); color: #fff; font-size: 13.5px; font-weight: 600; padding: 10px 20px; border-radius: 99px; border: none; cursor: pointer; text-decoration: none; font-family: var(--sans); box-shadow: 0 4px 16px rgba(14,122,90,0.22); white-space: nowrap; }
  .gp-btn-onhero { background: #fff; color: var(--teal-d); box-shadow: none; margin-top: 14px; }
  .gp-btn-secondary { display: inline-flex; align-items: center; background: var(--paper); color: var(--teal-d); font-size: 12.5px; font-weight: 600; padding: 8px 16px; border-radius: 99px; border: 1px solid var(--teal-mid); cursor: pointer; text-decoration: none; font-family: var(--sans); white-space: nowrap; }
  .gp-btn-outline { background: var(--teal); color: #fff; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 99px; border: none; cursor: pointer; font-family: var(--sans); }
  .gp-error { background: var(--red-l); border: 1px solid #F5CCCC; border-radius: var(--r-md); padding: 10px 14px; font-size: 13px; color: var(--red); margin-bottom: 14px; }

  .gp-cv-nudge { display: flex; align-items: center; gap: 12px; background: var(--amber-l); border: 1px solid var(--amber-mid); border-radius: var(--r-lg); padding: 14px 18px; margin-bottom: 20px; flex-wrap: wrap; }

  .gp-hero { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: linear-gradient(135deg, var(--teal-d), var(--teal)); border-radius: var(--r-xl); padding: 22px 24px; margin-bottom: 20px; color: #fff; flex-wrap: wrap; }
  .gp-hero-left { flex: 1; min-width: 240px; }
  .gp-hero-right { flex-shrink: 0; }
  .gp-next-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.65); margin-bottom: 8px; }
  .gp-next-title { font-family: var(--serif); font-size: 19px; font-weight: 600; margin-bottom: 10px; line-height: 1.35; }
  .gp-next-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .gp-next-month { font-size: 12px; color: rgba(255,255,255,0.75); }

  .gp-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .gp-stat-cell { background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 16px; }
  .gp-stat-gauge { display: flex; flex-direction: column; align-items: center; }
  .gp-stat-label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .gp-stat-val { font-family: var(--serif); font-size: 20px; font-weight: 700; color: var(--ink); }
  .gp-stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

  .gp-insight-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 24px; align-items: start; }
  .gp-card { background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px 20px; }
  .gp-card-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .gp-card-title { font-size: 13.5px; font-weight: 700; color: var(--ink); }
  .gp-empty-note { font-size: 12.5px; color: var(--muted); line-height: 1.6; }

  .gp-gap-row { display: flex; align-items: flex-start; gap: 8px; padding: 9px 0; border-bottom: 1px solid var(--border-l); font-size: 12.5px; color: var(--ink); }
  .gp-gap-row:last-child { border-bottom: none; }
  .gp-gap-text { flex: 1; line-height: 1.45; }
  .gp-priority-pill { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; white-space: nowrap; flex-shrink: 0; height: fit-content; }
  .gp-priority-high { background: #FEE2E2; color: #B91C1C; }
  .gp-priority-medium { background: #FEF3C7; color: #B45309; }

  .gp-position-row { margin-bottom: 14px; }
  .gp-position-locked { opacity: 0.6; }
  .gp-position-top { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink); margin-bottom: 6px; }
  .gp-position-track { height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
  .gp-position-fill { height: 100%; border-radius: 99px; }
  .gp-position-note { font-size: 11.5px; color: var(--muted); line-height: 1.5; padding-top: 8px; border-top: 1px solid var(--border-l); margin-top: 4px; }
  .gp-soon-tag { font-size: 10px; color: var(--muted); font-style: italic; }

  .gp-highlight-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 18px; }
  .gp-highlight-val { font-size: 13px; font-weight: 700; color: var(--ink); }
  .gp-highlight-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }

  .gp-roadmap-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
  .gp-roadmap-sub { font-size: 12px; color: var(--muted); }
  .gp-view-toggle { display: flex; gap: 4px; background: var(--paper-2); border-radius: 99px; padding: 3px; }
  .gp-view-btn { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 99px; }
  .gp-view-active { background: var(--teal); color: #fff; }
  .gp-view-disabled { color: var(--muted); cursor: not-allowed; }

  .gp-phase-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
  .gp-phase-card { position: relative; background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; }
  .gp-phase-icon { width: 40px; height: 40px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
  .gp-phase-card-title { font-size: 15px; font-weight: 700; color: var(--ink); font-family: var(--serif); }
  .gp-phase-card-range { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
  .gp-phase-card-desc { font-size: 12.5px; color: var(--muted); line-height: 1.55; margin-bottom: 12px; }
  .gp-phase-card-count { font-size: 12px; font-weight: 600; color: var(--teal-d); margin-bottom: 12px; }

  .gp-upcoming { display: flex; align-items: center; gap: 12px; background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 14px 18px; margin-bottom: 24px; flex-wrap: wrap; }
  .gp-upcoming-label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .gp-upcoming-title { font-size: 13.5px; font-weight: 600; color: var(--ink); }
  .gp-upcoming-due { font-size: 12px; color: var(--teal-d); font-weight: 600; white-space: nowrap; }

  .gp-companies { margin-bottom: 24px; }
  .gp-companies-title-row { margin-bottom: 14px; }
  .gp-companies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
  .gp-company-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 10px; background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); cursor: default; }
  .gp-company-more { cursor: pointer; }
  .gp-company-mono { width: 40px; height: 40px; border-radius: 50%; background: var(--teal-l); color: var(--teal-d); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; }
  .gp-company-name { font-size: 11.5px; font-weight: 600; color: var(--ink); text-align: center; }

  .gp-phase { margin-bottom: 28px; scroll-margin-top: 20px; }
  .gp-phase-header { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
  .gp-phase-title { font-size: 16px; font-weight: 700; color: var(--ink); font-family: var(--serif); }
  .gp-phase-range { font-size: 12px; color: var(--muted); white-space: nowrap; flex-shrink: 0; }

  .gp-milestone { background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); margin-bottom: 10px; transition: box-shadow 0.15s ease, border-color 0.15s ease; overflow: hidden; }
  .gp-milestone:hover { border-color: var(--teal-mid); box-shadow: var(--sh-sm); }
  .gp-milestone-row { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; }
  .gp-milestone-check { width: 24px; height: 24px; min-width: 24px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-top: 1px; }
  .gp-milestone-body { flex: 1; min-width: 0; }
  .gp-milestone-title { font-size: 14.5px; font-weight: 600; color: var(--ink); line-height: 1.45; margin-bottom: 8px; }
  .gp-milestone-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .gp-type-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; white-space: nowrap; }
  .gp-month { font-size: 11.5px; color: var(--muted); white-space: nowrap; }
  .gp-expand-hint { font-size: 11px; color: var(--teal); font-weight: 600; margin-left: auto; }
  .gp-milestone-detail { padding: 0 16px 16px 52px; }
  .gp-detail-block { margin-bottom: 12px; }
  .gp-detail-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
  .gp-detail-text { font-size: 13px; color: var(--ink); line-height: 1.55; }
  .gp-detail-step { display: flex; gap: 8px; font-size: 13px; color: var(--ink); line-height: 1.5; margin-bottom: 6px; }
  .gp-detail-step-num { width: 18px; height: 18px; min-width: 18px; border-radius: 50%; background: var(--teal-l); color: var(--teal-d); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
  .gp-detail-cta { display: inline-flex; font-size: 12.5px; font-weight: 600; color: var(--teal-d); text-decoration: none; margin-top: 4px; }

  .gp-tip-bar { display: flex; align-items: center; gap: 10px; background: var(--teal-xl); border: 1px solid var(--teal-mid); border-radius: var(--r-md); padding: 12px 16px; font-size: 12.5px; color: var(--teal-d); margin-top: 8px; }

  @media (max-width: 480px) {
    .gp-hero { flex-direction: column; align-items: flex-start; }
    .gp-hero-right { align-self: center; }
    .gp-upcoming { flex-direction: column; align-items: flex-start; }
  }
`