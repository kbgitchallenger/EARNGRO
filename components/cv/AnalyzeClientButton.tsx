'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LimitReachedCard from '@/components/shared/LimitReachedCard'

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
  const [limitReason, setLimitReason] = useState<'FREE_LIMIT_REACHED' | 'INSUFFICIENT_CREDITS' | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function run() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/cv/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      })

      if (res.status === 402) {
        const body = await res.json().catch(() => ({}))
        setLimitReason(body.error === 'INSUFFICIENT_CREDITS' ? 'INSUFFICIENT_CREDITS' : 'FREE_LIMIT_REACHED')
        return
      }

      if (res.ok) {
        router.refresh()
      } else {
        setError('Analysis failed. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (limitReason) {
    return <LimitReachedCard reason={limitReason} feature="cv_analysis" />
  }

  return (
    <div>
      <button
        onClick={run}
        disabled={loading}
        style={{
          background: white ? '#fff' : 'var(--teal)',
          color: white ? 'var(--teal-d)' : '#fff',
          border: 'none',
          borderRadius: 99,
          padding: '13px 28px',
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          fontFamily: 'var(--sans)',
        }}
      >
        {loading ? 'Analysing…' : (label ?? 'Run ATS Analysis →')}
      </button>
      {error && (
        <div style={{ marginTop: 10, fontSize: 12, color: white ? 'rgba(255,255,255,0.85)' : 'var(--red)' }}>
          {error}
        </div>
      )}
    </div>
  )
}