//app/components/growpath/GrowPathView.tsx
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

const TYPE_LABEL: Record<string, string> = {
  skill: 'Skill', visibility: 'Visibility', application: 'Application', negotiation: 'Negotiation',
}
const TYPE_COLOR: Record<string, string> = {
  skill: 'var(--teal)', visibility: '#7C3AED', application: '#DC2626', negotiation: 'var(--amber)',
}

interface Milestone {
  id: string; type: string; title: string; description: string
  target_month: number; status: string
}
interface Phase {
  id: string; title: string; start_month: number; end_month: number
  growpath_milestones: Milestone[]
}
interface Company {
  id: string; company_name: string; rationale: string
  est_salary_min: number; est_salary_max: number
}
interface Props {
  userId: string
  plan: { id: string } | null
  phases: Phase[]
  companies: Company[]
  dna: { current_salary: number; target_salary: number; earning_gap: number; months_to_close: number } | null
  isFreePlan: boolean
}

function MilestoneRow({ m, onToggle }: { m: Milestone; onToggle: (id: string, status: string) => void }) {
  const done = m.status === 'done'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: 8 }}>
      <button
        onClick={() => onToggle(m.id, done ? 'todo' : 'done')}
        style={{ width: 20, height: 20, minWidth: 20, borderRadius: '50%', border: `1.5px solid ${done ? 'var(--teal)' : 'var(--border)'}`, background: done ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
      >
        {done && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
      </button>
      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${TYPE_COLOR[m.type]}18`, color: TYPE_COLOR[m.type], fontWeight: 600, flexShrink: 0 }}>
        {TYPE_LABEL[m.type] ?? m.type}
      </span>
      <span style={{ fontSize: 14, color: done ? 'var(--muted)' : 'var(--ink)', textDecoration: done ? 'line-through' : 'none', flex: 1 }}>
        {m.title}
      </span>
      <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>Month {m.target_month}</span>
    </div>
  )
}

export default function GrowPathView({ userId, plan, phases, companies, dna, isFreePlan }: Props) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [localPhases, setLocalPhases] = useState(phases)

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
      if (!res.ok) throw new Error('Generation failed')
      router.refresh()
    } catch {
      setError('Something went wrong generating your GrowPath. Please try again.')
      setGenerating(false)
    }
  }

  async function handleToggle(milestoneId: string, status: string) {
    // Optimistic update
    setLocalPhases(prev => prev.map(p => ({
      ...p,
      growpath_milestones: p.growpath_milestones.map(m => m.id === milestoneId ? { ...m, status } : m),
    })))
    await fetch(`/api/growpath/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => { /* optimistic UI stays; next refresh will reconcile */ })
  }

  if (isFreePlan) {
    return (
      <div style={{ padding: '24px 24px 0', maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🗺️</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
          GrowPath is a Grow plan feature
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.7 }}>
          Get your month-by-month roadmap — skill targets, salary milestones, and companies to target.
        </p>
        <Link href="/settings" style={{ display: 'inline-flex', background: 'var(--teal)', color: '#fff', fontSize: 14, fontWeight: 600, padding: '12px 26px', borderRadius: 99, textDecoration: 'none' }}>
          Upgrade to Grow →
        </Link>
      </div>
    )
  }

  if (!plan) {
    return (
      <div style={{ padding: '24px 24px 0', maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🗺️</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
          Build your GrowPath
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.7 }}>
          A phased, month-by-month plan built from your GrowDNA results — skill targets, visibility milestones, and companies to target.
        </p>
        {error && (
          <div style={{ background: 'var(--red-l)', border: '1px solid #F5CCCC', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>
            {error}
          </div>
        )}
        <button onClick={handleGenerate} disabled={generating} style={{ background: 'var(--teal)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '13px 28px', borderRadius: 99, border: 'none', cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1 }}>
          {generating ? 'Building your plan…' : 'Generate my GrowPath →'}
        </button>
      </div>
    )
  }

  const displayPhases = localPhases.length > 0 ? localPhases : phases

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px 60px' }}>

      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3.5vw,30px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>
        Your GrowPath
      </h1>

      {dna && (
        <div style={{ display: 'flex', gap: 24, padding: '16px 20px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Current</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{fmt(dna.current_salary)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)' }}>→</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Target</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--teal)' }}>{fmt(dna.target_salary)}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Closes in</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--amber)' }}>{dna.months_to_close} mo</div>
          </div>
        </div>
      )}

      {displayPhases.map(phase => (
        <div key={phase.id} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{phase.title}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Month {phase.start_month} to {phase.end_month}</span>
          </div>
          {phase.growpath_milestones
            .sort((a, b) => a.target_month - b.target_month)
            .map(m => <MilestoneRow key={m.id} m={m} onToggle={handleToggle} />)}
        </div>
      ))}

      {companies.length > 0 && (
        <div style={{ marginTop: 8, padding: '18px 20px', background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Target companies</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8 }}>
            {companies.map(c => (
              <div key={c.id} style={{ padding: '10px 12px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{c.company_name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(c.est_salary_min)} – {fmt(c.est_salary_max)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}