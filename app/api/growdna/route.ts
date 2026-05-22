// app/api/growdna/route.ts
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const ARCHETYPES: Record<string, { name: string; desc: string }> = {
  high_skill_low_market:  { name: 'The Hidden Gem',       desc: 'Strong skills, underexposed to market. One strategic move changes everything.' },
  high_all:               { name: 'The Market Ready Pro', desc: 'Skills, visibility, mobility all aligned. You\'re primed to capture your full value.' },
  low_negotiation:        { name: 'The Underpaid Expert',  desc: 'Skills are there but you consistently leave money on the table in negotiations.' },
  tenure_trap:            { name: 'The Loyal Underpaid',   desc: 'Deep expertise in one place, but the market has moved on without you knowing.' },
  career_switcher:        { name: 'The Strategic Climber', desc: 'Deliberate moves, growing comp, strong market awareness. On the right track.' },
  fresher_high:           { name: 'The Fast Starter',      desc: 'Exceptional early signals. With the right first move, trajectory looks strong.' },
  fresher_low:            { name: 'The Late Bloomer',      desc: 'Starting lean but skills can be built fast. First 18 months are everything.' },
  default:                { name: 'The Growth Professional', desc: 'Solid foundation with clear gaps to address for significant income growth.' },
}

function detectArchetype(answers: Record<string, unknown>, scores: Record<string, number>): string {
  const seniority = answers.seniority as string
  if (seniority === 'fresher' || seniority === 'junior') {
    return scores.skill_premium > 60 ? 'fresher_high' : 'fresher_low'
  }
  if (answers.promotion_velocity === 'stuck') return 'tenure_trap'
  if (answers.negotiation_history === 'never' || answers.negotiation_history === 'joining_only') {
    if (scores.skill_premium > 60) return 'low_negotiation'
  }
  if (answers.promotion_velocity === 'switched') return 'career_switcher'
  if (scores.skill_premium > 70 && scores.visibility < 40) return 'high_skill_low_market'
  if (scores.hrs > 700) return 'high_all'
  return 'default'
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { answers, scores } = await req.json()

    // Build AI prompt
    const prompt = `You are a senior compensation intelligence analyst for India and Southeast Asia, 2025–2026.

Analyse this career profile from a GrowDNA assessment and return ONLY raw JSON.

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

Return exactly this JSON:
{
  "target_salary": <number, realistic market rate annual CTC in INR>,
  "salary_range_min": <number, 25th percentile>,
  "salary_range_max": <number, 90th percentile>,
  "earning_gap": <number, target minus current, minimum 0>,
  "gap_percentage": <number, rounded integer>,
  "months_to_close": <number, 4 to 36>,
  "market_context": <string, one sharp sentence about this profile in this market right now>,
  "gap_reasons": [<string>, <string>, <string>],
  "close_actions": [<string>, <string>, <string>]
}

Rules:
- Be realistic — not inflated
- Tier 2 cities: apply 20–30% discount
- Government/PSU: acknowledge gap but note security trade-off
- Freshers: modest gap, focus on trajectory
- gap_reasons must name specific skills, companies, or certifications
- close_actions must be specific with timelines and expected impact`

    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No AI response')

    const aiResult = JSON.parse(textBlock.text.replace(/```json|```/g, '').trim())
    const archetypeKey = detectArchetype(answers, scores)
    const archetype = ARCHETYPES[archetypeKey] || ARCHETYPES.default

    // Save to Supabase
    const { error: saveError } = await supabase.from('grow_dna').insert({
      user_id: user.id,
      industry: answers.industry,
      experience: answers.seniority,
      role: answers.role,
      city: answers.city,
      current_salary: Number(answers.current_ctc),
      education: answers.education_tier || answers.seniority,
      company_type: answers.employer_trajectory || 'not specified',
      skills: Array.isArray(answers.premium_skills) ? answers.premium_skills : [],
      career_archetype: archetype.name,
      earning_gap: aiResult.earning_gap,
      target_salary: aiResult.target_salary,
      hrs_score: scores.hrs,
      months_to_close: aiResult.months_to_close,
      gap_reasons: aiResult.gap_reasons,
      close_actions: aiResult.close_actions,
      salary_range_min: aiResult.salary_range_min,
      salary_range_max: aiResult.salary_range_max,
      raw_ai_response: aiResult,
    })

    if (saveError) {
      console.error('Supabase save error:', saveError)
      return Response.json({ error: 'Save failed', detail: saveError }, { status: 500 })
    }

    return Response.json({ success: true, archetype: archetype.name })

  } catch (err) {
    console.error('GrowDNA API error:', err)
    return Response.json({ error: 'Analysis failed' }, { status: 500 })
  }
}