export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resumeService } from '@/services/resume.service'
import { ParsedResumeSchema } from '@/lib/ai/validators/resume.validator'
import { z } from 'zod'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { parsedData, name } = body

    const validated = ParsedResumeSchema.safeParse(parsedData)
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid resume data', details: validated.error.flatten() }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const canCreate = await resumeService.canCreateVersion(user.id, profile?.plan ?? 'free')
    if (!canCreate) {
      return NextResponse.json({ error: 'Version limit reached. Upgrade to create more versions.' }, { status: 403 })
    }

    const version = await resumeService.saveBuilderVersion(user.id, validated.data, name)
    return NextResponse.json({ versionId: version.id, versionNumber: version.version_number })

  } catch (err) {
    console.error('CV builder save error:', err)
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
  }
}