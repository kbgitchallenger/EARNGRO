//app/api/growpath/milestones/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { computeAndSaveCareerHealthScore } from '@/lib/careerHealth/compute'
import { z } from 'zod'

const BodySchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = BodySchema.parse(await req.json())

    // Ownership check via join — RLS also enforces this, but checking
    // explicitly here lets us return a clean 404 instead of a generic
    // RLS-blocked update that looks like success with zero rows affected.
    const { data: milestone } = await supabase
      .from('growpath_milestones')
      .select('id, phase_id, growpath_phases(plan_id, growpath_plans(user_id))')
      .eq('id', id)
      .maybeSingle()

    const ownerId = (milestone as any)?.growpath_phases?.growpath_plans?.user_id
    if (!milestone || ownerId !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const update: Record<string, unknown> = { status: body.status }
    if (body.status === 'done') update.completed_at = new Date().toISOString()
    if (body.status !== 'done') update.completed_at = null

    const { error } = await supabase
      .from('growpath_milestones')
      .update(update)
      .eq('id', id)

    if (error) {
      console.error('Milestone update failed:', error)
      return Response.json({ error: 'Update failed' }, { status: 500 })
    }

    // Fire-and-forget — don't block the response on this, same pattern as
    // the auto-ATS trigger in cv/parse/route.ts.
    computeAndSaveCareerHealthScore(user.id).catch(err =>
      console.error('Career Health Score recompute failed:', err)
    )

    return Response.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('Milestone PATCH error:', err)
    return Response.json({ error: 'Update failed' }, { status: 500 })
  }
}