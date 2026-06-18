export const dynamic = 'force-dynamic'
export const maxDuration = 60 // seconds — extend for AI processing

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resumeService } from '@/services/resume.service'
import { z } from 'zod'

const ParseBodySchema = z.object({
  versionId: z.string().uuid(),
  jobId:     z.string().uuid(),
  fileUrl:   z.string().url(),
  mimeType:  z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const validated = ParseBodySchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { versionId, jobId, fileUrl, mimeType } = validated.data

    const result = await resumeService.runParsePipeline(
      versionId, jobId, fileUrl, mimeType
    )

    // Fire-and-forget ATS analysis after successful parse
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL 
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

      fetch(`${appUrl}/api/cv/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId }),
    }).catch(err => console.error('Auto-ATS trigger failed:', err))

    return NextResponse.json({
      success: true,
      parse_method: result.parse_method,
      word_count: result.raw_text.split(/\s+/).length,
    })

  } catch (err) {
    console.error('CV parse error:', err)
    const message = err instanceof Error ? err.message : 'Parse failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
