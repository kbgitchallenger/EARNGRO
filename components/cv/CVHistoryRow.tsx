'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CVHistoryRowProps {
  id: string
  name: string | null
  versionNumber: number
  isPrimary: boolean
  source: string
  fileName: string | null
  createdAt: string
  score: number | null
}

// Extracted into its own client component — same reason as SettingsLink
// earlier: needs real onMouseEnter/onMouseLeave state to drive the hover
// effect, which can't live in the same file as the async server
// component (CVHistoryPage uses createClient()/redirect()).
export default function CVHistoryRow({ id, name, versionNumber, isPrimary, source, fileName, createdAt, score }: CVHistoryRowProps) {
  const [hovered, setHovered] = useState(false)
  const scoreColor = score == null ? 'var(--muted)' : score >= 70 ? 'var(--teal)' : score >= 45 ? 'var(--amber)' : 'var(--red)'

  return (
    <Link
      href={`/cv/analysis/${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14,
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--teal-mid)' : isPrimary ? 'var(--teal-mid)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)', padding: '16px 18px',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: source === 'upload' ? 'var(--teal-l)' : 'var(--amber-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {source === 'upload' ? '📄' : '🛠️'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{name ?? `Resume v${versionNumber}`}</span>
          {isPrimary && <span style={{ fontSize: 10, background: 'var(--teal)', color: '#fff', padding: '1px 7px', borderRadius: 99, fontWeight: 700 }}>PRIMARY</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {fileName ?? source} · {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {score ? (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>score</div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 99, padding: '3px 10px' }}>Analyse →</div>
        )}
      </div>
    </Link>
  )
}