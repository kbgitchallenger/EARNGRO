//app/components/shared/ChangeNarrativeCard.tsx
'use client'

import { useState, useEffect } from 'react'
import type { ChangeNarrative } from '@/lib/growdna/changeNarrative'

export default function ChangeNarrativeCard({
  narrative,
  attemptId,
  compact = false,
}: {
  narrative: ChangeNarrative
  attemptId: string
  compact?: boolean
}) {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (!narrative.isCelebration) return
    const key = `earngro_celebrated_${attemptId}`
    const alreadyCelebrated = typeof window !== 'undefined' && localStorage.getItem(key)
    if (!alreadyCelebrated) {
      setShowCelebration(true)
      if (typeof window !== 'undefined') localStorage.setItem(key, '1')
    }
  }, [narrative.isCelebration, attemptId])

  const isCelebrating = narrative.isCelebration && showCelebration

  return (
    <div
      style={{
        background: isCelebrating
          ? 'linear-gradient(135deg, var(--teal-l), var(--teal-xl))'
          : 'linear-gradient(135deg, var(--teal-xl), var(--paper))',
        border: `1px solid ${isCelebrating ? 'var(--teal)' : 'var(--teal-mid)'}`,
        borderRadius: 'var(--r-lg)',
        padding: compact ? '14px 16px' : '18px 20px',
        marginBottom: 16,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        animation: isCelebrating ? 'celebrateGlow 1.6s ease-out' : 'none',
      }}
    >
      <span style={{ fontSize: compact ? 18 : 20, flexShrink: 0, marginTop: 1 }}>
        {narrative.isCelebration ? '🎉' : '👋'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.5, marginBottom: narrative.standingLine ? 4 : (compact ? 0 : 6) }}>
          {narrative.headline}
        </div>
        {narrative.standingLine && (
          <div style={{ fontSize: compact ? 12 : 13, color: 'var(--teal-d)', fontWeight: 500, lineHeight: 1.5, marginBottom: compact ? 0 : 6 }}>
            {narrative.standingLine}
          </div>
        )}
        {!compact && (
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
            {narrative.nextStep}
          </div>
        )}
      </div>
      {isCelebrating && (
        <style>{`
          @keyframes celebrateGlow {
            0% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(14,122,90,0.35); }
            40% { transform: scale(1.01); box-shadow: 0 0 0 8px rgba(14,122,90,0.12); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(14,122,90,0); }
          }
        `}</style>
      )}
    </div>
  )
}