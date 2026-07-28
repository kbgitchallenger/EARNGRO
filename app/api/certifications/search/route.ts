export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { searchCertifications } from '@/services/skillsProfile.service'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') ?? ''

  if (query.length < 2) return Response.json({ results: [] })

  const results = await searchCertifications(query)
  return Response.json({ results })
}