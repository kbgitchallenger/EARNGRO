export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createPendingCompetencyAndSelect } from '@/services/skillsProfile.service'
import { z } from 'zod'

const BodySchema = z.object({ name: z.string().min(2).max(120) })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = BodySchema.parse(await req.json())
    const result = await createPendingCompetencyAndSelect(user.id, body.name)
    return Response.json({ result })
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: 'Invalid request' }, { status: 400 })
    return Response.json({ error: 'Failed to add skill' }, { status: 500 })
  }
}