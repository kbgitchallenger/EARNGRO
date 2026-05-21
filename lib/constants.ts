// lib/constants.ts

export const PLAN_LIMITS = {
  free: {
    interviews_per_month: 3,
    cv_uploads: 1,
    cv_versions: 1,
    personas: ['friendly_hr'],        // Only 1 persona free
    growpath: false,                  // Locked behind paid
    ats_scorer: true,                 // Free — hook feature
    earning_gap: true,               // Always free — viral hook
    growdna: true,                   // Always free — onboarding
  },
  grow: {
    interviews_per_month: -1,         // Unlimited (-1 = no limit)
    cv_uploads: 10,
    cv_versions: 5,
    personas: ['friendly_hr', 'skeptic', 'silent_judge'],
    growpath: true,
    ats_scorer: true,
    earning_gap: true,
    growdna: true,
  },
  accelerate: {
    interviews_per_month: -1,
    cv_uploads: -1,
    cv_versions: -1,
    personas: ['friendly_hr', 'skeptic', 'silent_judge', 'panel', 'ceo'],
    growpath: true,
    ats_scorer: true,
    earning_gap: true,
    growdna: true,
    mentor_sessions: 1,              // 1 included per month
  }
} as const;

export const PRICES = {
  grow: {
    inr: 29900,                      // ₹299/month in paise
    usd: 399,                        // $3.99/month in cents
    stripe_price_id_inr: 'price_xxx',
    stripe_price_id_usd: 'price_yyy',
  },
  accelerate: {
    inr: 69900,                      // ₹699/month in paise
    usd: 899,                        // $8.99/month in cents
    stripe_price_id_inr: 'price_xxx',
    stripe_price_id_usd: 'price_yyy',
  }
};