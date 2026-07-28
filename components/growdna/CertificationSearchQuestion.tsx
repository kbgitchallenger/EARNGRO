'use client'

import { useState, useEffect, useRef } from 'react'

export interface CertAnswer {
  certificationId: string
  name: string
  issuer: string | null
  yearEarned?: number
}

interface SearchResult {
  id: string
  name: string
  issuer: string | null
  category: string | null
}

interface CertificationSearchQuestionProps {
  value: CertAnswer[]
  onChange: (v: CertAnswer[]) => void
}

// Same pattern as SkillRatingQuestion but for certifications — searches
// the real certifications_taxonomy, no rating needed (a certification is
// binary: you have it or you don't), just an optional year earned.
export default function CertificationSearchQuestion({ value, onChange }: CertificationSearchQuestionProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/certifications/search?q=${encodeURIComponent(query)}`)
        const body = await res.json()
        setResults(body.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  function addCert(result: SearchResult) {
    if (value.some(v => v.certificationId === result.id)) return
    onChange([...value, { certificationId: result.id, name: result.name, issuer: result.issuer }])
    setQuery('')
    setResults([])
  }

  function removeCert(id: string) {
    onChange(value.filter(v => v.certificationId !== id))
  }

  function updateCert(id: string, yearEarned: number | undefined) {
    onChange(value.map(v => v.certificationId === id ? { ...v, yearEarned } : v))
  }

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search certifications…"
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
                onClick={() => addCert(r)}
                style={{
                  display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer', fontSize: 13.5, color: 'var(--ink)',
                  borderBottom: '1px solid var(--border-l)',
                }}
              >
                <div>{r.name}</div>
                {r.issuer && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.issuer}</div>}
              </button>
            ))}
            {!loading && results.length === 0 && query.length >= 2 && (
              <div style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--muted)' }}>
                No matches — don't see it? You'll be able to request it below.
              </div>
            )}
          </div>
        )}
      </div>

      {value.map(cert => (
        <div key={cert.certificationId} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
          padding: '10px 14px', marginBottom: 8,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{cert.name}</div>
            {cert.issuer && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{cert.issuer}</div>}
          </div>
          <input
            type="number" placeholder="Year"
            value={cert.yearEarned ?? ''}
            onChange={e => updateCert(cert.certificationId, e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: 70, padding: '6px 8px', fontSize: 12.5, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', outline: 'none' }}
          />
          <button onClick={() => removeCert(cert.certificationId)} style={{
            background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16, padding: 0,
          }}>×</button>
        </div>
      ))}
    </div>
  )
}