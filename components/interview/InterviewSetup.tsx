'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { INTERVIEWER_PERSONAS } from '@/lib/interview/personas'

interface Props {
  prefill: {
    role: string
    industry: string
    experienceBand: string
    weakestDimension: string
    hrsScore: number | null
    careerArchetype: string | null
  }
  recentSessions: {
    id: string
    mode: string
    role: string
    overall_score: number | null
    created_at: string
    status: string
    persona: string
  }[]
}

const MODES = [
  { id: 'behavioral',  label: 'Behavioural',       icon: '🧠', desc: 'STAR-structured past-behaviour questions. Best for: all roles.' },
  { id: 'functional',  label: 'Functional',         icon: '⚙️', desc: 'Domain and role-specific knowledge. Best for: technical and specialist roles.' },
  { id: 'leadership',  label: 'Leadership',         icon: '🎯', desc: 'Influence, team management, strategic thinking. Best for: senior+ levels.' },
  { id: 'negotiation', label: 'Salary Negotiation', icon: '💰', desc: 'Roleplay: recruiter presents an offer, you negotiate. Best for: anyone underearning.' },
] as const

const DIMENSION_LABELS: Record<string, string> = {
  market_alignment: 'Market Alignment',
  skill_premium:    'Skill Premium',
  visibility:       'Visibility',
  mobility:         'Career Mobility',
  negotiation:      'Negotiation',
}

const EXPERIENCE_BANDS = [
  'Fresher (0-1 years)', 'Early Career (1-3 years)', 'Mid-level (3-8 years)',
  'Senior (8-15 years)', 'Leadership (15+ years)',
]

export default function InterviewSetup({ prefill, recentSessions }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<string>('behavioral')
  const [role, setRole] = useState(prefill.role)
  const [industry, setIndustry] = useState(prefill.industry)
  const [experienceBand, setExperienceBand] = useState(prefill.experienceBand)
  const [personaId, setPersonaId] = useState('priya')
  const [targetCompany, setTargetCompany] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  async function startSession() {
    if (!role || !industry || !experienceBand) {
      setError('Please fill in role, industry, and experience level.')
      return
    }
    setStarting(true)
    setError('')
    try {
      const res = await fetch('/api/interview/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          role,
          industry,
          experienceBand,
          personaId,
          targetCompany: targetCompany || undefined,
          weakestDimension: prefill.weakestDimension,
          maxTurns: 5,
        }),
      })
      if (!res.ok) throw new Error('Failed to start')
      const data = await res.json()
      router.push(`/interview/${data.sessionId}`)
    } catch {
      setError('Failed to start session. Please try again.')
      setStarting(false)
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
          AI Interview Practice
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Practise with a real-feeling AI interviewer. Get scored per answer. Leave with a concrete improvement.
        </p>
      </div>

      {/* Gap-targeted nudge — only shown if GrowDNA exists */}
      {prefill.weakestDimension && (
        <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🎯</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-d)', marginBottom: 2 }}>
              Targeting your weakest dimension: {DIMENSION_LABELS[prefill.weakestDimension]}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Questions will be weighted toward scenarios that exercise this gap — based on your GrowDNA results.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>

        {/* Left — setup form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Interview mode */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>Interview type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MODES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                    background: mode === m.id ? 'var(--teal-l)' : 'var(--paper-2)',
                    border: `1.5px solid ${mode === m.id ? 'var(--teal)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: mode === m.id ? 'var(--teal-d)' : 'var(--ink)', marginBottom: 2 }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Role + Industry + Experience */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>Your profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  Role / Function
                </label>
                <input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Marketing Manager"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, fontFamily: 'var(--sans)', color: 'var(--ink)', background: 'var(--paper)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  Industry
                </label>
                <input
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="e.g. Fintech, FMCG, Consulting"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, fontFamily: 'var(--sans)', color: 'var(--ink)', background: 'var(--paper)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  Experience level
                </label>
                <select
                  value={experienceBand}
                  onChange={e => setExperienceBand(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, fontFamily: 'var(--sans)', color: 'var(--ink)', background: 'var(--paper)', outline: 'none', appearance: 'none' }}
                >
                  <option value="">Select level</option>
                  {EXPERIENCE_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  Target company <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional — personalises questions)</span>
                </label>
                <input
                  value={targetCompany}
                  onChange={e => setTargetCompany(e.target.value)}
                  placeholder="e.g. Razorpay, McKinsey, Unilever"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, fontFamily: 'var(--sans)', color: 'var(--ink)', background: 'var(--paper)', outline: 'none' }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right — persona + recent sessions + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Interviewer persona */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Choose your interviewer</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>Different styles build real adaptability</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {INTERVIEWER_PERSONAS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPersonaId(p.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                    background: personaId === p.id ? `${p.color}12` : 'var(--paper-2)',
                    border: `1.5px solid ${personaId === p.id ? p.color : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: personaId === p.id ? p.color : 'var(--ink)', marginBottom: 2 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: personaId === p.id ? p.color : 'var(--muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{p.signaturePhrase}"
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          {error && (
            <div style={{ background: 'var(--red-l)', border: '1px solid #F5CCCC', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button
            onClick={startSession}
            disabled={starting}
            style={{
              width: '100%', padding: 16, background: starting ? 'var(--teal-mid)' : 'var(--teal)',
              color: '#fff', border: 'none', borderRadius: 'var(--r-lg)',
              fontSize: 15, fontWeight: 700, cursor: starting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--sans)', boxShadow: '0 4px 16px rgba(14,122,90,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {starting ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Preparing your interview…
              </>
            ) : (
              <>🎤 Start interview with {INTERVIEWER_PERSONAS.find(p => p.id === personaId)?.name.split(' ')[0]}</>
            )}
          </button>

          {/* Recent sessions — clicking ANY session (in-progress or completed)
              now routes to the same /interview/[id] page, which already
              branches server-side between resuming the live session and
              showing the report. Previously this only handled 'completed'
              and pointed at a /report sub-route that doesn't exist, so
              in-progress sessions were completely unreachable and completed
              ones hit a dead link. */}
          {recentSessions.length > 0 && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Recent sessions</div>
              {recentSessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => router.push(`/interview/${s.id}`)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-l)', cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', textTransform: 'capitalize' }}>{s.mode} · {s.role}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  {s.overall_score != null ? (
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.overall_score >= 70 ? 'var(--teal)' : s.overall_score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                      {s.overall_score}/100
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--teal-d)', fontWeight: 600 }}>Resume →</div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}