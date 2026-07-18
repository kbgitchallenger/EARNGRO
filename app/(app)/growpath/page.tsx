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

  // Free-plan check happens before the heavy downstream queries (phases,
  // companies, CV analysis, career health — none of which a free user can
  // see anyway). We DO fetch a lightweight grow_dna row here, scoped to
  // only the fields the locked preview needs, so the preview shows this
  // user's REAL gap/timeline/weakest dimension instead of generic example
  // data — sharpens the FOMO since it's genuinely theirs, not a stock shot.
  if (isFreePlan) {
    const { data: previewDna } = await supabase
      .from('grow_dna')
      .select('current_salary, target_salary, months_to_close, dimension_scores')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let weakestDimension = 'visibility'
    if (previewDna?.dimension_scores) {
      const ds = previewDna.dimension_scores as Record<string, number>
      const dims = ['market_alignment', 'skill_premium', 'visibility', 'mobility', 'negotiation']
      weakestDimension = dims.reduce((worst, d) => (ds[d] ?? 100) < (ds[worst] ?? 100) ? d : worst, dims[0])
    }

    return (
      <LockedFeaturePreview
        icon="🗺️"
        title="Build your GrowPath"
        description="A phased, month-by-month plan built from your GrowDNA results — skill targets, visibility milestones, and companies to target."
        requiredPlan="grow"
        ctaLabel="Upgrade to Grow →"
      >
        <GrowPathMockup
          currentSalary={previewDna?.current_salary ?? undefined}
          targetSalary={previewDna?.target_salary ?? undefined}
          monthsToClose={previewDna?.months_to_close ?? undefined}
          weakestDimension={weakestDimension}
        />
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

  const { data: chs } = await supabase
    .from('career_health_scores')
    .select('score, from_milestones_pct, from_practiced_skills, computed_at')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

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