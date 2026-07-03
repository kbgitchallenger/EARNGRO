//lib/careerHealth/compute.ts
import { createClient } from '@/lib/supabase/server'

const MILESTONE_WEIGHT = 0.7
const PRACTICED_SKILLS_WEIGHT = 0.3
const PRACTICED_SKILLS_BASELINE = 50 // neutral default until user has any AI Interview sessions

export async function computeAndSaveCareerHealthScore(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('growpath_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  let milestonesPct = 0
  if (plan) {
    const { data: phases } = await supabase
      .from('growpath_phases')
      .select('id')
      .eq('plan_id', plan.id)

    const phaseIds = (phases ?? []).map(p => p.id)

    if (phaseIds.length > 0) {
      const { count: total } = await supabase
        .from('growpath_milestones')
        .select('id', { count: 'exact', head: true })
        .in('phase_id', phaseIds)

      const { count: done } = await supabase
        .from('growpath_milestones')
        .select('id', { count: 'exact', head: true })
        .in('phase_id', phaseIds)
        .eq('status', 'done')

      milestonesPct = total && total > 0 ? Math.round(((done ?? 0) / total) * 100) : 0
    }
  }

  const { data: skillRows } = await supabase
    .from('practiced_skill_scores')
    .select('score')
    .eq('user_id', userId)

  const practicedSkillsAvg = skillRows && skillRows.length > 0
    ? Math.round(skillRows.reduce((sum, r) => sum + r.score, 0) / skillRows.length)
    : PRACTICED_SKILLS_BASELINE

  const score = Math.round(
    milestonesPct * MILESTONE_WEIGHT + practicedSkillsAvg * PRACTICED_SKILLS_WEIGHT
  )

  const { error } = await supabase.from('career_health_scores').insert({
    user_id: userId,
    score,
    from_milestones_pct: milestonesPct,
    from_practiced_skills: practicedSkillsAvg,
  })

  if (error) {
    console.error('Career Health Score save failed:', error)
  }

  return score
}