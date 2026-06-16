import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GrowDNAAssessment from '@/components/growdna/GrowDNAAssessment'

export const metadata = {
  title: 'GrowDNA Assessment — EarnGro',
  description: 'Discover your career archetype and earning gap',
}

export default async function GrowDNAPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('grow_dna')
    .select(`
      id, career_archetype, earning_gap, hrs_score, created_at,
      target_salary, months_to_close, current_salary,
      dimension_scores, raw_ai_response,
      role, city, industry, experience,
      gap_reasons, close_actions,
      salary_range_min, salary_range_max
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <GrowDNAAssessment
      userId={user.id}
      existingResult={existing ?? null}
    />
  )
}