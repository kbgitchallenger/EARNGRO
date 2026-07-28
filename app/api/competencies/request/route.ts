export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { requestMissingCompetency } from '@/services/skillsProfile.service'
import { z } from 'zod'

const BodySchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(['competency', 'certification', 'ai_tool']),
  context: z.string().max(300).optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = BodySchema.parse(await req.json())
    await requestMissingCompetency(user.id, body.name, body.type, body.context)
    return Response.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('Competency request failed:', err)
    return Response.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}