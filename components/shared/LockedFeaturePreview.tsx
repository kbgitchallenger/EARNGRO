//components/shared/LockedFeaturePreview.tsx
'use client'

// Reused for any feature gated behind a paid plan. Shows a real, rich
// preview of the actual screen (blurred) instead of a plain text wall —
// the whole point is letting the user see the DEPTH of what they're
// missing, not just being told a feature exists. Reuses the same mockup
// components already built for the landing page, since they're already
// faithful recreations of the real product screens.

import CheckoutButton from '@/components/billing/CheckoutButton'

interface LockedFeaturePreviewProps {
  icon: string
  title: string
  description: string
  requiredPlan: 'grow' | 'accelerate'
  ctaLabel: string
  children: React.ReactNode // the mockup component to blur/tease
}

export default function LockedFeaturePreview({
  icon,
  title,
  description,
  requiredPlan,
  ctaLabel,
  children,
}: LockedFeaturePreviewProps) {
  return (
    <div style={{ maxWidth: 640, margin: '20px auto 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
          {title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, maxWidth: 440, margin: '0 auto' }}>
          {description}
        </p>
      </div>

      {/* Blurred real preview — the actual point of this component */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ filter: 'blur(3px)', opacity: 0.75, pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(250,247,240,0) 0%, rgba(250,247,240,0.55) 45%, rgba(250,247,240,0.95) 100%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 99, padding: '6px 14px' }}>
            🔒 Full detail unlocks with {requiredPlan === 'grow' ? 'Grow' : 'Accelerate'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <CheckoutButton
          type="plan_upgrade"
          planKey={requiredPlan}
          label={ctaLabel}
          style={{ maxWidth: 320 }}
        />
      </div>
    </div>
  )
}