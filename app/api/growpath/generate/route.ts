//app/api/growpath/generate/route.ts
// Deterministic GrowPath generator — structures existing grow_dna data
// (immediate_actions, dimension_scores.explanations) into phases and
// milestones. No AI call: GrowDNA already generated specific, measurable
// actions with timelines; this route sequences them rather than
// re-inventing new content, avoiding cost, latency, and the risk of a
// second AI pass contradicting what GrowDNA already told the user.

import { createClient } from '@/lib/supabase/server'

const TYPE_KEYWORDS: Record<string, string[]> = {
  negotiation: ['negotiat', 'salary', 'offer', 'compensation', 'raise'],
  visibility:  ['linkedin', 'network', 'publish', 'speak', 'brand', 'presence', 'content', 'connection', 'visib'],
  application: ['apply', 'companies', 'interview', 'job', 'role', 'target', 'switch'],
}

function classifyType(actionText: string): 'skill' | 'visibility' | 'application' | 'negotiation' {
  const lower = actionText.toLowerCase()
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return type as any
  }
  return 'skill'
}

const TYPE_TO_DIMENSION: Record<string, string> = {
  skill: 'skill_premium',
  visibility: 'visibility',
  application: 'mobility',
  negotiation: 'negotiation',
}

// Parses free-text timelines like "30 days", "6 weeks", "3 months" into a
// month number. Falls back to null if unparseable — caller distributes
// evenly across the plan when this happens, rather than guessing a number.
function parseTimelineToMonth(timeline: string): number | null {
  const m = timeline.toLowerCase().match(/(\d+)\s*(day|week|month)/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  const unit = m[2]
  if (unit === 'day') return Math.max(1, Math.round(n / 30))
  if (unit === 'week') return Math.max(1, Math.round((n * 7) / 30))
  return n
}

function buildPhases(monthsToClose: number) {
  const total = monthsToClose && monthsToClose > 0 ? monthsToClose : 12
  const names = ['Foundation', 'Momentum', 'Breakthrough', 'Sustain']
  const count = total <= 6 ? 2 : total <= 18 ? 3 : 4
  const phases = []
  for (let i = 0; i < count; i++) {
    const start = Math.round((i / count) * total)
    const end = i === count - 1 ? total : Math.round(((i + 1) / count) * total)
    phases.push({ title: names[i], start_month: start, end_month: end, milestones: [] as any[] })
  }
  return phases
}

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

    const immediateActions: { action: string; impact: string; timeline: string }[] =
      dna.raw_ai_response?.immediate_actions ?? dna.close_actions ?? []

    if (immediateActions.length === 0) {
      return Response.json({ error: 'NO_ACTIONS', message: 'Your GrowDNA result has no actions to build a plan from.' }, { status: 400 })
    }

    const explanations = dna.dimension_scores?.explanations ?? {}
    const monthsTotal = dna.months_to_close ?? 12
    const phases = buildPhases(monthsTotal)

    // Distribute actions across phases by parsed or inferred target month
    immediateActions.forEach((a, i) => {
      const type = classifyType(a.action)
      const dimension = TYPE_TO_DIMENSION[type]
      const parsedMonth = parseTimelineToMonth(a.timeline)
      const targetMonth = parsedMonth ?? Math.max(1, Math.round(((i + 1) / immediateActions.length) * monthsTotal))
      const clampedMonth = Math.min(targetMonth, monthsTotal)

      const phase = phases.find(p => clampedMonth > p.start_month && clampedMonth <= p.end_month) ?? phases[phases.length - 1]

      const dimensionNotes: string[] = explanations[dimension] ?? []

      phase.milestones.push({
        type,
        title: a.action,
        description: a.impact,
        why_it_matters: dimensionNotes[0] ?? `Impact: ${a.impact}`,
        how_to_improve: [a.action],
        linked_dimension: dimension,
        target_month: clampedMonth,
      })
    })

    // Drop any empty phases (can happen if all actions land in one window)
    const nonEmptyPhases = phases.filter(p => p.milestones.length > 0)

    const { data: planId, error: rpcError } = await supabase.rpc('save_growpath_plan', {
      p_user_id: user.id,
      p_grow_dna_id: dna.id,
      p_months_total: monthsTotal,
      p_phases: nonEmptyPhases,
      p_target_companies: [], // no AI call for this yet — see note below
    })

    if (rpcError || !planId) {
      console.error('GrowPath atomic save failed:', rpcError)
      return Response.json({ error: 'Failed to save plan' }, { status: 500 })
    }

    return Response.json({ plan_id: planId })

  } catch (err) {
    console.error('GrowPath generate error:', err)
    return Response.json({ error: 'GrowPath generation failed' }, { status: 500 })
  }
}

// Target companies intentionally omitted from this deterministic pass — this
// is the one piece that genuinely needs external market knowledge (real
// companies hiring for this role/city/salary band) that grow_dna doesn't
// contain. Options once the deterministic core is validated:
//   1. A small, separate AI call scoped only to company suggestions
//   2. A static curated list keyed by industry+city, zero AI cost
//   3. Leave the section out of the UI entirely for now