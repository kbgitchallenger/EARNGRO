//app/api/growpath/generate/route.ts
import { createClient } from '@/lib/supabase/server'
import { callAIJSON } from '@/lib/ai/client'
import { deductCredits } from '@/services/credits.service'
import { z } from 'zod'

const MilestoneSchema = z.object({
  type: z.enum(['skill', 'visibility', 'application', 'negotiation']),
  title: z.string(),
  description: z.string(),
  why_it_matters: z.string(),
  how_to_improve: z.array(z.string()),
  linked_dimension: z.enum(['market_alignment', 'skill_premium', 'visibility', 'mobility', 'negotiation']),
  target_month: z.number(),
})

const PhaseSchema = z.object({
  title: z.string(),
  start_month: z.number(),
  end_month: z.number(),
  milestones: z.array(MilestoneSchema),
})

const TargetCompanySchema = z.object({
  company_name: z.string(),
  rationale: z.string(),
  est_salary_min: z.number(),
  est_salary_max: z.number(),
})

const GrowPathSchema = z.object({
  phases: z.array(PhaseSchema),
  target_companies: z.array(TargetCompanySchema),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if ((profile?.plan ?? 'free') === 'free') {
      return Response.json(
        { error: 'FREE_LIMIT_REACHED', message: 'GrowPath is available on the Grow plan. Upgrade to unlock your roadmap.' },
        { status: 402 }
      )
    }

    const { data: dna } = await supabase
      .from('grow_dna')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!dna) {
      return Response.json({ error: 'NO_ASSESSMENT', message: 'Complete a GrowDNA assessment first.' }, { status: 400 })
    }

    const credit = await deductCredits(user.id, 'growpath_generate')
    if (!credit.allowed) {
      return Response.json(
        { error: 'INSUFFICIENT_CREDITS', message: 'Not enough credits to generate a GrowPath.', balance: credit.balance, required: credit.cost },
        { status: 402 }
      )
    }

    const immediateActions = dna.raw_ai_response?.immediate_actions ?? []
    const dims = dna.dimension_scores ?? {}

    const prompt = `You are a career strategist building a phased, month-by-month growth plan for a professional based on their assessment data.

CRITICAL RULES:
- Do NOT invent facts not present in the profile below.
- Every milestone's linked_dimension must be exactly one of: market_alignment, skill_premium, visibility, mobility, negotiation.
- Phases must be sequential and non-overlapping, covering month 0 to ${dna.months_to_close ?? 12}.
- Build 3 phases unless the timeline is long enough to warrant more (roughly one phase per 6-10 months).
- Each phase should have 2-4 milestones.
- Return ONLY raw JSON, no markdown, no backticks.

PROFILE:
Role: ${dna.role}
Industry: ${dna.industry}
City: ${dna.city}
Seniority: ${dna.experience}
Current CTC: ₹${Number(dna.current_salary).toLocaleString('en-IN')}
Target salary: ₹${Number(dna.target_salary).toLocaleString('en-IN')}
Earning gap: ₹${Number(dna.earning_gap).toLocaleString('en-IN')}
Months to close: ${dna.months_to_close}
Career archetype: ${dna.career_archetype}

DIMENSION SCORES (0-100):
Market Alignment: ${dims.market_alignment}
Skill Premium: ${dims.skill_premium}
Visibility: ${dims.visibility}
Mobility: ${dims.mobility}
Negotiation: ${dims.negotiation}

EXISTING RECOMMENDED ACTIONS (build phases around these, don't ignore them):
${immediateActions.map((a: any, i: number) => `${i + 1}. ${a.action} — ${a.impact} (${a.timeline})`).join('\n')}

Return exactly this JSON:
{
  "phases": [
    {
      "title": <string, e.g. "Foundation">,
      "start_month": <number>,
      "end_month": <number>,
      "milestones": [
        {
          "type": "skill" | "visibility" | "application" | "negotiation",
          "title": <string>,
          "description": <string>,
          "why_it_matters": <string, one sentence>,
          "how_to_improve": [<string>, <string>, <string>],
          "linked_dimension": "market_alignment" | "skill_premium" | "visibility" | "mobility" | "negotiation",
          "target_month": <number>
        }
      ]
    }
  ],
  "target_companies": [
    {
      "company_name": <string, real company name for this role+city+industry>,
      "rationale": <string, one sentence>,
      "est_salary_min": <number>,
      "est_salary_max": <number>
    }
  ]
}`

    const aiResult = await callAIJSON(prompt, GrowPathSchema, {
      maxTokens: 3000,
      feature: 'growpath_generate',
      userId: user.id,
    })

    // Supersede any existing active plan before inserting the new one —
    // required by the partial unique index on (user_id) where status = 'active'.
    await supabase
      .from('growpath_plans')
      .update({ status: 'superseded' })
      .eq('user_id', user.id)
      .eq('status', 'active')

    const { data: plan, error: planError } = await supabase
      .from('growpath_plans')
      .insert({
        user_id: user.id,
        grow_dna_id: dna.id,
        months_total: dna.months_to_close ?? 12,
        status: 'active',
      })
      .select('id')
      .single()

    if (planError || !plan) {
      console.error('GrowPath plan insert failed:', planError)
      return Response.json({ error: 'Failed to save plan' }, { status: 500 })
    }

    for (let i = 0; i < aiResult.phases.length; i++) {
      const phase = aiResult.phases[i]
      const { data: savedPhase, error: phaseError } = await supabase
        .from('growpath_phases')
        .insert({
          plan_id: plan.id,
          phase_index: i,
          title: phase.title,
          start_month: phase.start_month,
          end_month: phase.end_month,
        })
        .select('id')
        .single()

      if (phaseError || !savedPhase) {
        console.error('GrowPath phase insert failed:', phaseError)
        continue
      }

      const milestoneRows = phase.milestones.map(m => ({
        phase_id: savedPhase.id,
        type: m.type,
        title: m.title,
        description: m.description,
        why_it_matters: m.why_it_matters,
        how_to_improve: m.how_to_improve,
        linked_dimension: m.linked_dimension,
        target_month: m.target_month,
      }))

      const { error: milestoneError } = await supabase
        .from('growpath_milestones')
        .insert(milestoneRows)

      if (milestoneError) {
        console.error('GrowPath milestone insert failed:', milestoneError)
      }
    }

    if (aiResult.target_companies.length > 0) {
      const companyRows = aiResult.target_companies.map(c => ({
        plan_id: plan.id,
        company_name: c.company_name,
        rationale: c.rationale,
        est_salary_min: c.est_salary_min,
        est_salary_max: c.est_salary_max,
      }))

      const { error: companyError } = await supabase
        .from('growpath_target_companies')
        .insert(companyRows)

      if (companyError) {
        console.error('GrowPath target company insert failed:', companyError)
      }
    }

    return Response.json({
      plan_id: plan.id,
      credits_remaining: credit.balance,
    })

  } catch (err) {
    console.error('GrowPath generate error:', err)
    return Response.json({ error: 'GrowPath generation failed' }, { status: 500 })
  }
}