// app/api/growdna/route.ts
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const ARCHETYPES: Record<string, { name: string; desc: string }> = {
  high_skill_low_market:  { name: 'The Hidden Gem',          desc: 'Strong skills, underexposed to market. One strategic move changes everything.' },
  high_all:               { name: 'The Market Ready Pro',    desc: 'Skills, visibility, mobility all aligned. You\'re primed to capture your full value.' },
  low_negotiation:        { name: 'The Underpaid Expert',    desc: 'Skills are there but you consistently leave money on the table in negotiations.' },
  tenure_trap:            { name: 'The Loyal Underpaid',     desc: 'Deep expertise in one place, but the market has moved on without you knowing.' },
  career_switcher:        { name: 'The Strategic Climber',   desc: 'Deliberate moves, growing comp, strong market awareness. On the right track.' },
  fresher_high:           { name: 'The Fast Starter',        desc: 'Exceptional early signals. With the right first move, trajectory looks strong.' },
  fresher_low:            { name: 'The Late Bloomer',        desc: 'Starting lean but skills can be built fast. First 18 months are everything.' },
  default:                { name: 'The Growth Professional', desc: 'Solid foundation with clear gaps to address for significant income growth.' },
}

function detectArchetype(answers: Record<string, unknown>, scores: Record<string, number>): string {
  const seniority = answers.seniority as string

  if (seniority === 'fresher' || seniority === 'junior') {
    return scores.skill_premium > 60 ? 'fresher_high' : 'fresher_low'
  }

  if (answers.promotion_velocity === 'stuck') return 'tenure_trap'

  if (
    answers.negotiation_history === 'never' ||
    answers.negotiation_history === 'joining_only'
  ) {
    if (scores.skill_premium > 60) return 'low_negotiation'
  }

  if (answers.promotion_velocity === 'switched') return 'career_switcher'

  if (scores.skill_premium > 70 && scores.visibility < 40) {
    return 'high_skill_low_market'
  }

  if (scores.hrs > 700) return 'high_all'

  return 'default'
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answers, scores } = await req.json()

    const archetypeKey = detectArchetype(answers, scores)
    const archetype = ARCHETYPES[archetypeKey] || ARCHETYPES.default

    // ── AI prompt — returns the exact shape the frontend needs ──
    const prompt = `You are a senior compensation intelligence analyst for India and Southeast Asia, 2026–2027.

Analyse this career profile from a GrowDNA assessment and return ONLY raw JSON — no markdown, no backticks.

PROFILE:
Industry: ${answers.industry}
Seniority: ${answers.seniority}
Role: ${answers.role}
City: ${answers.city}
Current Annual CTC: ₹${Number(answers.current_ctc).toLocaleString('en-IN')}
Negotiation history: ${answers.negotiation_history}
Growth investment level: ${answers.growth_investment ?? 0} out of 5

DIMENSION SCORES (0-100):
Market Alignment: ${scores.market_alignment}
Skill Premium: ${scores.skill_premium}
Visibility: ${scores.visibility}
Mobility: ${scores.mobility}
Negotiation: ${scores.negotiation}
HRS (Hiring Readiness Score): ${scores.hrs} / 1000

Return exactly this JSON object:
{
  "target_salary": <number, realistic market rate annual CTC in INR>,
  "salary_range_min": <number, 25th percentile in INR>,
  "salary_range_max": <number, 90th percentile in INR>,
  "earning_gap_estimate": <number, target_salary minus current CTC, minimum 0>,
  "months_to_close": <number, 4 to 36>,
  "peer_comparison": <string, one sharp sentence benchmarking this person against verified peers in same role+city>,
  "market_insight": <string, one actionable sentence about this specific market right now>,
  "top_strengths": [<string>, <string>, <string>],
  "critical_gaps": [<string>, <string>, <string>],
  "immediate_actions": [
    { "action": <string>, "impact": <string>, "timeline": <string> },
    { "action": <string>, "impact": <string>, "timeline": <string> },
    { "action": <string>, "impact": <string>, "timeline": <string> }
  ]
}

Rules:
- Be realistic — not inflated
- Tier 2 cities: apply 20–30% discount vs metro
- Government/PSU: acknowledge security trade-off in peer_comparison
- Freshers: modest gap, focus on trajectory in market_insight
- top_strengths: specific skills, credentials, or behaviours this person already has
- critical_gaps: name specific missing skills, certifications, or companies to target
- immediate_actions: each action must have a concrete timeline (e.g. "30 days", "6 weeks") and measurable impact (e.g. "₹2–3L hike")`

    const client = new Anthropic()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textBlock = message.content.find((b) => b.type === 'text')

    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No AI response')
    }

    const aiResult = JSON.parse(
      textBlock.text.replace(/```json|```/g, '').trim()
    )

    // ── Save to Supabase ────────────────────────────────────────
    const { data: saved, error: saveError } = await supabase
      .from('grow_dna')
      .insert({
        user_id: user.id,
        industry: answers.industry,
        experience: answers.seniority,
        role: answers.role,
        city: answers.city,
        current_salary: Number(answers.current_ctc),
        education: answers.education_tier || answers.seniority,
        company_type: answers.employer_trajectory || 'not specified',
        skills: Array.isArray(answers.premium_skills)
          ? answers.premium_skills
          : [],
        career_archetype: archetype.name,
        earning_gap: aiResult.earning_gap_estimate,
        target_salary: aiResult.target_salary,
        hrs_score: scores.hrs,
        months_to_close: aiResult.months_to_close,
        gap_reasons: aiResult.critical_gaps,
        close_actions: aiResult.immediate_actions,
        salary_range_min: aiResult.salary_range_min,
        salary_range_max: aiResult.salary_range_max,
        raw_ai_response: aiResult,

        dimension_scores: {
          market_alignment: scores.market_alignment,
          skill_premium: scores.skill_premium,
          visibility: scores.visibility,
          mobility: scores.mobility,
          negotiation: scores.negotiation,
        },
      })
      .select('id')
      .single()

    if (saveError) {
      console.error('Supabase save error:', saveError)
      // Don't block the user — log and continue
    }

    // ── Return full AIResult shape the frontend expects ─────────
    return Response.json({
      assessment_id: saved?.id ?? user.id,

      career_archetype: archetype.name,
      archetype_desc: archetype.desc,

      earning_gap_estimate: aiResult.earning_gap_estimate,
      target_salary: aiResult.target_salary,

      salary_range_min: aiResult.salary_range_min,
      salary_range_max: aiResult.salary_range_max,

      months_to_close: aiResult.months_to_close,

      peer_comparison: aiResult.peer_comparison,
      market_insight: aiResult.market_insight,

      top_strengths: aiResult.top_strengths ?? [],
      critical_gaps: aiResult.critical_gaps ?? [],
      immediate_actions: aiResult.immediate_actions ?? [],

      scores: {
        market_alignment: scores.market_alignment,
        skill_premium: scores.skill_premium,
        visibility: scores.visibility,
        mobility: scores.mobility,
        negotiation: scores.negotiation,
        hrs: scores.hrs,
      },
    })
  } catch (err) {
    console.error('GrowDNA API error:', err)

    return Response.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}