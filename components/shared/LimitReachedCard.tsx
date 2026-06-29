//app/components/shared/LimitReachedCard.tsx
'use client'

import Link from 'next/link'

interface Props {
  reason: 'FREE_LIMIT_REACHED' | 'INSUFFICIENT_CREDITS'
  feature: 'growdna' | 'cv_analysis'
  balance?: number
  required?: number
}

const FEATURE_LABELS: Record<Props['feature'], string> = {
  growdna: 'GrowDNA assessment',
  cv_analysis: 'CV analysis',
}

export default function LimitReachedCard({ reason, feature, balance, required }: Props) {
  const featureLabel = FEATURE_LABELS[feature]

  const isFreeLimit = reason === 'FREE_LIMIT_REACHED'

  return (
    <div style={{
      maxWidth: 480,
      margin: '40px auto',
      background: 'linear-gradient(135deg, var(--teal-d), var(--teal))',
      borderRadius: 'var(--r-xl)',
      padding: '32px 28px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

      <div style={{ fontSize: 44, marginBottom: 14 }}>
        {isFreeLimit ? '✨' : '⚡'}
      </div>

      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
        {isFreeLimit
          ? `You've used your free ${featureLabel}`
          : `Out of credits for now`}
      </h2>

      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, marginBottom: 22 }}>
        {isFreeLimit
          ? `Your free plan includes one complete ${featureLabel}, fully unlocked — no teasers, no blurred results. Upgrade to Grow for unlimited retakes and to track your progress over time.`
          : `Your credits for this cycle are used up${typeof balance === 'number' ? ` (${balance} remaining)` : ''}. They refresh automatically next cycle, or you can add more right away.`}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link
          href="/pricing"
          style={{
            background: '#fff', color: 'var(--teal-d)', fontSize: 14, fontWeight: 700,
            padding: '13px 24px', borderRadius: 99, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          {isFreeLimit ? 'See Grow plan →' : 'Add credits or upgrade →'}
        </Link>
        <Link
          href="/settings/billing"
          style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
        >
          View my usage & billing
        </Link>
      </div>
    </div>
  )
}