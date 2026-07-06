export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callAIJSON } from '@/lib/ai/client'
import { z } from 'zod'
import { getPersona } from '@/lib/interview/personas'
import { buildTurnPrompt } from '@/lib/interview/prompts'
import { deductCredits } from '@/services/credits.service'

const BodySchema = z.object({
  answer: z.string().min(1).max(5000),
})

const TurnResultSchema = z.object({
  scores: z.object({
    structure:   z.number().min(0).max(100),
    specificity: z.number().min(0).max(100),
    confidence:  z.number().min(0).max(100),
    relevance:   z.number().min(0).max(100),
  }),
  feedback:          z.string(),
  needsFollowup:     z.boolean(),
  followupQuestion:  z.string().nullable(),
  nextQuestion:      z.string().nullable(),
  nextSource:        z.enum(['bank', 'cv_personalized', 'follow_up']),
  sessionShouldEnd:  z.boolean(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Credit check
    const credit = await deductCredits(user.id, 'interview_turn', { sessionId })
    if (!credit.allowed) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_CREDITS', balance: credit.balance, required: credit.cost },
        { status: 402 }
      )
    }

    const body = await request.json()
    const { answer } = BodySchema.parse(body)

    // Fetch session
    const { data: session } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    if (session.status !== 'in_progress') {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 })
    }

    // Fetch all turns so far
    const { data: turns } = await supabase
      .from('interview_turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_index', { ascending: true })

    const currentTurnIdx = (turns?.length ?? 1) - 1
    const currentTurn = turns?.[currentTurnIdx]

    if (!currentTurn) return NextResponse.json({ error: 'Turn not found' }, { status: 404 })

    const persona = getPersona(session.persona)
    const questionsSoFar = (turns ?? []).map(t => t.question).filter(Boolean)

    // Determine max turns from session or default
    const maxTurns = 5

    // Score answer + get next question
    const result = await callAIJSON(
      buildTurnPrompt(
        {
          mode:             session.mode as any,
          role:             session.role ?? '',
          industry:         session.industry ?? '',
          experienceBand:   session.experience_band ?? '',
          weakestDimension: session.target_dimension ?? 'negotiation',
          persona,
          targetCompany:    session.company_target ?? undefined,
          questionsSoFar,
          turnIndex:        currentTurnIdx,
          maxTurns,
        },
        currentTurn.question,
        answer
      ),
      TurnResultSchema,
      { feature: 'interview_turn', userId: user.id }
    )

    // Update current turn with answer + scores
    await supabase
      .from('interview_turns')
      .update({
        user_answer: answer,
        sub_scores:  result.scores,
        feedback:    result.feedback,
      })
      .eq('id', currentTurn.id)

    // Insert next turn (question only) if session continues
    if (!result.sessionShouldEnd) {
      const nextQuestion = result.needsFollowup
        ? result.followupQuestion
        : result.nextQuestion

      if (nextQuestion) {
        await supabase.from('interview_turns').insert({
          session_id:  sessionId,
          turn_index:  currentTurnIdx + 1,
          question:    nextQuestion,
          source:      result.nextSource,
        })
      }
    }

    return NextResponse.json({
      scores:           result.scores,
      feedback:         result.feedback,
      needsFollowup:    result.needsFollowup,
      nextQuestion:     result.needsFollowup ? result.followupQuestion : result.nextQuestion,
      sessionShouldEnd: result.sessionShouldEnd,
      creditsRemaining: credit.balance,
    })

  } catch (err) {
    console.error('Interview turn error:', err instanceof Error ? err.stack : err)
    try {
      console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
    } catch {}
    return NextResponse.json({ error: 'Turn failed' }, { status: 500 })
  }
}