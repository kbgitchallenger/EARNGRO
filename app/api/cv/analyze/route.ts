//app/api/cv/analyze/route.ts
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { atsService } from '@/services/ats.service'
import { deductCredits } from '@/services/credits.service'
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

    // ── Plan gate — CV Analysis is Grow+ only ───────────────────
    // Real cost (127 credits) leaves no room in the free tier's 300-credit
    // budget alongside GrowDNA (103) + CV Parse (96). Free users can parse
    // their CV and use Bullets, but full ATS analysis requires upgrading —
    // this is a hard plan block, not just a credit check, matching the
    // pattern already used for GrowPath.
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if ((profile?.plan ?? 'free') === 'free') {
      return NextResponse.json(
        {
          error: 'UPGRADE_REQUIRED',
          message: 'Full CV Analysis is available on the Grow plan. Upgrade to unlock ATS scoring, keyword gaps, and market alignment.',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { versionId, jobDescription } = BodySchema.parse(body)

    const { data: version, error } = await supabase
      .from('cv_versions')
      .select('id, raw_text, parsed_data, user_id')
      .eq('id', versionId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !version) {
      return NextResponse.json({ error: 'Resume version not found' }, { status: 404 })
    }

    if (!version.raw_text) {
      return NextResponse.json({ error: 'Resume has not been parsed yet' }, { status: 400 })
    }

    // ── Single honest price, every time — no first-run vs repeat
    // distinction (both call the identical function at identical cost).
    const credit = await deductCredits(user.id, 'cv_analyze', { versionId })

    if (!credit.allowed) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_CREDITS',
          message: 'Not enough credits for CV analysis. Add credits or wait for your next cycle.',
          balance: credit.balance,
          required: credit.cost,
        },
        { status: 402 }
      )
    }

    const result = await atsService.analyze(
      versionId,
      user.id,
      version.raw_text,
      version.parsed_data,
      jobDescription
    )

    return NextResponse.json({ ...result, credits_remaining: credit.balance })

  } catch (err) {
    console.error('ATS analyze error:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: err.flatten() }, { status: 400 })
    }
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Analysis failed', details: errorMessage }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const isInternal = request.headers.get('x-internal') === 'true'
    const { data: { user } } = await supabase.auth.getUser()
    if (!user && !isInternal) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const versionId = searchParams.get('versionId')

    let userId = user?.id
    if (!userId && isInternal) {
      const body = await request.json()
      const { data: v } = await supabase
        .from('cv_versions')
        .select('user_id')
        .eq('id', body.versionId)
        .single()
      userId = v?.user_id
      if (!userId) return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

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