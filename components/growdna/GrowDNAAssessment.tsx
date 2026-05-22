'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MODULE_A, getModuleBQuestions, MODULE_C,
  type Question, type Option, calculateScores
} from '@/lib/growdna/questions'

interface Props {
  userId: string
  existingResult: { id: string; career_archetype: string; earning_gap: number; hrs_score: number; created_at: string } | null
}

type Answers = Record<string, string | string[] | number>

// Group options by their group field
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
  option: Option
  selected: boolean
  onClick: () => void
  multi?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`option-card${selected ? ' selected' : ''}`}
      type="button"
    >
      {option.icon && <span className="option-icon">{option.icon}</span>}
      <span className="option-label">{option.label}</span>
      {option.sublabel && <span className="option-sublabel">{option.sublabel}</span>}
      {selected && (
        <span className="option-check">{multi ? '✓' : '●'}</span>
      )}
    </button>
  )
}

// ── Tap Scale ─────────────────────────────────────────────────────
function TapScale({ question, value, onChange }: {
  question: Question
  value: number | undefined
  onChange: (v: number) => void
}) {
  const count = question.scaleCount || 5
  const labels = question.scaleLabels || []
  const insights = question.scaleInsight || []
  const selected = value ?? -1

  return (
    <div className="tapscale-wrap">
      <div className="tapscale-grid" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`tapscale-seg${selected === i ? ' selected' : ''}`}
          >
            <span className="tapscale-label">{labels[i] || i}</span>
          </button>
        ))}
      </div>
      {selected >= 0 && insights[selected] && (
        <div className="tapscale-insight">
          <span className="tapscale-insight-dot" />
          {insights[selected]}
        </div>
      )}
    </div>
  )
}

// ── Salary Input ──────────────────────────────────────────────────
function SalaryInput({ value, onChange }: {
  value: number | undefined
  onChange: (v: number) => void
}) {
  const [raw, setRaw] = useState(value ? String(value) : '')

  function fmt(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`
    if (n > 0) return `₹${n.toLocaleString('en-IN')}`
    return ''
  }

  return (
    <div className="salary-wrap">
      <div className="salary-input-wrap">
        <span className="salary-sym">₹</span>
        <input
          type="number"
          className="salary-input"
          placeholder="e.g. 800000"
          value={raw}
          onChange={e => {
            setRaw(e.target.value)
            const n = parseFloat(e.target.value)
            if (!isNaN(n) && n > 0) onChange(n)
          }}
          min={0}
        />
      </div>
      {value && value > 0 && (
        <div className="salary-preview">{fmt(value)} per year</div>
      )}
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

// ── Main Component ────────────────────────────────────────────────
export default function GrowDNAAssessment({ userId, existingResult }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Answers>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showExisting, setShowExisting] = useState(!!existingResult)

  // Build question list — re-compute when seniority answer changes
  const seniority = (answers.seniority as string) || 'mid'
  const questions: Question[] = [
    ...MODULE_A,
    ...getModuleBQuestions(seniority),
    ...MODULE_C,
  ]

  const current = questions[currentIdx]
  const totalQ = questions.length
  const isLast = currentIdx === totalQ - 1

  function getAnswer(qid: string) { return answers[qid] }

  function isAnswered(q: Question): boolean {
    const a = answers[q.id]
    if (q.type === 'salary') return !!(a && Number(a) > 0)
    if (q.type === 'tapscale') return a !== undefined && a !== null && a !== ''
    if (q.type === 'multiselect') return Array.isArray(a) && a.length > 0
    if (!q.required) return true
    return !!a
  }

  function setMCQ(qid: string, val: string) {
    setAnswers(prev => ({ ...prev, [qid]: val }))
    // Auto-advance MCQ after short delay
    setTimeout(() => {
      if (!isLast) setCurrentIdx(i => i + 1)
    }, 280)
  }

  function toggleMulti(qid: string, val: string) {
    setAnswers(prev => {
      const cur = (prev[qid] as string[]) || []
      // 'none' is exclusive
      if (val === 'none' || val === 'none_cert' || val === 'no_premium' || val === 'no_visibility') {
        return { ...prev, [qid]: [val] }
      }
      const filtered = cur.filter(v => v !== 'none' && v !== 'none_cert' && v !== 'no_premium' && v !== 'no_visibility')
      const exists = filtered.includes(val)
      return { ...prev, [qid]: exists ? filtered.filter(v => v !== val) : [...filtered, val] }
    })
  }

  function setTapScale(qid: string, val: number) {
    setAnswers(prev => ({ ...prev, [qid]: val }))
  }

  function setSalary(val: number) {
    setAnswers(prev => ({ ...prev, current_ctc: val }))
  }

  function goNext() {
    if (isLast) { handleSubmit(); return }
    setCurrentIdx(i => Math.min(i + 1, totalQ - 1))
  }

  function goBack() {
    setCurrentIdx(i => Math.max(i - 1, 0))
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
      if (!res.ok) throw new Error('Submission failed')
      router.push('/dashboard?dna=complete')
      router.refresh()
    } catch (e) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Existing result screen ────────────────────────────────────
  if (showExisting && existingResult) {
    return (
      <div className="dna-existing">
        <div className="dna-existing-card">
          <div className="dna-existing-ico">🧬</div>
          <h2>Your GrowDNA is active</h2>
          <p>Last assessed {new Date(existingResult.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <div className="dna-existing-stats">
            <div className="dna-existing-stat">
              <div className="des-label">Career archetype</div>
              <div className="des-value">{existingResult.career_archetype || '—'}</div>
            </div>
            <div className="dna-existing-stat">
              <div className="des-label">HRS Score</div>
              <div className="des-value teal">{existingResult.hrs_score || '—'} / 1000</div>
            </div>
          </div>
          <div className="dna-existing-actions">
            <a href="/dashboard" className="btn-primary-app">View my dashboard →</a>
            <button className="btn-retake" onClick={() => setShowExisting(false)}>
              Retake assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Question renderer ─────────────────────────────────────────
  const cols = current?.columns || 3

  return (
    <div className="dna-assessment">
      <ProgressBar current={currentIdx + 1} total={totalQ} module={current?.module || 'A'} />

      <div className="dna-question-wrap">
        {/* Question header */}
        <div className="dna-q-header">
          <div className="dna-q-num">Question {currentIdx + 1}</div>
          <h2 className="dna-q-title">{current?.title}</h2>
          {current?.subtitle && <p className="dna-q-sub">{current.subtitle}</p>}
          {current?.type === 'multiselect' && (
            <div className="dna-multi-hint">Select all that apply</div>
          )}
        </div>

        {/* MCQ */}
        {current?.type === 'mcq' && current.options && (
          <div className={`option-grid cols-${cols}${current.grouped ? ' grouped' : ''}`}>
            {current.grouped ? (
              Object.entries(groupOptions(current.options)).map(([group, opts]) => (
                <div key={group} className="option-group">
                  <div className="option-group-label">{group}</div>
                  <div className={`option-grid cols-${cols}`}>
                    {opts.map(opt => (
                      <OptionCard
                        key={opt.value}
                        option={opt}
                        selected={getAnswer(current.id) === opt.value}
                        onClick={() => setMCQ(current.id, opt.value)}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              current.options.map(opt => (
                <OptionCard
                  key={opt.value}
                  option={opt}
                  selected={getAnswer(current.id) === opt.value}
                  onClick={() => setMCQ(current.id, opt.value)}
                />
              ))
            )}
          </div>
        )}

        {/* Multiselect */}
        {current?.type === 'multiselect' && current.options && (
          <div className={`option-grid cols-${cols}`}>
            {current.options.map(opt => (
              <OptionCard
                key={opt.value}
                option={opt}
                selected={((getAnswer(current.id) as string[]) || []).includes(opt.value)}
                onClick={() => toggleMulti(current.id, opt.value)}
                multi
              />
            ))}
          </div>
        )}

        {/* Tap Scale */}
        {current?.type === 'tapscale' && (
          <TapScale
            question={current}
            value={getAnswer(current.id) as number | undefined}
            onChange={v => setTapScale(current.id, v)}
          />
        )}

        {/* Salary */}
        {current?.type === 'salary' && (
          <SalaryInput
            value={getAnswer('current_ctc') as number | undefined}
            onChange={setSalary}
          />
        )}

        {error && <div className="dna-error">{error}</div>}
      </div>

      {/* Nav footer */}
      <div className="dna-footer">
        <button
          className="dna-back-btn"
          onClick={goBack}
          disabled={currentIdx === 0}
          type="button"
        >
          ← Back
        </button>

        {current?.type !== 'mcq' && (
          <button
            className={`dna-next-btn${!isAnswered(current) ? ' disabled' : ''}`}
            onClick={goNext}
            disabled={!isAnswered(current) || submitting}
            type="button"
          >
            {submitting ? (
              <span className="dna-submitting">
                <span className="dna-spin" />
                Analysing…
              </span>
            ) : isLast ? 'Calculate my Gap →' : 'Continue →'}
          </button>
        )}

        {current?.type === 'mcq' && isAnswered(current) && !isLast && (
          <button className="dna-next-btn" onClick={goNext} type="button">
            Continue →
          </button>
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