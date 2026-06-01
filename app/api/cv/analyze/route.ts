export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { atsService } from '@/services/ats.service'
import { z } from 'zod'

const BodySchema = z.object({
  versionId:      z.string().uuid(),
  jobDescription: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { versionId, jobDescription } = BodySchema.parse(body)

    // Fetch version data
    const { data: version, error } = await supabase
      .from('cv_versions')
      .select('id, raw_text, parsed_data, user_id')
      .eq('id', versionId)
      .eq('user_id', user.id)
      .single()

    if (error || !version) {
      return NextResponse.json({ error: 'Resume version not found' }, { status: 404 })
    }

    if (!version.raw_text) {
      return NextResponse.json({ error: 'Resume has not been parsed yet' }, { status: 400 })
    }

    const result = await atsService.analyze(
      versionId,
      user.id,
      version.raw_text,
      version.parsed_data,
      jobDescription
    )

    return NextResponse.json(result)

  } catch (err) {
    console.error('ATS analyze error:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const versionId = searchParams.get('versionId')

    if (!versionId) {
      return NextResponse.json({ error: 'versionId required' }, { status: 400 })
    }

    const analysis = await atsService.getLatestForVersion(versionId)
    if (!analysis) {
      return NextResponse.json({ error: 'No analysis found' }, { status: 404 })
    }

    return NextResponse.json(analysis)

  } catch (err) {
    console.error('ATS fetch error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}