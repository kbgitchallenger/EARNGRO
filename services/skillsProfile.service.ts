// services/skillsProfile.service.ts
//
// The single source of truth for a user's competency profile — per the
// Skills Intelligence Platform brief: "No module should maintain its own
// isolated skills model." GrowDNA, the CV parser, GrowPath, and any
// future evidence source (AI Interview scoring, eventually LinkedIn) all
// read and write through this file, never their own local skills logic.

import { createClient } from '@/lib/supabase/server'

export type CompetencySource =
  | 'self_assessment' | 'resume_parse' | 'ai_interview'
  | 'certification' | 'linkedin' | 'recruiter_validation' | 'portfolio'

export interface UserCompetencyInput {
  competencyId: string
  tier: 'primary' | 'secondary'
  source: CompetencySource
  selfRating?: number       // 1-5, only meaningful for self_assessment
  yearsExperience?: number
  currentlyUsing?: boolean
}

export interface UserCompetencyView {
  competencyId: string
  name: string
  category: string
  tier: 'primary' | 'secondary'
  aggregateConfidence: number   // 0-1, computed across all sources for this competency
  sources: CompetencySource[]
  selfRating: number | null
  yearsExperience: number | null
}

// Base confidence per evidence source — a genuine product/design
// judgment call, not an objectively "correct" model. Self-report is the
// weakest single signal (easiest to overstate), certifications and
// resume-parsed evidence are stronger (harder to fabricate), recruiter
// validation is strongest (a human verified it). Meant as a sensible
// starting point to tune with real data, not a finished algorithm.
const SOURCE_BASE_CONFIDENCE: Record<CompetencySource, number> = {
  self_assessment: 0.35,
  resume_parse: 0.55,
  ai_interview: 0.5,
  certification: 0.7,
  linkedin: 0.5,
  recruiter_validation: 0.9,
  portfolio: 0.6,
}

// Multiple independent sources agreeing on the same competency is a real
// trust signal — each additional source adds confidence, with diminishing
// returns, capped at 1.0.
function computeAggregateConfidence(sources: CompetencySource[]): number {
  if (sources.length === 0) return 0
  const scores = sources.map(s => SOURCE_BASE_CONFIDENCE[s] ?? 0.4)
  const maxScore = Math.max(...scores)
  const agreementBoost = Math.min((sources.length - 1) * 0.12, 0.3)
  return Math.min(1, maxScore + agreementBoost)
}

// ── Write ────────────────────────────────────────────────────────

// Upserts one evidence row per (user, competency, source) — matches the
// real unique constraint on user_competencies. Multiple sources for the
// same competency coexist as separate rows; they're aggregated for
// display in getUserCompetencies below, never collapsed into one on write.
export async function upsertCompetency(userId: string, input: UserCompetencyInput): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_competencies')
    .upsert({
      user_id: userId,
      competency_id: input.competencyId,
      tier: input.tier,
      source: input.source,
      self_rating: input.selfRating ?? null,
      years_experience: input.yearsExperience ?? null,
      currently_using: input.currentlyUsing ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,competency_id,source' })

  if (error) {
    console.error('upsertCompetency failed:', error)
    throw new Error('Failed to save competency')
  }
}

export async function upsertCertification(
  userId: string,
  certificationId: string,
  source: 'self_assessment' | 'resume_parse' | 'linkedin' | 'recruiter_validation',
  yearEarned?: number
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_certifications')
    .upsert({
      user_id: userId,
      certification_id: certificationId,
      source,
      year_earned: yearEarned ?? null,
    }, { onConflict: 'user_id,certification_id,source' })

  if (error) {
    console.error('upsertCertification failed:', error)
    throw new Error('Failed to save certification')
  }
}

// ── Read ─────────────────────────────────────────────────────────

// Returns the user's competencies, one row per DISTINCT competency
// (not per source) — with confidence aggregated across every source
// that has evidence for it. This is what GrowDNA's prompt-grounding,
// GrowPath's skill-gap display, and future consumers should call —
// never query user_competencies directly.
export async function getUserCompetencies(userId: string): Promise<UserCompetencyView[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_competencies')
    .select('competency_id, tier, source, self_rating, years_experience, competency_taxonomy(name, category)')
    .eq('user_id', userId)

  if (error) {
    console.error('getUserCompetencies failed:', error)
    return []
  }

  const grouped = new Map<string, {
    name: string; category: string; tier: 'primary' | 'secondary'
    sources: CompetencySource[]; selfRating: number | null; yearsExperience: number | null
  }>()

  for (const row of data ?? []) {
    const taxonomy = row.competency_taxonomy as unknown as { name: string; category: string } | null
    if (!taxonomy) continue
    const existing = grouped.get(row.competency_id)
    if (existing) {
      existing.sources.push(row.source as CompetencySource)
      existing.selfRating = existing.selfRating ?? row.self_rating
      existing.yearsExperience = existing.yearsExperience ?? row.years_experience
    } else {
      grouped.set(row.competency_id, {
        name: taxonomy.name,
        category: taxonomy.category,
        tier: row.tier as 'primary' | 'secondary',
        sources: [row.source as CompetencySource],
        selfRating: row.self_rating,
        yearsExperience: row.years_experience,
      })
    }
  }

  return Array.from(grouped.entries()).map(([competencyId, v]) => ({
    competencyId,
    name: v.name,
    category: v.category,
    tier: v.tier,
    sources: v.sources,
    aggregateConfidence: computeAggregateConfidence(v.sources),
    selfRating: v.selfRating,
    yearsExperience: v.yearsExperience,
  }))
}

// ── Search — powers the assessment's searchable skill/cert picker ──

export async function searchCompetencies(query: string, category?: string, limit = 20) {
  const supabase = await createClient()
  let q = supabase
    .from('competency_taxonomy')
    .select('id, name, category, ai_related')
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .limit(limit)

  if (category) q = q.eq('category', category)

  const { data, error } = await q
  if (error) {
    console.error('searchCompetencies failed:', error)
    return []
  }
  return data ?? []
}

export async function searchCertifications(query: string, limit = 20) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certifications_taxonomy')
    .select('id, name, issuer, category')
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .limit(limit)

  if (error) {
    console.error('searchCertifications failed:', error)
    return []
  }
  return data ?? []
}

// ── Missing-item requests — the taxonomy's growth mechanism ────────

export async function requestMissingCompetency(
  userId: string,
  requestedName: string,
  requestedType: 'competency' | 'certification' | 'ai_tool',
  context?: string
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('competency_requests')
    .insert({ user_id: userId, requested_name: requestedName, requested_type: requestedType, context })

  if (error) console.error('requestMissingCompetency failed (non-fatal):', error)
}

// FIX: previously the only path for a missing skill was submitting a
// request and waiting for manual admin review — meaning a user with a
// genuine, real skill simply not yet in the taxonomy had no way to
// actually represent it in their OWN assessment. No taxonomy will ever
// cover every real-world skill/tool, so blocking on that is a real
// dead-end, not a minor gap.
//
// This creates the row immediately with is_active=false — it won't
// surface in searchCompetencies() for OTHER users (that query filters
// on is_active=true) until an admin reviews and activates it, but THIS
// user can select/rate it right now since their own reference is a
// direct foreign key, unaffected by the active flag. Also logs the
// request for the same admin-review queue as before, so nothing about
// the taxonomy's curation process is lost — just no longer a blocker.
export async function createPendingCompetencyAndSelect(
  userId: string,
  name: string,
  category: string = 'skill'
): Promise<{ id: string; name: string; category: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('competency_taxonomy')
    .insert({ name, category, is_active: false })
    .select('id, name, category')
    .single()

  if (error) {
    console.error('createPendingCompetencyAndSelect failed:', error)
    throw new Error('Failed to add skill')
  }

  // Non-fatal — the review-queue record is a nice-to-have for admin
  // visibility, but the competency row itself already exists and is
  // already usable regardless of whether this succeeds.
  await requestMissingCompetency(userId, name, 'competency', 'Auto-created via assessment — pending review').catch(() => {})

  return data
}

export async function createPendingCertificationAndSelect(
  userId: string,
  name: string
): Promise<{ id: string; name: string; issuer: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certifications_taxonomy')
    .insert({ name, is_active: false })
    .select('id, name, issuer')
    .single()

  if (error) {
    console.error('createPendingCertificationAndSelect failed:', error)
    throw new Error('Failed to add certification')
  }

  await requestMissingCompetency(userId, name, 'certification', 'Auto-created via assessment — pending review').catch(() => {})

  return data
}

// ── AI Tools matching — grounded recommendations only ───────────────

export interface MatchedAITool {
  id: string
  name: string
  category: string
  description: string
  learningResourceUrl: string | null
}

// Matches real catalog entries against a user's role/industry — this is
// the ONLY way AI tool "recommendations" should ever be produced in this
// app. No free-generated tool names, ever. Correctly handles the '*'
// wildcard seeded for universal tools (ChatGPT, Claude) — a plain SQL
// array-containment check does NOT treat '*' as "matches everyone", so
// that logic lives here, not in the database query.
export async function getMatchedAITools(role: string, industry: string, limit = 6): Promise<MatchedAITool[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_tools_catalog')
    .select('id, name, category, applicable_roles, applicable_industries, description, learning_resource_url')
    .eq('is_active', true)

  if (error) {
    console.error('getMatchedAITools failed:', error)
    return []
  }

  const matched = (data ?? []).filter(tool => {
    const roleMatch = tool.applicable_roles.includes('*') || tool.applicable_roles.includes(role)
    const industryMatch = tool.applicable_industries.includes('*') || tool.applicable_industries.includes(industry)
    return roleMatch && industryMatch
  })

  return matched.slice(0, limit).map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    learningResourceUrl: t.learning_resource_url,
  }))
}