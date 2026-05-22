//components/growdna/GrowDNAAssessment.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAllQuestions,
  getModuleBQuestions,
  MODULE_A,
  MODULE_C,
  type Question,
} from '@/lib/growdna/questions'

// ── Types ────────────────────────────────────────────────────────
interface Props {
  userId: string
  existingResult: {
    id: string
    career_archetype: string | null
    earning_gap: number | null
    hrs_score: number | null
    created_at: string
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
  }
}

type Answers = Record<string, string | string[] | number>

// ── Helpers ──────────────────────────────────────────────────────
function fmt(n: number) {
  if (!n) return '—'
  const v = Math.round(n)
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + 'Cr'
  if (v >= 100000) return '₹' + (v / 100000).toFixed(1) + 'L'
  return '₹' + v.toLocaleString('en-IN')
}

const ARCHETYPE_EMOJI: Record<string, string> = {
  'The Strategic Climber': '🎯',
  'The Hidden Gem': '💎',
  'The Market Mover': '🚀',
  'The Deep Expert': '🧠',
  'The Career Drifter': '🌊',
  'The Visibility Gap': '👤',
  'The Negotiation Leaver': '💸',
}

// ── Sub-components ───────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
          Question {current} of {total}
        </span>
        <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--amber),var(--teal))', width: `${pct}%`, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function ModuleBadge({ module }: { module: string }) {
  const labels: Record<string, { label: string; color: string }> = {
    A: { label: 'Market Facts', color: 'var(--amber)' },
    B: { label: 'Human Capital', color: 'var(--teal)' },
    C: { label: 'Career Behaviour', color: '#7C3AED' },
  }
  const m = labels[module]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${m.color}15`, border: `1px solid ${m.color}40`, color: m.color, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
      Module {module} — {m.label}
    </div>
  )
}

function MCQQuestion({ q, value, onChange }: { q: Question; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {q.options?.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            width: '100%', padding: '13px 16px',
            background: value === opt.value ? 'var(--teal-l)' : 'var(--paper)',
            border: `1.5px solid ${value === opt.value ? 'var(--teal)' : 'var(--border)'}`,
            borderRadius: 'var(--r-md)', textAlign: 'left', cursor: 'pointer',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: value === opt.value ? 600 : 400, color: value === opt.value ? 'var(--teal-d)' : 'var(--ink)' }}>
              {opt.label}
            </div>
            {opt.sublabel && (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{opt.sublabel}</div>
            )}
          </div>
          <div style={{ width: 18, height: 18, minWidth: 18, borderRadius: '50%', border: `2px solid ${value === opt.value ? 'var(--teal)' : 'var(--border)'}`, background: value === opt.value ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {value === opt.value && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
          </div>
        </button>
      ))}
    </div>
  )
}

function MultiSelectQuestion({ q, value, onChange }: { q: Question; value: string[]; onChange: (v: string[]) => void }) {
  function toggle(v: string) {
    if (v === 'none' || v === 'none_cert') {
      onChange([v])
      return
    }
    const filtered = value.filter(x => x !== 'none' && x !== 'none_cert')
    onChange(filtered.includes(v) ? filtered.filter(x => x !== v) : [...filtered, v])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Select all that apply</div>
      {q.options?.map(opt => {
        const selected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            style={{
              width: '100%', padding: '12px 16px',
              background: selected ? 'var(--teal-l)' : 'var(--paper)',
              border: `1.5px solid ${selected ? 'var(--teal)' : 'var(--border)'}`,
              borderRadius: 'var(--r-md)', textAlign: 'left', cursor: 'pointer',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{ width: 18, height: 18, minWidth: 18, borderRadius: 4, border: `2px solid ${selected ? 'var(--teal)' : 'var(--border)'}`, background: selected ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {selected && <svg width="10" height="10" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{ fontSize: 14, fontWeight: selected ? 600 : 400, color: selected ? 'var(--teal-d)' : 'var(--ink)' }}>{opt.label}</div>
          </button>
        )
      })}
    </div>
  )
}

function TapScaleQuestion({ q, value, onChange }: { q: Question; value: number; onChange: (v: number) => void }) {
  const count = q.scaleCount ?? 5
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 8, marginBottom: 12 }}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            style={{
              padding: '14px 4px', borderRadius: 'var(--r-md)', border: `1.5px solid ${value === i ? 'var(--teal)' : 'var(--border)'}`,
              background: value === i ? 'var(--teal)' : 'var(--paper)',
              color: value === i ? '#fff' : 'var(--ink)', cursor: 'pointer',
              fontSize: 12, fontWeight: value === i ? 700 : 400, transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600 }}>{q.scaleLabels?.[i] ?? i}</span>
          </button>
        ))}
      </div>
      {value >= 0 && q.scaleInsight?.[value] && (
        <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: 'var(--teal-d)', fontStyle: 'italic' }}>
          {q.scaleInsight[value]}
        </div>
      )}
    </div>
  )
}

function SalaryQuestion({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(value ? (value / 100000).toString() : '')

  function handleChange(raw: string) {
    setDisplay(raw)
    const num = parseFloat(raw)
    if (!isNaN(num)) onChange(Math.round(num * 100000))
  }

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>₹</span>
        <input
          type="number"
          value={display}
          onChange={e => handleChange(e.target.value)}
          placeholder="e.g. 8 for ₹8 Lakhs"
          style={{ width: '100%', padding: '13px 14px 13px 26px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 15, fontFamily: 'var(--sans)', outline: 'none', background: 'var(--paper)', color: 'var(--ink)' }}
        />
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--muted)' }}>Lakhs per year</span>
      </div>
      {value > 0 && (
        <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 500 }}>
          = {fmt(value)} annual CTC
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        {[3, 5, 8, 12, 18, 25, 35, 50].map(l => (
          <button key={l} onClick={() => { setDisplay(l.toString()); onChange(l * 100000) }}
            style={{ padding: '6px 12px', borderRadius: 99, border: `1px solid ${value === l * 100000 ? 'var(--teal)' : 'var(--border)'}`, background: value === l * 100000 ? 'var(--teal-l)' : 'var(--paper)', fontSize: 12, color: value === l * 100000 ? 'var(--teal-d)' : 'var(--muted)', cursor: 'pointer', fontWeight: value === l * 100000 ? 600 : 400 }}>
            ₹{l}L
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Result Panel ─────────────────────────────────────────────────
function ResultPanel({ result, onRetake }: { result: AIResult; onRetake: () => void }) {
  const router = useRouter()
  const emoji = ARCHETYPE_EMOJI[result.career_archetype] ?? '🎯'

  const dims = [
    { label: 'Market Alignment', val: result.scores.market_alignment, color: 'var(--amber)' },
    { label: 'Skill Premium', val: result.scores.skill_premium, color: 'var(--teal)' },
    { label: 'Visibility', val: result.scores.visibility, color: '#7C3AED' },
    { label: 'Career Mobility', val: result.scores.mobility, color: '#0891B2' },
    { label: 'Negotiation', val: result.scores.negotiation, color: '#DC2626' },
  ]

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 0 60px' }}>
      {/* Archetype hero */}
      <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-xl)', padding: 32, textAlign: 'center', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ fontSize: 52, marginBottom: 12 }}>{emoji}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your career archetype</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 600, color: '#fff', marginBottom: 12 }}>{result.career_archetype}</div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, maxWidth: 420, margin: '0 auto 20px' }}>{result.archetype_desc}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 500, padding: '6px 16px', borderRadius: 99 }}>
          Hiring Readiness Score: <strong style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{result.scores.hrs}</strong> / 1000
        </div>
      </div>

      {/* Earning Gap */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Annual Gap</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{fmt(result.earning_gap_estimate)}</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '0 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Market Value</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: 'var(--teal)' }}>{fmt(result.target_salary)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Months to close</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>{result.months_to_close}</div>
          </div>
        </div>
        <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 12, color: 'var(--teal-d)' }}>
          {result.peer_comparison}
        </div>
      </div>

      {/* Dimension scores */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Your 5 earning dimensions</div>
        {dims.map(d => (
          <div key={d.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.val}/100</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: d.color, width: `${d.val}%`, borderRadius: 99, transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-d)', marginBottom: 12 }}>✅ Top strengths</div>
          {result.top_strengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--teal)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{s}
            </div>
          ))}
        </div>
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#C2410C', marginBottom: 12 }}>⚠️ Critical gaps</div>
          {result.critical_gaps.map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
              <span style={{ color: '#EA580C', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{g}
            </div>
          ))}
        </div>
      </div>

      {/* Immediate actions */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Your 3 immediate actions</div>
        {result.immediate_actions.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < 2 ? 14 : 0, marginBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? '1px solid var(--border-l)' : 'none' }}>
            <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: '50%', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--teal-d)', marginTop: 2 }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{a.action}</div>
              <div style={{ fontSize: 12, color: 'var(--teal)', marginBottom: 2 }}>Impact: {a.impact}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Timeline: {a.timeline}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Market insight */}
      <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, fontStyle: 'italic' }}>{result.market_insight}</div>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: 14, background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 4px 16px rgba(14,122,90,0.2)' }}>
          View my full GrowPath dashboard →
        </button>
        <button onClick={onRetake} style={{ width: '100%', padding: 12, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
          Retake assessment
        </button>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────
export default function GrowDNAAssessment({ userId, existingResult }: Props) {
  const [answers, setAnswers] = useState<Answers>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([...MODULE_A])
  const [state, setState] = useState<'intro' | 'assessment' | 'loading' | 'result'>(
    existingResult?.career_archetype ? 'result' : 'intro'
  )
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState('')

  // Update questions when seniority changes
  useEffect(() => {
    if (answers.seniority) {
      const modB = getModuleBQuestions(answers.seniority as string)
      setQuestions([...MODULE_A, ...modB, ...MODULE_C])
    }
  }, [answers.seniority])

  const current = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  function getAnswer(): string | string[] | number {
    if (!current) return ''
    if (current.type === 'multiselect') return (answers[current.id] as string[]) ?? []
    if (current.type === 'tapscale') return (answers[current.id] as number) ?? -1
    if (current.type === 'salary') return (answers[current.id] as number) ?? 0
    return (answers[current.id] as string) ?? ''
  }

  function setAnswer(val: string | string[] | number) {
    setAnswers(prev => ({ ...prev, [current.id]: val }))
  }

  function isAnswered(): boolean {
    const val = getAnswer()
    if (current?.type === 'multiselect') return (val as string[]).length > 0
    if (current?.type === 'tapscale') return (val as number) >= 0
    if (current?.type === 'salary') return (val as number) > 0
    if (!current?.required) return true
    return !!val
  }

  function next() {
    if (!isAnswered() && current?.required) {
      setError('Please answer this question to continue.')
      return
    }
    setError('')
    if (isLast) { submit(); return }
    setCurrentIdx(i => i + 1)
  }

  function back() {
    if (currentIdx > 0) { setCurrentIdx(i => i - 1); setError('') }
  }

  async function submit() {
    setState('loading')
    try {
      const res = await fetch('/api/growdna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) throw new Error('API error ' + res.status)
      const data: AIResult = await res.json()
      setResult(data)
      setState('result')
    } catch (e) {
      setState('assessment')
      setError('Analysis failed. Please try again.')
    }
  }

  // ── INTRO screen
  if (state === 'intro') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🧬</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>
            Discover your<br /><em style={{ fontStyle: 'italic', color: 'var(--teal)' }}>GrowDNA</em>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 420, margin: '0 auto 28px' }}>
            10 questions. 4 minutes. A personalised career archetype, your exact Earning Gap, and the 3 actions that will close it fastest.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto 32px' }}>
            {[
              { ico: '🧬', t: 'Career archetype + HRS score' },
              { ico: '💰', t: 'Exact Earning Gap in rupees' },
              { ico: '🗺️', t: 'Personalised GrowPath roadmap' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)', padding: '12px 16px' }}>
                <span style={{ fontSize: 20 }}>{f.ico}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--teal-d)' }}>{f.t}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setState('assessment')}
            style={{ background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 99, padding: '14px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 4px 16px rgba(14,122,90,0.22)' }}
          >
            Start my assessment →
          </button>
        </div>
      </div>
    )
  }

  // ── LOADING screen
  if (state === 'loading') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, border: '3px solid var(--teal-l)', borderTop: '3px solid var(--teal)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 24px' }} />
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Analysing your profile…</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
          AI is calculating your career archetype, Earning Gap, and personalised GrowPath. This takes about 10 seconds.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 28, textAlign: 'left' }}>
          {['Evaluating your market position', 'Benchmarking against verified peers', 'Calculating your 5 earning dimensions', 'Building your personalised roadmap'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--teal-d)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }} />
              {s}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── RESULT screen
  if (state === 'result' && result) {
    return (
      <div style={{ padding: '24px 24px 0' }}>
        <ResultPanel result={result} onRetake={() => { setAnswers({}); setCurrentIdx(0); setState('intro'); setResult(null) }} />
      </div>
    )
  }

  // ── ASSESSMENT screen
  if (!current) return null

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 24px 60px' }}>
      <ProgressBar current={currentIdx + 1} total={questions.length} />

      <ModuleBadge module={current.module} />

      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,26px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.2 }}>
        {current.title}
      </h2>
      {current.subtitle && (
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.65 }}>{current.subtitle}</p>
      )}

      {/* Question renderer */}
      {current.type === 'mcq' && (
        <MCQQuestion q={current} value={getAnswer() as string} onChange={setAnswer} />
      )}
      {current.type === 'multiselect' && (
        <MultiSelectQuestion q={current} value={getAnswer() as string[]} onChange={setAnswer} />
      )}
      {current.type === 'tapscale' && (
        <TapScaleQuestion q={current} value={getAnswer() as number} onChange={setAnswer} />
      )}
      {current.type === 'salary' && (
        <SalaryQuestion value={getAnswer() as number} onChange={setAnswer} />
      )}

      {error && (
        <div style={{ background: 'var(--red-l)', border: '1px solid #F5CCCC', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginTop: 14 }}>
          {error}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
        {currentIdx > 0 && (
          <button onClick={back} style={{ padding: '13px 22px', background: 'var(--paper)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 500, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            ← Back
          </button>
        )}
        <button
          onClick={next}
          style={{ flex: 1, padding: 14, background: isAnswered() ? 'var(--teal)' : 'var(--border)', color: isAnswered() ? '#fff' : 'var(--muted)', border: 'none', borderRadius: 'var(--r-md)', fontSize: 15, fontWeight: 600, cursor: isAnswered() ? 'pointer' : 'not-allowed', fontFamily: 'var(--sans)', transition: 'all 0.2s', boxShadow: isAnswered() ? '0 4px 16px rgba(14,122,90,0.2)' : 'none' }}
        >
          {isLast ? 'Get my GrowDNA results →' : 'Continue →'}
        </button>
      </div>

      {/* Skip for optional */}
      {!current.required && (
        <button onClick={() => { setCurrentIdx(i => i + 1); setError('') }} style={{ width: '100%', marginTop: 10, padding: 10, background: 'transparent', border: 'none', fontSize: 12, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
          Skip this question
        </button>
      )}
    </div>
  )
}