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

  // ── Plan gate — AI Interview is Accelerate-only ──────────────────
  // Same hard block pattern as GrowPath and CV Analyze: checked server-side
  // before any data fetch, not just hidden client-side.
  // FIX: replaced the plain text lock-wall with a real, blurred preview of
  // the actual interview session screen — the user now sees the depth of
  // what they're missing (persona, live chat, feedback scores) instead of
  // just being told the feature exists behind a paywall.
  if (plan !== 'accelerate') {
    return (
      <LockedFeaturePreview
        icon="🎤"
        title="AI Interview is an Accelerate feature"
        description="Practice with a real-feeling AI interviewer, get scored per answer, and leave with a concrete improved example — available on the Accelerate plan."
        requiredPlan="accelerate"
        ctaLabel="Upgrade to Accelerate →"
      >
        <InterviewMockup />
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