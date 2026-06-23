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

    const body = await request.json()
    const { versionId, jobDescription } = BodySchema.parse(body)

    // Fetch version data
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

    // ── CREDIT CHECK ─────────────────────────────────────────────
    // First analysis for THIS version = cv_parse_analyze (233 credits)
    // Re-running analysis on the SAME version = ats_reanalyze (138 credits)
    const { count: priorAnalysisCount } = await supabase
      .from('cv_analyses')
      .select('id', { count: 'exact', head: true })
      .eq('cv_version_id', versionId)

    const isFirstAnalysis = (priorAnalysisCount ?? 0) === 0
    const feature = isFirstAnalysis ? 'cv_parse_analyze' : 'ats_reanalyze'

    const credit = await deductCredits(user.id, feature, { versionId })

    if (!credit.allowed) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_CREDITS',
          message: isFirstAnalysis
            ? "You've used your free CV analysis. Upgrade to Grow for unlimited re-analysis."
            : 'Not enough credits to re-analyse this resume. Upgrade or add credits to continue.',
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