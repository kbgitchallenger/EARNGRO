'use client'

import { useState, useEffect, useRef } from 'react'

export interface SkillRatingAnswer {
  competencyId: string
  name: string
  category: string
  rating: number
  yearsExperience?: number
  currentlyUsing?: boolean
}

interface SearchResult {
  id: string
  name: string
  category: string
  ai_related: boolean
}

interface SkillRatingQuestionProps {
  tier: 'primary' | 'secondary'
  minSelect: number
  maxSelect: number
  value: SkillRatingAnswer[]
  onChange: (v: SkillRatingAnswer[]) => void
}

// Searchable skill picker with per-item proficiency rating — powers both
// Primary and Secondary Competencies questions (tier determines whether
// rating/years/currently-using are required or optional). Calls the real
// competency_taxonomy via /api/competencies/search, never a hardcoded
// per-track option list — this is what makes the same question work
// correctly for every career track.
export default function SkillRatingQuestion({ tier, minSelect, maxSelect, value, onChange }: SkillRatingQuestionProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setRequestStatus('idle')
    if (query.trim().length < 2) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/competencies/search?q=${encodeURIComponent(query)}`)
        const body = await res.json()
        setResults(body.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function addMissingSkill() {
    if (value.length >= maxSelect) return
    setRequestStatus('submitting')
    try {
      const res = await fetch('/api/competencies/create-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query }),
      })
      if (!res.ok) throw new Error('Failed to add skill')
      const { result } = await res.json()
      onChange([...value, {
        competencyId: result.id, name: result.name, category: result.category,
        rating: 3, yearsExperience: undefined, currentlyUsing: true,
      }])
      setQuery('')
      setResults([])
      setRequestStatus('idle')
    } catch {
      setRequestStatus('idle')
    }
  }

  function addSkill(result: SearchResult) {
    if (value.some(v => v.competencyId === result.id)) return
    if (value.length >= maxSelect) return
    onChange([...value, {
      competencyId: result.id, name: result.name, category: result.category,
      rating: 3, yearsExperience: undefined, currentlyUsing: true,
    }])
    setQuery('')
    setResults([])
  }

  function removeSkill(id: string) {
    onChange(value.filter(v => v.competencyId !== id))
  }

  function updateSkill(id: string, patch: Partial<SkillRatingAnswer>) {
    onChange(value.map(v => v.competencyId === id ? { ...v, ...patch } : v))
  }

  const atMax = value.length >= maxSelect

  return (
    <div>
      {!atMax && (
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search skills, tools, frameworks…"
            style={{
              width: '100%', padding: '11px 14px', fontSize: 14,
              border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
              outline: 'none', fontFamily: 'var(--sans)',
            }}
          />
          {(results.length > 0 || loading) && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-md)', zIndex: 20, maxHeight: 240, overflowY: 'auto',
            }}>
              {loading && <div style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--muted)' }}>Searching…</div>}
              {!loading && results.map(r => (
                <button
                  key={r.id}
                  onClick={() => addSkill(r)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                    fontSize: 13.5, color: 'var(--ink)', borderBottom: '1px solid var(--border-l)',
                  }}
                >
                  <span>{r.name}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'capitalize' }}>{r.category.replace('_', ' ')}</span>
                </button>
              ))}
              {!loading && results.length === 0 && query.length >= 2 && (
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>
                    No matches for "{query}".
                  </div>
                  <button
                    onClick={addMissingSkill}
                    disabled={requestStatus === 'submitting'}
                    style={{
                      fontSize: 12, fontWeight: 600, color: '#fff', background: 'var(--teal)',
                      border: 'none', borderRadius: 99, padding: '6px 14px', cursor: 'pointer',
                      fontFamily: 'var(--sans)', opacity: requestStatus === 'submitting' ? 0.7 : 1,
                    }}
                  >
                    {requestStatus === 'submitting' ? 'Adding…' : `Add "${query}" as a skill →`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
        {value.length} of {maxSelect} selected{tier === 'primary' ? ` (minimum ${minSelect})` : ' (optional)'}
      </div>

      {value.map(skill => (
        <div key={skill.competencyId} style={{
          background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
          padding: '14px 16px', marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{skill.name}</div>
            <button onClick={() => removeSkill(skill.competencyId)} style={{
              background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16, padding: 0,
            }}>×</button>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Proficiency</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => updateSkill(skill.competencyId, { rating: n })}
                  style={{
                    flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600, borderRadius: 'var(--r-sm)',
                    border: `1.5px solid ${skill.rating >= n ? 'var(--teal)' : 'var(--border)'}`,
                    background: skill.rating >= n ? 'var(--teal-l)' : 'var(--paper)',
                    color: skill.rating >= n ? 'var(--teal-d)' : 'var(--muted)', cursor: 'pointer',
                  }}
                >{n}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Years experience</div>
              <input
                type="number" min={0} step={0.5}
                value={skill.yearsExperience ?? ''}
                onChange={e => updateSkill(skill.competencyId, { yearsExperience: e.target.value ? Number(e.target.value) : undefined })}
                style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', outline: 'none' }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={skill.currentlyUsing ?? false}
                onChange={e => updateSkill(skill.competencyId, { currentlyUsing: e.target.checked })}
              />
              Using it currently
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}