//app/services/credits.service.ts
import { createClient } from '@/lib/supabase/server'

export interface CreditCheckResult {
  allowed: boolean
  balance: number
  cost: number
}

export interface CreditTransaction {
  id: string
  user_id: string
  feature: string
  credits_used: number
  tokens_used: number | null
  balance_after: number
  metadata: Record<string, unknown>
  created_at: string
}

// ── Feature display names — for human-readable usage history ──────

const FEATURE_LABELS: Record<string, string> = {
  growdna: 'GrowDNA Assessment',
  cv_parse_analyze: 'CV Analysis',
  ats_reanalyze: 'CV Re-analysis',
  bullet_optimize: 'AI Bullet Optimization',
  monthly_reset: 'Monthly credits refreshed',
}

export function getFeatureLabel(feature: string): string {
  return FEATURE_LABELS[feature] ?? feature
}

// ── Deduct credits — atomic, race-condition safe ──────────────────

export async function deductCredits(
  userId: string,
  feature: string,
  metadata: Record<string, unknown> = {}
): Promise<CreditCheckResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_feature: feature,
    p_metadata: metadata,
  })

  if (error) {
    console.error('Credit deduction error:', error)
    throw new Error('Failed to process credits')
  }

  const result = data?.[0]
  return {
    allowed: result?.success ?? false,
    balance: result?.new_balance ?? 0,
    cost: result?.cost ?? 0,
  }
}

// ── Read-only checks ────────────────────────────────────────────

export async function getBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single()
  return data?.credits_balance ?? 0
}

export async function getFeatureCost(feature: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('feature_credit_costs')
    .select('credits_cost')
    .eq('feature', feature)
    .single()
  return data?.credits_cost ?? 0
}

// Check without deducting — useful for showing "you can afford this" UI hints
export async function canAfford(userId: string, feature: string): Promise<boolean> {
  const [balance, cost] = await Promise.all([
    getBalance(userId),
    getFeatureCost(feature),
  ])
  return balance >= cost
}

// ── Usage history — for Settings → Usage page ─────────────────────

export async function getTransactionHistory(
  userId: string,
  limit = 20
): Promise<CreditTransaction[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as CreditTransaction[]
}

// Has the user genuinely consumed credits for this feature? (for "1 free
// analysis" gating). FIX: previously checked whether ANY row existed with
// credits_used < 0 for this feature — meaning a failed attempt that was
// later refunded (even correctly, under the same feature name) still
// permanently counted as "used", since the original negative row never
// went away. Now sums net credits_used for the feature: a refund posted
// under the same feature name correctly cancels out a prior failure.
export async function hasUsedFeature(userId: string, feature: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('credit_transactions')
    .select('credits_used')
    .eq('user_id', userId)
    .eq('feature', feature)

  const netUsed = (data ?? []).reduce((sum, row) => sum + row.credits_used, 0)
  return netUsed < 0
}

// Reverses a credit deduction when the underlying operation failed AFTER
// credits were already taken (e.g. the AI call itself errored, or the
// response failed validation, post-deduction). Posted under the SAME
// feature name as the original deduction — critical for hasUsedFeature's
// net-sum check above to correctly recognise the attempt as refunded,
// not just compensated under an unrelated ledger entry.
export async function refundCredits(
  userId: string,
  feature: string,
  amount: number,
  reason: string
): Promise<void> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single()

  const newBalance = (profile?.credits_balance ?? 0) + amount

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ credits_balance: newBalance })
    .eq('id', userId)

  if (updateErr) {
    console.error('Refund failed to update balance:', updateErr)
    return
  }

  const { error: txErr } = await supabase.from('credit_transactions').insert({
    user_id: userId,
    feature,
    credits_used: amount,
    balance_after: newBalance,
    metadata: { reason, type: 'refund' },
  })

  if (txErr) {
    console.error('Refund succeeded but failed to log transaction:', txErr)
  }
}

// ── Anonymous rate limiting (for /api/calculate, no login) ────────
// NOTE: app/api/calculate/route.ts currently has its own inline copy of this
// logic rather than calling this function. Kept in sync here as a safety net
// in case anything else calls it, or in case the route is later refactored
// to use this shared version instead of its inline duplicate.

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP
  return 'unknown'
}

export interface RateLimitResult {
  allowed: boolean
  message?: string
}

export async function checkAndRecordRateLimit(request: Request): Promise<RateLimitResult> {
  const ip = getClientIP(request)
  const supabase = await createClient()
  const now = new Date()

  const { error } = await supabase
    .from('calculator_rate_limits')
    .insert({
      ip_address: ip,
      used_date: now.toISOString().slice(0, 10),
      used_month: now.toISOString().slice(0, 7),
    })

  if (error) {
    if (error.code === '23505') {
      return {
        allowed: false,
        message: "You've reached this month's free limit — create an account for unlimited access.",
      }
    }
    console.error('Rate limit check failed unexpectedly:', error)
    return {
      allowed: false,
      message: 'Please try again in a moment.',
    }
  }

  return { allowed: true }
}