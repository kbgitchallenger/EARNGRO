export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InterviewSetup from '@/components/interview/InterviewSetup'
import LockedFeaturePreview from '@/components/shared/LockedFeaturePreview'
import InterviewMockup from '@/components/marketing/mockups/InterviewMockup'

export const metadata = { title: 'AI Interview Practice — EarnGro' }

export default async function InterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'

  // Plan gate — AI Interview is Accelerate-only, checked server-side
  // before any further data fetch.
  if (plan !== 'accelerate') {
    // Lightweight real GrowDNA fetch, scoped to only what the preview
    // needs, so the locked preview shows a persona genuinely matched to
    // this user's weakest dimension and their real role — not a fixed
    // generic example.
    const { data: previewDna } = await supabase
      .from('grow_dna')
      .select('role, dimension_scores')
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
        icon="🎤"
        title="AI Interview is an Accelerate feature"
        description="Practice with a real-feeling AI interviewer, get scored per answer, and leave with a concrete improved example — available on the Accelerate plan."
        requiredPlan="accelerate"
        ctaLabel="Upgrade to Accelerate →"
      >
        <InterviewMockup
          role={previewDna?.role ?? undefined}
          weakestDimension={weakestDimension}
        />
      </LockedFeaturePreview>
    )
  }

  // Pre-fill from latest GrowDNA
  const { data: dna } = await supabase
    .from('grow_dna')
    .select('role, industry, experience, hrs_score, dimension_scores, career_archetype')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Find weakest dimension
  let weakestDimension = 'negotiation'
  if (dna?.dimension_scores) {
    const ds = dna.dimension_scores as Record<string, number>
    const dims = ['market_alignment', 'skill_premium', 'visibility', 'mobility', 'negotiation']
    weakestDimension = dims.reduce((worst, d) => (ds[d] ?? 100) < (ds[worst] ?? 100) ? d : worst, dims[0])
  }

  // Fetch recent sessions
  const { data: recentSessions } = await supabase
    .from('interview_sessions')
    .select('id, mode, role, overall_score, created_at, status, persona')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <InterviewSetup
      prefill={{
        role:             dna?.role ?? '',
        industry:         dna?.industry ?? '',
        experienceBand:   dna?.experience ?? '',
        weakestDimension,
        hrsScore:         dna?.hrs_score ?? null,
        careerArchetype:  dna?.career_archetype ?? null,
      }}
      recentSessions={recentSessions ?? []}
    />
  )
}