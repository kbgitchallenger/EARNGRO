'use client'

import { useState, useEffect, useRef } from 'react'

// Unified answer shape — works for both competency and certification
// search, since `searchTarget` on the question determines which fields
// are actually meaningful. `id` is the competency_id OR certification_id
// depending on searchTarget; rating/yearsExperience/currentlyUsing only
// apply to competency search, issuer/yearEarned only to certifications.
export interface SkillAnswerItem {
  id: string
  name: string
  category?: string
  issuer?: string | null
  rating?: number
  yearsExperience?: number
  currentlyUsing?: boolean
  yearEarned?: number
}

interface SearchResult {
  id: string
  name: string
  category?: string
  issuer?: string | null
}

interface SkillRatingQuestionProps {
  min: number
  max: number
  ratingRequired: boolean
  searchTarget: 'competency' | 'certification'
  value: SkillAnswerItem[]
  onChange: (v: SkillAnswerItem[]) => void
}

// Replaces the two separate components (SkillRatingQuestion +
// CertificationSearchQuestion) — one component now, branching on
// searchTarget to search the right table (competency_taxonomy vs
// certifications_taxonomy) and to show the right per-item controls
// (proficiency rating for competencies, just a year for certifications,
// since a certification is binary — you have it or you don't).
export default function SkillRatingQuestion({ min, max, ratingRequired, searchTarget, value, onChange }: SkillRatingQuestionProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [addStatus, setAddStatus] = useState<'idle' | 'submitting'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchUrl = searchTarget === 'certification' ? '/api/certifications/search' : '/api/competencies/search'
  const createUrl = searchTarget === 'certification' ? '/api/certifications/create-pending' : '/api/competencies/create-pending'
  const isCert = searchTarget === 'certification'

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${searchUrl}?q=${encodeURIComponent(query)}`)
        const body = await res.json()
        setResults(body.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, searchUrl])

  function addItem(result: SearchResult) {
    if (value.some(v => v.id === result.id)) return
    if (value.length >= max) return
    onChange([...value, {
      id: result.id, name: result.name, category: result.category, issuer: result.issuer,
      rating: isCert ? undefined : 3,
      currentlyUsing: isCert ? undefined : true,
    }])
    setQuery('')
    setResults([])
  }

  async function addMissingItem() {
    if (value.length >= max) return
    setAddStatus('submitting')
    try {
      const res = await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query }),
      })
      if (!res.ok) throw new Error('Failed to add')
      const { result } = await res.json()
      addItem({ id: result.id, name: result.name, category: result.category, issuer: result.issuer })
    } finally {
      setAddStatus('idle')
    }
  }

  function removeItem(id: string) {
    onChange(value.filter(v => v.id !== id))
  }

  function updateItem(id: string, patch: Partial<SkillAnswerItem>) {
    onChange(value.map(v => v.id === id ? { ...v, ...patch } : v))
  }

  const atMax = value.length >= max

  return (
    <div>
      {!atMax && (
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isCert ? 'Search certifications…' : 'Search skills, tools, frameworks…'}
            style={{
              width: '100%', padding: '11px 14px', fontSize: 14,
              border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
              outline: 'none', fontFamily: 'var(--sans)',
            }}
          />
          {(results.length > 0 || loading || (query.length >= 2 && !loading)) && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-md)', zIndex: 20, maxHeight: 240, overflowY: 'auto',
            }}>
              {loading && <div style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--muted)' }}>Searching…</div>}
              {!loading && results.map(r => (
                <button
                  key={r.id}
                  onClick={() => addItem(r)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                    fontSize: 13.5, color: 'var(--ink)', borderBottom: '1px solid var(--border-l)',
                  }}
                >
                  <span>{r.name}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{isCert ? r.issuer : r.category?.replace('_', ' ')}</span>
                </button>
              ))}
              {!loading && results.length === 0 && query.length >= 2 && (
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>No matches for "{query}".</div>
                  <button
                    onClick={addMissingItem}
                    disabled={addStatus === 'submitting'}
                    style={{
                      fontSize: 12, fontWeight: 600, color: '#fff', background: 'var(--teal)',
                      border: 'none', borderRadius: 99, padding: '6px 14px', cursor: 'pointer',
                      fontFamily: 'var(--sans)', opacity: addStatus === 'submitting' ? 0.7 : 1,
                    }}
                  >
                    {addStatus === 'submitting' ? 'Adding…' : `Add "${query}" ${isCert ? 'as a certification' : 'as a skill'} →`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
        {value.length} of {max} selected{min > 0 ? ` (minimum ${min})` : ' (optional)'}
      </div>

      {value.map(item => (
        <div key={item.id} style={{
          background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
          padding: '14px 16px', marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCert ? 0 : 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.name}</div>
              {isCert && item.issuer && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.issuer}</div>}
            </div>
            <button onClick={() => removeItem(item.id)} style={{
              background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16, padding: 0,
            }}>×</button>
          </div>

          {/* Certifications are binary — you have it or you don't — so no
              proficiency rating, just an optional year earned. */}
          {isCert ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Year earned (optional)</div>
              <input
                type="number"
                value={item.yearEarned ?? ''}
                onChange={e => updateItem(item.id, { yearEarned: e.target.value ? Number(e.target.value) : undefined })}
                style={{ width: 100, padding: '6px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', outline: 'none' }}
              />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                  Proficiency{!ratingRequired ? ' (optional)' : ''}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => updateItem(item.id, { rating: n })}
                      style={{
                        flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600, borderRadius: 'var(--r-sm)',
                        border: `1.5px solid ${(item.rating ?? 0) >= n ? 'var(--teal)' : 'var(--border)'}`,
                        background: (item.rating ?? 0) >= n ? 'var(--teal-l)' : 'var(--paper)',
                        color: (item.rating ?? 0) >= n ? 'var(--teal-d)' : 'var(--muted)', cursor: 'pointer',
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
                    value={item.yearsExperience ?? ''}
                    onChange={e => updateItem(item.id, { yearsExperience: e.target.value ? Number(e.target.value) : undefined })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', outline: 'none' }}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={item.currentlyUsing ?? false}
                    onChange={e => updateItem(item.id, { currentlyUsing: e.target.checked })}
                  />
                  Using it currently
                </label>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}