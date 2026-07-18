//app/components/shared/LimitReachedCard.tsx
'use client'

import Link from 'next/link'
import CheckoutButton from '@/components/billing/CheckoutButton'

interface Props {
  reason: 'FREE_LIMIT_REACHED' | 'INSUFFICIENT_CREDITS'
  // Widened from a narrow literal union to a plain string with a fallback
  // label formatter — the original union only covered 'growdna' and
  // 'cv_analysis', which was already stale (interview_turn, cv_parse,
  // bullet_optimize, etc. all exist as real gated features elsewhere in
  // the app now). A new feature no longer needs an edit here just to
  // render a reasonable label.
  feature: string
  balance?: number
  required?: number
  // NEW — lets this card offer a direct recharge for an already-paying
  // user instead of always routing through the full /pricing comparison
  // page, which made sense for a free user but is unnecessary friction
  // for someone on Grow/Accelerate who just ran low mid-cycle.
  plan?: string
}

const FEATURE_LABELS: Record<string, string> = {
  growdna: 'GrowDNA assessment',
  cv_analysis: 'CV analysis',
  cv_analyze: 'CV analysis',
  cv_parse: 'CV parse',
  bullet_optimize: 'bullet optimization',
  interview_session_start: 'interview session',
  interview_turn: 'interview question',
  interview_report: 'interview report',
}

function formatFeatureLabel(feature: string): string {
  if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature]
  // Fallback: 'some_new_feature' -> 'some new feature' — readable even for
  // a feature name added elsewhere that nobody remembered to register here.
  return feature.replace(/_/g, ' ')
}

const RECHARGE_PACK: Record<string, string> = {
  grow: 'grow_recharge',
  accelerate: 'accelerate_recharge',
}

export default function LimitReachedCard({ reason, feature, balance, required, plan }: Props) {
  const featureLabel = formatFeatureLabel(feature)
  const isFreeLimit = reason === 'FREE_LIMIT_REACHED'

  // A paying user (Grow/Accelerate) who's out of credits mid-cycle should
  // get a direct recharge action, not a generic upgrade page — they've
  // already decided to pay, this is just "top up," not "reconsider your plan."
  const isPayingUserLowOnCredits = !isFreeLimit && plan && RECHARGE_PACK[plan]

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

      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, marginBottom: typeof required === 'number' ? 12 : 22 }}>
        {isFreeLimit
          ? `Your free plan includes one complete ${featureLabel}, fully unlocked — no teasers, no blurred results. Upgrade to Grow for unlimited retakes and to track your progress over time.`
          : `Your credits for this cycle are used up${typeof balance === 'number' ? ` (${balance} remaining)` : ''}. They refresh automatically next cycle, or you can add more right away.`}
      </p>

      {/* FIX: `required` was destructured but never shown — someone out of
          credits had no idea how many more they actually needed. Now shown
          as an exact pair, matching the "costs X credits, you have Y"
          standard used everywhere else credits are checked in this app. */}
      {typeof required === 'number' && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '6px 14px', borderRadius: 99,
          marginBottom: 22,
        }}>
          This needs {required} credits{typeof balance === 'number' ? ` · you have ${balance}` : ''}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isPayingUserLowOnCredits ? (
          <CheckoutButton
            type="recharge"
            planKey={RECHARGE_PACK[plan!]}
            label="Add credits now →"
            style={{ background: '#fff', color: 'var(--teal-d)' }}
          />
        ) : (
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
        )}
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