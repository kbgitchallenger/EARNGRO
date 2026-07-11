//app/api/cv/parse/route.ts
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

    let result
    try {
      result = await resumeService.runParsePipeline(
        versionId, jobId, fileUrl, mimeType, user.id
      )
    } catch (err) {
      // Distinguish "out of credits" (real 402, previously this parse call
      // was unmetered so this branch never existed) from genuine parse
      // failures (bad PDF, unsupported format, etc.)
      const typedErr = err as Error & { code?: string; balance?: number; required?: number }
      if (typedErr.code === 'INSUFFICIENT_CREDITS') {
        return NextResponse.json(
          { error: 'INSUFFICIENT_CREDITS', balance: typedErr.balance ?? 0, required: typedErr.required ?? 0 },
          { status: 402 }
        )
      }
      throw err
    }

    // Fire-and-forget ATS analysis after successful parse — this call is
    // now separately gated (plan + credits) inside cv/analyze/route.ts
    // itself, so a free-plan user's parse still succeeds even though the
    // auto-triggered analyze will correctly reject with a 403 there.
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