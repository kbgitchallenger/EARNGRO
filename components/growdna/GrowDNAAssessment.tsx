'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { consumeCalcPrefill, type CalcPrefill } from '@/lib/growdna/calcPrefill'
import {
  MODULE_A, getModuleBQuestions, MODULE_C,
  type Question, type Option, calculateScores
} from '@/lib/growdna/questions'
import {
  checkTeamScaleConsistency,
  checkSeniorityConsistency,
  checkPLConsistency,
  type CVFacts,
} from '@/lib/growdna/cvConsistency'
import LimitReachedCard from '@/components/shared/LimitReachedCard'

// ── Types ─────────────────────────────────────────────────────────
interface Props {
  userId: string
  cvFacts?: CVFacts
  canRetake?: boolean
  limitReason?: 'FREE_LIMIT_REACHED' | 'INSUFFICIENT_CREDITS' | null
  existingResult: {
    id: string
    career_archetype: string
    earning_gap: number
    hrs_score: number
    created_at: string
    target_salary?: number | null
    months_to_close?: number | null
    current_salary?: number | null
    salary_range_min?: number | null
    salary_range_max?: number | null
    dimension_scores?: {
      market_alignment?: number
      skill_premium?: number
      visibility?: number
      mobility?: number
      negotiation?: number
      explanations?: Record<string, string[]>
    } | null
    raw_ai_response?: {
      archetype_desc?: string
      market_insight?: string
      peer_comparison?: string
      top_strengths?: string[]
      immediate_actions?: { action: string; impact: string; timeline: string }[]
    } | null
    gap_reasons?: string[] | null
    close_actions?: { action: string; impact: string; timeline: string }[] | string[] | null
    role?: string | null
    city?: string | null
  } | null
}

interface AIResult {
  id: string
  career_archetype: string
  archetype_desc: string
  earning_gap_estimate: number
  target_salary: number
  months_to_close: number
  top_strengths: string[]
  critical_gaps: string[]
  immediate_actions: { action: string; impact: string; timeline: string }[]
  market_insight: string
  salary_range_min: number
  salary_range_max: number
  peer_comparison: string
  scores: {
    market_alignment: number
    skill_premium: number
    visibility: number
    mobility: number
    negotiation: number
    hrs: number
    explanations?: Record<string, string[]>
  }
}

type Answers = Record<string, string | string[] | number>

// ── Helpers ───────────────────────────────────────────────────────
function fmt(n: number) {
  if (!n) return '—'
  const v = Math.round(n)
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + 'Cr'
  if (v >= 100000)   return '₹' + (v / 100000).toFixed(1) + 'L'
  return '₹' + v.toLocaleString('en-IN')
}

const ARCHETYPE_EMOJI: Record<string, string> = {
  'The Strategic Climber':   '🎯',
  'The Hidden Gem':          '💎',
  'The Market Ready Pro':    '🚀',
  'The Deep Expert':         '🧠',
  'The Career Drifter':      '🌊',
  'The Visibility Gap':      '👤',
  'The Underpaid Expert':    '💸',
  'The Loyal Underpaid':     '🔒',
  'The Fast Starter':        '⚡',
  'The Late Bloomer':        '🌱',
  'The Growth Professional': '📈',
}

function groupOptions(options: Option[]): Record<string, Option[]> {
  return options.reduce((acc, opt) => {
    const g = opt.group || 'Options'
    if (!acc[g]) acc[g] = []
    acc[g].push(opt)
    return acc
  }, {} as Record<string, Option[]>)
}

// ── Option Card ───────────────────────────────────────────────────
function OptionCard({ option, selected, onClick, multi }: {
  option: Option; selected: boolean; onClick: () => void; multi?: boolean
}) {
  return (
    <button onClick={onClick} className={`option-card${selected ? ' selected' : ''}`} type="button">
      {option.icon && <span className="option-icon">{option.icon}</span>}
      <span className="option-label">{option.label}</span>
      {option.sublabel && <span className="option-sublabel">{option.sublabel}</span>}
      {selected && <span className="option-check">{multi ? '✓' : '●'}</span>}
    </button>
  )
}

// ── Tap Scale ─────────────────────────────────────────────────────
function TapScale({ question, value, onChange }: {
  question: Question; value: number | undefined; onChange: (v: number) => void
}) {
  const count    = question.scaleCount  || 5
  const labels   = question.scaleLabels || []
  const insights = question.scaleInsight || []
  const selected = value ?? -1

  return (
    <div className="tapscale-wrap">
      <div className="tapscale-grid" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" onClick={() => onChange(i)}
            className={`tapscale-seg${selected === i ? ' selected' : ''}`}>
            <span className="tapscale-label">{labels[i] || i}</span>
          </button>
        ))}
      </div>
      {selected >= 0 && insights[selected] && (
        <div className="tapscale-insight">
          <span className="tapscale-insight-dot" />{insights[selected]}
        </div>
      )}
    </div>
  )
}

// ── Salary Input ──────────────────────────────────────────────────
function SalaryInput({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(value ? String(value) : '')

  function fmtPreview(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
    if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`
    if (n > 0)         return `₹${n.toLocaleString('en-IN')}`
    return ''
  }

  return (
    <div className="salary-wrap">
      <div className="salary-input-wrap">
        <span className="salary-sym">₹</span>
        <input type="number" className="salary-input" placeholder="e.g. 800000" value={raw}
          onChange={e => { setRaw(e.target.value); const n = parseFloat(e.target.value); if (!isNaN(n) && n > 0) onChange(n) }}
          min={0} />
      </div>
      {value && value > 0 && <div className="salary-preview">{fmtPreview(value)} per year</div>}
      <div className="salary-hint">Annual CTC · base salary only · no variable or ESOPs</div>
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────
function ProgressBar({ current, total, module }: { current: number; total: number; module: string }) {
  const pct = Math.round((current / total) * 100)
  const moduleLabels: Record<string, string> = { A: 'Your Profile', B: 'Your Background', C: 'Your Mindset' }

  return (
    <div className="dna-progress">
      <div className="dna-progress-top">
        <span className="dna-progress-module">{moduleLabels[module] || 'Assessment'}</span>
        <span className="dna-progress-count">{current} of {total}</span>
      </div>
      <div className="dna-progress-track">
        <div className="dna-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Result Panel ──────────────────────────────────────────────────
function ResultPanel({ result, onRetake }: { result: AIResult; onRetake: () => void }) {
  const router = useRouter()
  const emoji = ARCHETYPE_EMOJI[result.career_archetype] ?? '🎯'

  // Normalise scores — API may return them nested or flat
  const raw = result as unknown as Record<string, number | Record<string, string[]>>
  const s   = result.scores ?? {}
  const sc = (k: string) => {
    const v1 = (s as Record<string, unknown>)[k]
    if (typeof v1 === 'number') return v1
    const v2 = raw[k]
    if (typeof v2 === 'number') return v2
    return 0
  }

  const dims = [
    { key: 'market_alignment', label: 'Market Alignment', val: sc('market_alignment'), color: 'var(--amber)' },
    { key: 'skill_premium',    label: 'Skill Premium',    val: sc('skill_premium'),    color: 'var(--teal)'  },
    { key: 'visibility',       label: 'Visibility',       val: sc('visibility'),       color: '#7C3AED'      },
    { key: 'mobility',         label: 'Career Mobility',  val: sc('mobility'),         color: '#0891B2'      },
    { key: 'negotiation',      label: 'Negotiation',      val: sc('negotiation'),      color: '#DC2626'      },
  ]
  const hrs = sc('hrs')
  const explanations = result.scores?.explanations ?? {}
  const strengths     = result.top_strengths      ?? []
  const gaps          = result.critical_gaps       ?? []
  const actions       = result.immediate_actions   ?? []
  const peerComp      = result.peer_comparison     ?? ''
  const insight       = result.market_insight      ?? ''
  const earningGap    = result.earning_gap_estimate ?? 0
  const targetSalary  = result.target_salary        ?? 0
  const monthsToClose = result.months_to_close      ?? 0
  const archetypeDesc = result.archetype_desc       ?? ''

  return (
    <div className="dna-result-wrap">

      {/* Archetype hero */}
      <div className="dna-hero">
        <div className="dna-hero-blob" />
        <div className="dna-hero-emoji">{emoji}</div>
        <div className="dna-hero-eyebrow">Your career archetype</div>
        <div className="dna-hero-title">{result.career_archetype}</div>
        <p className="dna-hero-desc">{archetypeDesc}</p>
        <div className="dna-hero-hrs">
        
        <span className="dna-hero-label">
        Hiring Readiness<br />Score
        </span>

        <div className="dna-hero-score">
        <span className="dna-score">{hrs}</span>
        <span className="dna-total">/1000</span>
  </div>
</div>
      </div>

      {/* Earning Gap */}
      <div className="dna-card">
        <div className="dna-stats-grid">
          <div className="dna-stat">
            <div className="dna-stat-label">Annual Gap</div>
            <div className="dna-stat-val" style={{ color: 'var(--red)' }}>{fmt(earningGap)}</div>
          </div>
          <div className="dna-stat dna-stat-mid">
            <div className="dna-stat-label">Market Value</div>
            <div className="dna-stat-val" style={{ color: 'var(--teal)' }}>{fmt(targetSalary)}</div>
          </div>
          <div className="dna-stat">
            <div className="dna-stat-label">Months to close</div>
            <div className="dna-stat-val" style={{ color: 'var(--ink)' }}>{monthsToClose}</div>
          </div>
        </div>
        {peerComp && (
          <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 12, color: 'var(--teal-d)', marginTop: 16 }}>
            {peerComp}
          </div>
        )}
      </div>

      {/* 5 Earning dimensions */}
      <div className="dna-card">
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Your 5 earning dimensions</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>Based directly on your answers below</div>
        {dims.map(d => {
          const notes = explanations[d.key] ?? []
          return (
            <div key={d.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.val}/100</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: notes.length ? 8 : 0 }}>
                <div style={{ height: '100%', background: d.color, width: `${d.val}%`, borderRadius: 99, transition: 'width 1s ease' }} />
              </div>
              {notes.map((note, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, paddingLeft: 2, marginBottom: 3, display: 'flex', gap: 6 }}>
                  <span style={{ color: d.color, flexShrink: 0 }}>•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Strengths & Gaps */}
      {(strengths.length > 0 || gaps.length > 0) && (
        <div className="dna-sg-grid">
          {strengths.length > 0 && (
            <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-d)', marginBottom: 12 }}>✅ Top strengths</div>
              {strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--teal)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{s}
                </div>
              ))}
            </div>
          )}
          {gaps.length > 0 && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#C2410C', marginBottom: 12 }}>⚠️ Critical gaps</div>
              {gaps.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
                  <span style={{ color: '#EA580C', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{g}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Immediate actions */}
      {actions.length > 0 && (
        <div className="dna-card">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Your {actions.length} immediate actions</div>
          {actions.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < actions.length - 1 ? 14 : 0, marginBottom: i < actions.length - 1 ? 14 : 0, borderBottom: i < actions.length - 1 ? '1px solid var(--border-l)' : 'none' }}>
              <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: '50%', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--teal-d)', marginTop: 2 }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{a.action}</div>
                <div style={{ fontSize: 12, color: 'var(--teal)', marginBottom: 2 }}>Impact: {a.impact}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Timeline: {a.timeline}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Market insight */}
      {insight && (
        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, fontStyle: 'italic' }}>{insight}</div>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => router.push('/growpath')}
          style={{ width: '100%', padding: 14, background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 4px 16px rgba(14,122,90,0.2)' }}>
          View my full GrowPath dashboard →
        </button>
        <button onClick={onRetake}
          style={{ width: '100%', padding: 12, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
          Retake assessment
        </button>
      </div>

      <style>{`
        .dna-result-wrap {
          max-width: 620px;
          margin: 0 auto;
          padding: 0 0 60px;
        }
        .dna-card {
          background: var(--paper);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 24px;
          margin-bottom: 14px;
        }
        .dna-hero {
          background: linear-gradient(135deg,var(--teal-d),var(--teal));
          border-radius: var(--r-xl);
          padding: 32px;
          text-align: center;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .dna-hero-blob {
          position: absolute; top: -40px; right: -40px; width: 120px; height: 120px;
          background: rgba(255,255,255,0.05); border-radius: 50%;
        }
        .dna-hero-emoji { font-size: 52px; margin-bottom: 12px; position: relative; }
        .dna-hero-eyebrow {
          font-size: 11px; color: rgba(255,255,255,0.55); text-transform: uppercase;
          letter-spacing: 0.1em; margin-bottom: 8px; position: relative;
        }
        .dna-hero-title {
          font-family: var(--serif); font-size: clamp(22px,6vw,32px); font-weight: 600;
          color: #fff; margin-bottom: 12px; position: relative; line-height: 1.25;
        }
        .dna-hero-desc {
          font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.65;
          max-width: 420px; margin: 0 auto 20px; position: relative;
        }
        .dna-hero-hrs {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; font-size: 12px; font-weight: 500; padding: 6px 16px;
          border-radius: 99px; position: relative;
        }
        .dna-hero-hrs strong { font-family: var(--serif); font-size: 16px; }

        /* Bug fix: fixed 3-col grid + fixed 24px font caused overlapping
           numbers on narrow phones ("28.0L" colliding with "14"). Now scales
           down and stacks to a single column below 420px. */
        .dna-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }
        .dna-stat { text-align: center; }
        .dna-stat-mid {
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          padding: 0 12px;
        }
        .dna-stat-label {
          font-size: 10px; color: var(--muted); text-transform: uppercase;
          letter-spacing: 0.06em; margin-bottom: 4px;
        }
        .dna-stat-val {
          font-family: var(--serif); font-weight: 700;
          font-size: clamp(18px, 6vw, 24px);
          white-space: nowrap;
        }

        /* Bug fix: fixed 2-col Strengths/Gaps grid had no mobile override,
           forcing long sentences into unreadably narrow columns. */
        .dna-sg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 14px;
        }

        @media (max-width: 480px) {
          .dna-hero { padding: 24px 20px; }
          .dna-card { padding: 18px; }
          .dna-stats-grid { grid-template-columns: 1fr; gap: 14px; }
          .dna-stat-mid {
            border-left: none; border-right: none; padding: 0;
            border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
            padding: 10px 0;
          }
          .dna-stat-val { font-size: 22px; }
        }

        @media (max-width: 640px) {
          .dna-sg-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function GrowDNAAssessment({ userId, existingResult, cvFacts, canRetake, limitReason }: Props) {
  const [answers, setAnswers]       = useState<Answers>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [result, setResult]         = useState<AIResult | null>(null)
  const [showExisting, setShowExisting] = useState(!!existingResult)
  const [nudge, setNudge] = useState<string | null>(null)
  const [showLimitCard, setShowLimitCard] = useState(false)
  const [limitReasonOverride, setLimitReasonOverride] = useState<'FREE_LIMIT_REACHED' | 'INSUFFICIENT_CREDITS' | null>(null)
  const [prefillApplied, setPrefillApplied] = useState(false)

  const seniority = (answers.seniority as string) || 'mid'
  const role = answers.role as string | undefined
  const industry = answers.industry as string | undefined
  const questions: Question[] = [...MODULE_A, ...getModuleBQuestions(seniority, role, industry), ...MODULE_C]

  const current = questions[currentIdx]
  const totalQ  = questions.length
  const isLast  = currentIdx === totalQ - 1

  // ── Consume calculator prefill whenever the user is on a fresh
  // assessment (not viewing an existing result). Fires on mount for
  // brand-new users, and again whenever showExisting flips to false
  // (e.g. clicking "Retake assessment") — so returning users who ran
  // the Calculator right before retaking also get their answers carried over.
  useEffect(() => {
    if (showExisting) return

    const prefill = consumeCalcPrefill()
    if (!prefill) return

    const newFields: Answers = {
      ...(prefill.industry    ? { industry: prefill.industry }       : {}),
      ...(prefill.seniority   ? { seniority: prefill.seniority }     : {}),
      ...(prefill.role        ? { role: prefill.role }               : {}),
      ...(prefill.city        ? { city: prefill.city }               : {}),
      ...(prefill.current_ctc ? { current_ctc: prefill.current_ctc } : {}),
    }

    if (Object.keys(newFields).length === 0) return

    setAnswers(prev => ({ ...prev, ...newFields }))

    // Jump to the first MODULE_A question NOT covered by the prefill,
    // rather than assuming a fixed index — resilient to question reordering.
    const firstUnanswered = MODULE_A.findIndex(
      q => newFields[q.id as keyof Answers] === undefined
    )

    if (firstUnanswered === -1) {
      setCurrentIdx(MODULE_A.length) // every MODULE_A question was pre-filled
    } else if (firstUnanswered > 0) {
      setCurrentIdx(firstUnanswered)
    }

    setPrefillApplied(true)
  }, [showExisting])

  function getAnswer(qid: string) { return answers[qid] }

  function isAnswered(q: Question): boolean {
    const a = answers[q.id]
    if (q.type === 'salary')      return !!(a && Number(a) > 0)
    if (q.type === 'tapscale')    return a !== undefined && a !== null && a !== ''
    if (q.type === 'multiselect') return Array.isArray(a) && a.length > 0
    if (!q.required) return true
    return !!a
  }

  function setMCQ(qid: string, val: string) {
    setAnswers(prev => ({ ...prev, [qid]: val }))
    setNudge(null)

    if (cvFacts) {
      let warning = null
      if (qid === 'team_scale') warning = checkTeamScaleConsistency(val, cvFacts)
      if (qid === 'seniority') warning = checkSeniorityConsistency(val, cvFacts)
      if (qid === 'pl_exposure') warning = checkPLConsistency(val, cvFacts)

      if (warning) {
        setNudge(warning.message)
        return // don't auto-advance — let them see the nudge first
      }
    }

    setTimeout(() => { if (!isLast) setCurrentIdx(i => i + 1) }, 280)
  }

  function toggleMulti(qid: string, val: string) {
    setAnswers(prev => {
      const cur = (prev[qid] as string[]) || []
      if (['none', 'none_cert', 'no_premium', 'no_visibility'].includes(val)) return { ...prev, [qid]: [val] }
      const filtered = cur.filter(v => !['none', 'none_cert', 'no_premium', 'no_visibility'].includes(v))
      return { ...prev, [qid]: filtered.includes(val) ? filtered.filter(v => v !== val) : [...filtered, val] }
    })
  }

  function setTapScale(qid: string, val: number) { setAnswers(prev => ({ ...prev, [qid]: val })) }
  function setSalary(val: number) { setAnswers(prev => ({ ...prev, current_ctc: val })) }
  function goNext() { if (isLast) { handleSubmit(); return }; setCurrentIdx(i => Math.min(i + 1, totalQ - 1)) }
  function goBack() { setCurrentIdx(i => Math.max(i - 1, 0)) }

  function handleRetakeClick() {
    if (canRetake === false) {
      setShowLimitCard(true)
      return
    }
    setResult(null)
    setAnswers({})
    setCurrentIdx(0)
    setPrefillApplied(false)
    setShowExisting(false)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const scores = calculateScores(answers)
      const res = await fetch('/api/growdna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, scores }),
      })

      if (res.status === 402) {
        const body = await res.json().catch(() => ({}))
        setSubmitting(false)
        setLimitReasonOverride(body.error === 'INSUFFICIENT_CREDITS' ? 'INSUFFICIENT_CREDITS' : 'FREE_LIMIT_REACHED')
        setShowLimitCard(true)
        return
      }

      if (!res.ok) throw new Error('Submission failed')
      const data: AIResult = await res.json()
      setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Limit reached — show before anything else ─────────────────
  if (showLimitCard) {
    const reason = limitReasonOverride ?? limitReason ?? 'FREE_LIMIT_REACHED'
    return (
      <div style={{ padding: '24px 24px 0' }}>
        <LimitReachedCard reason={reason} feature="growdna" />
      </div>
    )
  }

  // ── Result screen (fresh submission) ─────────────────────────
  if (result) {
    return (
      <div className="dna-result-page-pad" style={{ padding: '24px 24px 0' }}>
        <ResultPanel result={result} onRetake={handleRetakeClick} />
        <style>{`
          @media (max-width: 640px) {
            .dna-result-page-pad { padding-bottom: 80px !important; }
          }
        `}</style>
      </div>
    )
  }

  // ── Existing result screen → full ResultPanel ─────────────────
  if (showExisting && existingResult) {
    const ai = existingResult.raw_ai_response ?? {}
    const ds = existingResult.dimension_scores ?? {}

    // Normalise close_actions — can be string[] or object[]
    const rawActions = existingResult.close_actions ?? []
    const normActions: { action: string; impact: string; timeline: string }[] = rawActions.map(a =>
      typeof a === 'string'
        ? { action: a, impact: '', timeline: '' }
        : a as { action: string; impact: string; timeline: string }
    )

    const mapped: AIResult = {
      id:                   existingResult.id,
      career_archetype:     existingResult.career_archetype ?? 'The Growth Professional',
      archetype_desc:       ai.archetype_desc ?? '',
      earning_gap_estimate: existingResult.earning_gap ?? 0,
      target_salary:        existingResult.target_salary ?? 0,
      months_to_close:      existingResult.months_to_close ?? 0,
      top_strengths:        ai.top_strengths ?? [],
      critical_gaps:        existingResult.gap_reasons ?? [],
      immediate_actions:    ai.immediate_actions ?? normActions,
      market_insight:       ai.market_insight ?? '',
      salary_range_min:     existingResult.salary_range_min ?? 0,
      salary_range_max:     existingResult.salary_range_max ?? 0,
      peer_comparison:      ai.peer_comparison
        ?? `Last assessed ${new Date(existingResult.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scores: {
        market_alignment: ds.market_alignment ?? 0,
        skill_premium:    ds.skill_premium    ?? 0,
        visibility:       ds.visibility       ?? 0,
        mobility:         ds.mobility         ?? 0,
        negotiation:      ds.negotiation      ?? 0,
        hrs:              existingResult.hrs_score ?? 0,
        explanations:     ds.explanations,
      },
    }
    return (
      <div className="dna-result-page-pad" style={{ padding: '24px 24px 0' }}>
        <ResultPanel result={mapped} onRetake={handleRetakeClick} />
        <style>{`
          @media (max-width: 640px) {
            .dna-result-page-pad { padding-bottom: 80px !important; }
          }
        `}</style>
      </div>
    )
  }

  // ── Assessment screen ─────────────────────────────────────────
  const cols = current?.columns || 3

  return (
    <div className="dna-assessment">
      <ProgressBar current={currentIdx + 1} total={totalQ} module={current?.module || 'A'} />

      {prefillApplied && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)',
          borderRadius: 'var(--r-md)', padding: '10px 16px', margin: '0 0 12px',
          fontSize: 12, color: 'var(--teal-d)',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>✨</span>
          <span>We pre-filled what we know from your calculation — just confirm and continue.</span>
          <button
            type="button"
            onClick={() => setPrefillApplied(false)}
            style={{ background: 'none', border: 'none', color: 'var(--teal-d)', cursor: 'pointer', fontSize: 16, marginLeft: 'auto', flexShrink: 0, padding: 0 }}
          >
            ×
          </button>
        </div>
      )}

      <div className="dna-question-wrap">
        <div className="dna-q-header">
          <div className="dna-q-num">Question {currentIdx + 1}</div>
          <h2 className="dna-q-title">{current?.title}</h2>
          {current?.subtitle && <p className="dna-q-sub">{current.subtitle}</p>}
          {current?.type === 'multiselect' && <div className="dna-multi-hint">Select all that apply</div>}
        </div>

        {current?.type === 'mcq' && current.options && (
          <div className={`option-grid cols-${cols}${current.grouped ? ' grouped' : ''}`}>
            {current.grouped ? (
              Object.entries(groupOptions(current.options)).map(([group, opts]) => (
                <div key={group} className="option-group">
                  <div className="option-group-label">{group}</div>
                  <div className={`option-grid cols-${cols}`}>
                    {opts.map(opt => (
                      <OptionCard key={opt.value} option={opt} selected={getAnswer(current.id) === opt.value} onClick={() => setMCQ(current.id, opt.value)} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              current.options.map(opt => (
                <OptionCard key={opt.value} option={opt} selected={getAnswer(current.id) === opt.value} onClick={() => setMCQ(current.id, opt.value)} />
              ))
            )}
          </div>
        )}

        {current?.type === 'multiselect' && current.options && (
          <div className={`option-grid cols-${cols}`}>
            {current.options.map(opt => (
              <OptionCard key={opt.value} option={opt} multi
                selected={((getAnswer(current.id) as string[]) || []).includes(opt.value)}
                onClick={() => toggleMulti(current.id, opt.value)} />
            ))}
          </div>
        )}

        {current?.type === 'tapscale' && (
          <TapScale question={current} value={getAnswer(current.id) as number | undefined} onChange={v => setTapScale(current.id, v)} />
        )}

        {current?.type === 'salary' && (
          <SalaryInput value={getAnswer('current_ctc') as number | undefined} onChange={setSalary} />
        )}
        {nudge && (
          <div className="dna-nudge">
            <span className="dna-nudge-icon">💡</span>
            <span className="dna-nudge-text">{nudge}</span>
            <button
              type="button"
              className="dna-nudge-dismiss"
              onClick={() => {
                setNudge(null)
                if (!isLast) setCurrentIdx(i => i + 1)
              }}
            >
              Confirm & continue →
            </button>
          </div>
        )}
        {error && <div className="dna-error">{error}</div>}
      </div>

      <div className="dna-footer">
        <button className="dna-back-btn" onClick={goBack} disabled={currentIdx === 0} type="button">← Back</button>

        {current?.type !== 'mcq' && (
          <button className={`dna-next-btn${!isAnswered(current) ? ' disabled' : ''}`}
            onClick={goNext} disabled={!isAnswered(current) || submitting} type="button">
            {submitting
              ? <span className="dna-submitting"><span className="dna-spin" />Analysing…</span>
              : isLast ? 'Calculate my Gap →' : 'Continue →'}
          </button>
        )}

        {current?.type === 'mcq' && isAnswered(current) && !isLast && (
          <button className="dna-next-btn" onClick={goNext} type="button">Continue →</button>
        )}

        {current?.type === 'mcq' && isLast && isAnswered(current) && (
          <button className="dna-next-btn" onClick={handleSubmit} disabled={submitting} type="button">
            {submitting ? <span className="dna-submitting"><span className="dna-spin" />Analysing…</span> : 'Calculate my Gap →'}
          </button>
        )}
      </div>
    </div>
  )
}