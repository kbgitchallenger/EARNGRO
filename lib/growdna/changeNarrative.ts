interface DimensionScores {
  market_alignment: number
  skill_premium: number
  visibility: number
  mobility: number
  negotiation: number
}

interface AttemptForNarrative {
  hrs_score: number
  earning_gap: number
  dimension_scores: DimensionScores
}

const DIMENSION_LABELS: Record<keyof DimensionScores, string> = {
  market_alignment: 'Market Alignment',
  skill_premium:    'Skill Premium',
  visibility:       'Visibility',
  mobility:         'Career Mobility',
  negotiation:      'Negotiation',
}

const DIMENSION_NEXT_STEP: Record<keyof DimensionScores, string> = {
  market_alignment: 'Your market alignment is still the area with the most room — a role or location shift would move this fastest.',
  skill_premium:    'Skill premium is still your biggest open lever — one focused certification or differentiator would move this fastest.',
  visibility:       'Visibility is still your quietest dimension — even one public-facing moment would start shifting this.',
  mobility:         'Career mobility is still flat — a deliberate move, internal or external, is what typically unlocks this next.',
  negotiation:      'Negotiation is still your most controllable lever — even one conversation at your next review would move this.',
}

function fmtMoney(n: number): string {
  const v = Math.round(Math.abs(n))
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + 'Cr'
  if (v >= 100000)   return '₹' + (v / 100000).toFixed(1) + 'L'
  return '₹' + v.toLocaleString('en-IN')
}

export interface ChangeNarrative {
  headline: string
  nextStep: string
  isCelebration: boolean
  standingLine?: string
}

function getStandingLine(dim: keyof DimensionScores, score: number): string {
  const label = DIMENSION_LABELS[dim]
  if (score >= 80) return `That puts your ${label} in the strongest band we track — well above where most profiles sit.`
  if (score >= 60) return `That puts your ${label} solidly above average for your profile type.`
  if (score >= 40) return `That's real progress on ${label} — you're closing in on the stronger band.`
  return `Every point on ${label} compounds — this is meaningful early movement.`
}

export function getChangeNarrative(
  latest: AttemptForNarrative,
  prev: AttemptForNarrative
): ChangeNarrative | null {
  const dims = Object.keys(DIMENSION_LABELS) as (keyof DimensionScores)[]

  // Find the single biggest dimension mover
  let biggestDim: keyof DimensionScores | null = null
  let biggestDelta = 0
  for (const d of dims) {
    const delta = (latest.dimension_scores?.[d] ?? 0) - (prev.dimension_scores?.[d] ?? 0)
    if (Math.abs(delta) > Math.abs(biggestDelta)) {
      biggestDelta = delta
      biggestDim = d
    }
  }

  const hrsDelta = latest.hrs_score - prev.hrs_score
  const hrsDeltaPct = prev.hrs_score > 0 ? (hrsDelta / 1000) * 100 : 0 // % of full 0-1000 scale

  const gapDelta = prev.earning_gap - latest.earning_gap // positive = gap shrank, good
  const gapDeltaPct = prev.earning_gap > 0 ? (Math.abs(gapDelta) / prev.earning_gap) * 100 : 0

  const dimensionMeaningful = biggestDim !== null && Math.abs(biggestDelta) >= 10
  const hrsMeaningful = Math.abs(hrsDeltaPct) >= 5
  const gapMeaningful = gapDeltaPct >= 5

  // Priority: gap closing > HRS movement > single dimension movement
  // (gap closing is the headline metric of the whole product)

  if (gapMeaningful && gapDelta > 0) {
    return {
      headline: `Your Earning Gap closed by ${fmtMoney(gapDelta)} since your last check-in — real movement.`,
      nextStep: biggestDim
        ? DIMENSION_NEXT_STEP[biggestDim]
        : 'Keep the momentum — another assessment in a few weeks will show if this trend holds.',
      isCelebration: true,
      standingLine: biggestDim ? getStandingLine(biggestDim, latest.dimension_scores[biggestDim]) : undefined,
    }
  }

  if (gapMeaningful && gapDelta < 0) {
    return {
      headline: `Your Earning Gap widened by ${fmtMoney(Math.abs(gapDelta))} since your last check-in — worth a closer look.`,
      nextStep: biggestDim
        ? DIMENSION_NEXT_STEP[biggestDim]
        : 'Markets shift — this is a good moment to revisit your GrowPath actions.',
      isCelebration: false,
    }
  }

  if (hrsMeaningful) {
    const direction = hrsDelta > 0 ? 'climbed' : 'dipped'
    return {
      headline: `Your Hiring Readiness Score ${direction} ${Math.abs(Math.round(hrsDelta))} points since your last check-in${biggestDim ? ` — ${DIMENSION_LABELS[biggestDim]} moved the most` : ''}.`,
      nextStep: biggestDim ? DIMENSION_NEXT_STEP[biggestDim] : 'Keep checking in to track what\'s driving this.',
      isCelebration: hrsDelta > 0,
      standingLine: hrsDelta > 0 && biggestDim ? getStandingLine(biggestDim, latest.dimension_scores[biggestDim]) : undefined,
    }
  }

  if (dimensionMeaningful && biggestDim) {
    const direction = biggestDelta > 0 ? 'up' : 'down'
    return {
      headline: `Your ${DIMENSION_LABELS[biggestDim]} moved ${direction} ${Math.abs(Math.round(biggestDelta))} points since your last check-in — the biggest shift in your profile.`,
      nextStep: DIMENSION_NEXT_STEP[biggestDim],
      isCelebration: biggestDelta > 0,
      standingLine: biggestDelta > 0 ? getStandingLine(biggestDim, latest.dimension_scores[biggestDim]) : undefined,
    }
  }

  // Nothing crossed the threshold — stay silent, as designed.
  return null
}