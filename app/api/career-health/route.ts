import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('career_health_scores')
    .select('score, from_milestones_pct, from_practiced_skills, computed_at')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return Response.json({ score: data ?? null })
}