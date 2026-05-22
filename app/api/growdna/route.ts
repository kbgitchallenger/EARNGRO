//app/api/growdna/route.ts
export const dynamic = 'force-dynamic'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateScores } from '@/lib/growdna/questions'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { answers } = body

    if (!answers || !answers.industry || !answers.seniority || !answers.current_ctc) {
      return NextResponse.json({ error: 'Missing required answers' }, { status: 400 })
    }

    // Calculate dimension scores locally
    const scores = calculateScores(answers)

    // Build context string for Claude
    const answerSummary = Object.entries(answers)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? (v as string[]).join(', ') : v}`)
      .join('\n')

    const prompt = `You are a senior career intelligence analyst for India and Southeast Asia, 2025–2026.

A professional has completed the EarnGro GrowDNA assessment. Analyse their answers and return ONLY raw JSON — no markdown, no backticks.

ASSESSMENT ANSWERS:
${answerSummary}

CALCULATED SCORES:
Market Alignment: ${scores.market_alignment}/100
Skill Premium: ${scores.skill_premium}/100
Visibility: ${scores.visibility}/100
Career Mobility: ${scores.mobility}/100
Negotiation Behaviour: ${scores.negotiation}/100
Hiring Readiness Score (HRS): ${scores.hrs}/1000

Return exactly this JSON:
{
  "career_archetype": <string, e.g. "The Strategic Climber", "The Hidden Gem", "The Market Mover", "The Deep Expert", "The Career Drifter", "The Visibility Gap", "The Negotiation Leaver">,
  "archetype_desc": <string, 2 sharp sentences describing this archetype and what it means for their earnings>,
  "earning_gap_estimate": <number, realistic annual gap in INR based on their profile — how much more they should earn>,
  "target_salary": <number, realistic annual CTC in INR they should be earning>,
  "months_to_close": <number, 6 to 30>,
  "top_strengths": [<string>, <string>, <string>],
  "critical_gaps": [<string>, <string>, <string>],
  "immediate_actions": [
    {"action": <string>, "impact": <string>, "timeline": <string>},
    {"action": <string>, "impact": <string>, "timeline": <string>},
    {"action": <string>, "impact": <string>, "timeline": <string>}
  ],
  "market_insight": <string, one sharp sentence about their specific market right now>,
  "salary_range_min": <number, 25th percentile for their profile>,
  "salary_range_max": <number, 90th percentile for their profile>,
  "peer_comparison": <string, e.g. "68% of professionals with your profile earn more than you currently do">
}

Rules:
- Be specific — name actual certifications, company types, skills by name
- earning_gap_estimate = target_salary minus current_ctc (minimum 0)
- For Government/PSU workers note the stability trade-off honestly
- Tier 2 city profiles should get realistic local benchmarks
- Career archetype must be one of the 7 listed above`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content
      .map(b => (b.type === 'text' ? b.text : ''))
      .join('')
      .replace(/```json|```/g, '')
      .trim()

    const aiResult = JSON.parse(raw)

    // Save to Supabase grow_dna table
    const { data: saved, error: saveError } = await supabase
      .from('grow_dna')
      .insert({
        user_id: user.id,
        industry: answers.industry,
        experience: answers.seniority,
        role: answers.role,
        city: answers.city,
        current_salary: answers.current_ctc,
        education: answers.education_tier ?? answers.education ?? null,
        company_type: answers.employer_trajectory ?? null,
        skills: answers.premium_skills ?? answers.certifications_fresher ?? [],
        career_archetype: aiResult.career_archetype,
        earning_gap: aiResult.earning_gap_estimate,
        target_salary: aiResult.target_salary,
        hrs_score: scores.hrs,
        months_to_close: aiResult.months_to_close,
        gap_reasons: aiResult.critical_gaps,
        close_actions: aiResult.immediate_actions.map((a: { action: string }) => a.action),
        salary_range_min: aiResult.salary_range_min,
        salary_range_max: aiResult.salary_range_max,
        raw_ai_response: aiResult,
      })
      .select('id')
      .single()

    if (saveError) {
      console.error('Supabase save error:', saveError)
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
    }

    return NextResponse.json({
      id: saved.id,
      scores,
      ...aiResult,
    })

  } catch (error) {
    console.error('GrowDNA API error:', error)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}