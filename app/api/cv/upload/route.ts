export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resumeService } from '@/services/resume.service'
import { z } from 'zod'

const UploadBodySchema = z.object({
  fileUrl:   z.string().url(),
  fileName:  z.string().min(1),
  fileSize:  z.number().positive(),
  mimeType:  z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const validated = UploadBodySchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { fileUrl, fileName, fileSize, mimeType } = validated.data

    // Check plan limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan ?? 'free'
    const canCreate = await resumeService.canCreateVersion(user.id, plan)

    if (!canCreate) {
      return NextResponse.json(
        { error: 'Version limit reached. Upgrade to Grow plan for more versions.' },
        { status: 403 }
      )
    }

    const result = await resumeService.initializeUpload(
      user.id, fileUrl, fileName, fileSize, mimeType
    )

    return NextResponse.json(result)

  } catch (err) {
    console.error('CV upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}