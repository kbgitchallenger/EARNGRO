//app/%28app%29/interview/page.tsx
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InterviewSetup from '@/components/interview/InterviewSetup'

export const metadata = { title: 'AI Interview Practice — EarnGro' }

export default async function InterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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