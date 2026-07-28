//app/api/interview/session/route.ts
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callAIJSON } from '@/lib/ai/client'
import { z } from 'zod'
import { getPersona } from '@/lib/interview/personas'
import { buildFirstQuestionPrompt } from '@/lib/interview/prompts'
import { deductCredits } from '@/services/credits.service'
import { recordStreakActivity } from '@/services/streaks.service'

const BodySchema = z.object({
  mode:            z.enum(['behavioral', 'functional', 'leadership', 'negotiation']),
  role:            z.string().min(1),
  industry:        z.string().min(1),
  experienceBand:  z.string().min(1),
  personaId:       z.string().min(1),
  targetCompany:   z.string().optional(),
  weakestDimension: z.string().default('negotiation'),
  maxTurns:        z.number().min(3).max(8).default(5),
})

const FirstQuestionSchema = z.object({
  question: z.string(),
  source:   z.enum(['bank', 'cv_personalized', 'follow_up']),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const input = BodySchema.parse(body)

    // ── Plan gate — Accelerate only. Checked here too, not just at the
    // page level, since a direct API call would otherwise bypass any
    // page-level gate entirely.
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if ((profile?.plan ?? 'free') !== 'accelerate') {
      return NextResponse.json(
        { error: 'UPGRADE_REQUIRED', message: 'AI Interview is available on the Accelerate plan.' },
        { status: 403 }
      )
    }

    // Validate persona in code — personas.ts is the single source of truth
    // now that the DB check constraint has been dropped. A bad/stale
    // personaId fails loudly here instead of either hitting a DB constraint
    // error (the bug this replaces) or silently falling back to a different
    // persona than the one the user actually picked.
    const persona = getPersona(input.personaId)
    if (!persona) {
      return NextResponse.json({ error: 'Invalid persona selected' }, { status: 400 })
    }

    // ── Credit check — starting a session generates a real AI call (the
    // first question), checked before that call runs.
    const credit = await deductCredits(user.id, 'interview_session_start')
    if (!credit.allowed) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_CREDITS', balance: credit.balance, required: credit.cost },
        { status: 402 }
      )
    }

    // Fetch CV highlights for personalization
    const { data: latestCV } = await supabase
      .from('cv_versions')
      .select('parsed_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let cvHighlights: string | undefined
    if (latestCV?.parsed_data) {
      const pd = latestCV.parsed_data as {
        name?: string
        experience?: { role: string; company: string; bullets?: string[] }[]
      }
      if (pd.experience?.[0]) {
        const latest = pd.experience[0]
        const bullets = latest.bullets?.slice(0, 2).join(' ') ?? ''
        cvHighlights = `Current role: ${latest.role} at ${latest.company}. Key achievements: ${bullets}`
      }
    }

    // Generate first question
    const firstQ = await callAIJSON(
      buildFirstQuestionPrompt({
        mode: input.mode,
        role: input.role,
        industry: input.industry,
        experienceBand: input.experienceBand,
        weakestDimension: input.weakestDimension,
        persona,
        targetCompany: input.targetCompany,
        cvHighlights,
        questionsSoFar: [],
        turnIndex: 0,
        maxTurns: input.maxTurns,
      }),
      FirstQuestionSchema,
      { feature: 'interview_session_start', userId: user.id }
    )

    // Create session
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id:          user.id,
        mode:             input.mode,
        role:             input.role,
        industry:         input.industry,
        experience_band:  input.experienceBand,
        company_target:   input.targetCompany ?? null,
        persona:          input.personaId,
        target_dimension: input.weakestDimension,
        status:           'in_progress',
      })
      .select('id')
      .single()

    if (error) {
      console.error('interview_sessions insert error:', JSON.stringify(error))
      return NextResponse.json({ error: 'Failed to create session', detail: error.message }, { status: 500 })
    }

    if (!session?.id) {
      console.error('interview_sessions insert returned no id — possible RLS SELECT block')
      return NextResponse.json({ error: 'Session created but id not returned' }, { status: 500 })
    }

    // Save first turn (question only, no answer yet)
    await supabase.from('interview_turns').insert({
      session_id:  session.id,
      turn_index:  0,
      question:    firstQ.question,
      source:      firstQ.source,
    })

    // Real streak activity — starting a real session counts the same as
    // any other genuine action.
    await recordStreakActivity(user.id)

    return NextResponse.json({
      sessionId:     session.id,
      firstQuestion: firstQ.question,
      persona: {
        name:        persona.name,
        title:       persona.title,
        company:     persona.company,
        emoji:       persona.emoji,
        signaturePhrase: persona.signaturePhrase,
        color:       persona.color,
      },
      maxTurns: input.maxTurns,
      creditsRemaining: credit.balance,
    })

  } catch (err) {
    console.error('Interview session create error:', err instanceof Error ? err.stack : err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: err.flatten() }, { status: 400 })
    }
    try {
      console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
    } catch {}
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
  }
}