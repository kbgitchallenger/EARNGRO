import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GrowPathView from '@/components/growpath/GrowPathView'
import LockedFeaturePreview from '@/components/shared/LockedFeaturePreview'
import GrowPathMockup from '@/components/marketing/mockups/GrowPathMockup'

export default async function GrowPathPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isFreePlan = (profile?.plan ?? 'free') === 'free'

  // FIX: free-plan check now happens BEFORE any of the downstream queries
  // (phases, companies, CV analysis, career health) — previously these all
  // ran unconditionally even though a free user was about to see a fixed
  // locked-upsell screen regardless of the result. Also replaces the plain
  // text lock-wall with a real, blurred preview of the actual GrowPath
  // screen, so the user sees the depth of what they're missing instead of
  // just being told a feature exists.
  if (isFreePlan) {
    return (
      <LockedFeaturePreview
        icon="🗺️"
        title="Build your GrowPath"
        description="A phased, month-by-month plan built from your GrowDNA results — skill targets, visibility milestones, and companies to target."
        requiredPlan="grow"
        ctaLabel="Upgrade to Grow →"
      >
        <GrowPathMockup />
      </LockedFeaturePreview>
    )
  }

  const { data: plan } = await supabase
    .from('growpath_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  let phases: any[] = []
  let companies: any[] = []

  if (plan) {
    const [{ data: phaseRows }, { data: companyRows }] = await Promise.all([
      supabase
        .from('growpath_phases')
        .select('*, growpath_milestones(*)')
        .eq('plan_id', plan.id)
        .order('phase_index', { ascending: true }),
      supabase
        .from('growpath_target_companies')
        .select('*')
        .eq('plan_id', plan.id),
    ])
    phases = phaseRows ?? []
    companies = companyRows ?? []
  }

  const { data: dna } = await supabase
    .from('grow_dna')
    .select('current_salary, target_salary, earning_gap, months_to_close, dimension_scores, gap_reasons, raw_ai_response')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Career Health Score — most recent computed value, separate from HRS
  const { data: chs } = await supabase
    .from('career_health_scores')
    .select('score, from_milestones_pct, from_practiced_skills, computed_at')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Latest CV analysis — feeds Top Skill Gaps + Market Positioning.
  // Joined through cv_versions since analyses are scoped to a version, not
  // directly to the user.
  const { data: latestVersion } = await supabase
    .from('cv_versions')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let cvAnalysis: any = null
  if (latestVersion) {
    const { data } = await supabase
      .from('cv_analyses')
      .select('ats_score, recruiter_score, market_alignment, keyword_gaps, critical_issues, improvements')
      .eq('cv_version_id', latestVersion.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    cvAnalysis = data
  }

  return (
    <GrowPathView
      userId={user.id}
      plan={plan}
      phases={phases}
      companies={companies}
      dna={dna}
      careerHealth={chs}
      cvAnalysis={cvAnalysis}
      isFreePlan={false}
    />
  )
}