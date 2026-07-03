import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GrowPathView from '@/components/growpath/GrowPathView'

export default async function GrowPathPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

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
    .select('current_salary, target_salary, earning_gap, months_to_close')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <GrowPathView
      userId={user.id}
      plan={plan}
      phases={phases}
      companies={companies}
      dna={dna}
      isFreePlan={(profile?.plan ?? 'free') === 'free'}
    />
  )
}