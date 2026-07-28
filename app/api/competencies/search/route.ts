export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { searchCompetencies } from '@/services/skillsProfile.service'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? undefined

  if (query.length < 2) return Response.json({ results: [] })

  const results = await searchCompetencies(query, category)
  return Response.json({ results })
}