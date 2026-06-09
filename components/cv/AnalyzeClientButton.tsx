'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyzeClientButton({
  versionId,
  white,
  label,
}: {
  versionId: string
  white?: boolean
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function run() {
    setLoading(true)
    try {
      const res = await fetch('/api/cv/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      style={{
        background: white ? '#fff' : 'var(--teal)',
        color: white ? 'var(--teal-d)' : '#fff',
        border: 'none', borderRadius: 99,
        padding: '11px 24px', fontSize: 13, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        fontFamily: 'var(--sans)',
        boxShadow: white ? '0 4px 14px rgba(0,0,0,0.15)' : '0 4px 14px rgba(14,122,90,0.22)',
      }}
    >
      {loading ? 'Analysing…' : (label ?? '🎯 Run ATS Analysis')}
    </button>
  )
}