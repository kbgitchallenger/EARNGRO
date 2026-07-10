//app/api/interview/session/[id]/complete/route.ts

export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callAIJSON } from '@/lib/ai/client'
import { z } from 'zod'
import { getPersona } from '@/lib/interview/personas'
import { buildReportPrompt } from '@/lib/interview/prompts'
import { deductCredits } from '@/services/credits.service'

const ReportSchema = z.object({
  overall_score:     z.number().min(0).max(100),
  dimension_scores: z.object({
    structure:   z.number().min(0).max(100),
    specificity: z.number().min(0).max(100),
    confidence:  z.number().min(0).max(100),
    relevance:   z.number().min(0).max(100),
  }),
  session_summary:       z.string(),
  strongest_turn_index:  z.number(),
  weakest_turn_index:    z.number(),
  improved_answer:       z.string(),
  key_improvements:      z.array(z.string()).max(5),
  hrs_impact_note:       z.string(),
  next_session_focus:    z.string(),
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

    // ── Validate everything BEFORE charging credits ──
    // Previously deductCredits ran first, so "Session not found" or
    // "No answers found" still charged 60 credits for a request that was
    // never going to succeed.
    const { data: session } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const { data: turns } = await supabase
      .from('interview_turns')
      .select('*')
      .eq('session_id', sessionId)
      .not('user_answer', 'is', null)
      .order('turn_index', { ascending: true })

    if (!turns || turns.length === 0) {
      return NextResponse.json({ error: 'No answers found' }, { status: 400 })
    }

    const persona = getPersona(session.persona)
    if (!persona) {
      console.error(`Session ${sessionId} has unrecognised persona id: ${session.persona}`)
      return NextResponse.json({ error: 'Session has an invalid persona and cannot generate a report' }, { status: 500 })
    }

    // ── Now that the request is confirmed valid, deduct the credit ──
    const credit = await deductCredits(user.id, 'interview_report', { sessionId })
    if (!credit.allowed) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_CREDITS', balance: credit.balance, required: credit.cost },
        { status: 402 }
      )
    }

    // Generate report
    const report = await callAIJSON(
      buildReportPrompt(
        {
          mode:             session.mode as any,
          role:             session.role ?? '',
          industry:         session.industry ?? '',
          experienceBand:   session.experience_band ?? '',
          weakestDimension: session.target_dimension ?? 'negotiation',
          persona,
          targetCompany:    session.company_target ?? undefined,
          questionsSoFar:   turns.map(t => t.question),
        },
        turns.map(t => ({
          question: t.question,
          answer:   t.user_answer ?? '',
          scores:   t.sub_scores ?? { structure: 50, specificity: 50, confidence: 50, relevance: 50 },
          feedback: t.feedback ?? '',
        }))
      ),
      ReportSchema,
      { feature: 'interview_report', userId: user.id }
    )

    // Save improved answer to weakest turn
    const weakestTurn = turns[report.weakest_turn_index]
    if (weakestTurn) {
      await supabase
        .from('interview_turns')
        .update({ improved_answer: report.improved_answer })
        .eq('id', weakestTurn.id)
    }

    // Update session to completed
    await supabase
      .from('interview_sessions')
      .update({
        status:       'completed',
        overall_score: report.overall_score,
        completed_at:  new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Update practiced_skill_scores with dimension averages
    const dimUpdates = Object.entries(report.dimension_scores).map(([dim, score]) =>
      supabase.from('practiced_skill_scores').upsert({
        user_id:    user.id,
        dimension:  dim,
        score,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,dimension' })
    )
    await Promise.all(dimUpdates)

    return NextResponse.json({
      ...report,
      sessionId,
      turns: turns.map(t => ({
        turnIndex:       t.turn_index,
        question:        t.question,
        answer:          t.user_answer,
        scores:          t.sub_scores,
        feedback:        t.feedback,
        improvedAnswer:  t.improved_answer,
      })),
      creditsRemaining: credit.balance,
    })

  } catch (err) {
    console.error('Interview complete error:', err)
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}