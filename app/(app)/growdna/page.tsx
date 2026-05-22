// app/(app)/growdna/page.tsx

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

  // Check if already completed
  const { data: existing } = await supabase
    .from('grow_dna')
    .select('id, career_archetype, earning_gap, hrs_score, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <GrowDNAAssessment
      userId={user.id}
      existingResult={existing ?? null}
    />
  )
}