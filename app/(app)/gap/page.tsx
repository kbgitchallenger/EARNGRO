export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GapPage from '@/components/gap/GapPage'

export const metadata = {
  title: 'Earning Gap — EarnGro',
  description: 'Your career growth journey and earning gap analysis',
}

export default async function EarningGapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attempts } = await supabase
    .from('grow_dna')
    .select(`
      id, attempt_number, created_at,
      industry, experience, role, city,
      current_salary, target_salary, earning_gap,
      hrs_score, months_to_close, career_archetype,
      salary_range_min, salary_range_max,
      dimension_scores, gap_reasons, close_actions,
      raw_ai_response
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <GapPage
      attempts={attempts ?? []}
      userId={user.id}
    />
  )
}