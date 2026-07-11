'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LimitReachedCard from '@/components/shared/LimitReachedCard'
import CheckoutButton from '@/components/billing/CheckoutButton'

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
  // Separate from limitReason — a 403 means the plan itself doesn't include
  // this feature at all (no amount of credits fixes it), which is a
  // different situation from "out of credits" and needs different copy
  // and a different resolution path (upgrade plan, not add credits).
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null)
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

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}))
        setUpgradeMessage(body.message ?? 'Full CV Analysis is available on the Grow plan.')
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

  if (upgradeMessage) {
    return (
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', maxWidth: 380, margin: '0 auto', textAlign: 'left' }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>🔒</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
          This is a Grow plan feature
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
          {upgradeMessage}
        </div>
        <CheckoutButton type="plan_upgrade" planKey="grow" label="Upgrade to Grow →" />
      </div>
    )
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