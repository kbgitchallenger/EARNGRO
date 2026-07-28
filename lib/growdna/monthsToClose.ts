// lib/growdna/monthsToClose.ts
//
// Replaces the AI's free-form "months_to_close: 4-36 range" guess with a
// real, deterministic, explainable formula — same profile always produces
// the same number, and the number can be broken down into two honest
// phases instead of one opaque figure.
//
// Phase 1 (readiness prep) scales with current HRS and, when a prior
// assessment exists, with real trajectory — someone actively improving
// closes their prep phase faster than someone stagnant, which is the
// concrete fix for "why did my number go up when I'm doing better?"
//
// Phase 2 (search/negotiation execution) is treated as a real-world
// market constant — an active job search realistically takes a similar
// number of months regardless of how fast someone's HRS is moving; it
// scales modestly with gap size (bigger gap → more selective, targeted
// search), not with readiness.
//
// These specific constants (3/6 month prep bounds, 2-5 month search
// bounds) are a reasonable starting calibration, not a validated model —
// worth revisiting once real completion-time data exists to check
// against actual user outcomes.

export interface MonthsToCloseResult {
  total: number
  prepMonths: number
  searchMonths: number
  explanation: string
}

export function calculateMonthsToClose(params: {
  gapPercentage: number   // gap as % of current salary, e.g. 42 for a 42% gap
  hrsScore: number
  prevHrsScore?: number | null
}): MonthsToCloseResult {
  const { gapPercentage, hrsScore, prevHrsScore } = params

  // ── Phase 1: readiness prep ──
  let prepMonths: number
  if (hrsScore >= 700) {
    prepMonths = 0
  } else if (hrsScore >= 400) {
    const t = (hrsScore - 400) / (699 - 400) // 0 at HRS 400, 1 at HRS 699
    prepMonths = Math.round(3 - t * 2) // scales 3 down to 1
  } else {
    const t = Math.max(0, hrsScore) / 400
    prepMonths = Math.round(6 - t * 3) // scales 6 down to 3
  }

  // Trajectory adjustment — only affects prep, since a real job search's
  // calendar length doesn't shorten just because someone's HRS is moving
  // fast; only how much MORE prep they still need does.
  if (prevHrsScore != null) {
    const delta = hrsScore - prevHrsScore
    if (delta >= 50) prepMonths = Math.round(prepMonths * 0.85)
    else if (delta >= 1) prepMonths = Math.round(prepMonths * 0.95)
    else prepMonths = Math.round(prepMonths * 1.1)
  }
  prepMonths = Math.max(0, prepMonths)

  // ── Phase 2: realistic search/negotiation execution ──
  let searchMonths: number
  if (gapPercentage < 15) searchMonths = 2
  else if (gapPercentage < 40) searchMonths = 3
  else if (gapPercentage < 75) searchMonths = 4
  else searchMonths = 5

  const total = Math.max(3, Math.min(36, prepMonths + searchMonths))

  const explanation = prepMonths > 0
    ? `${prepMonths} month${prepMonths === 1 ? '' : 's'} to strengthen your readiness (HRS ${hrsScore}), plus ${searchMonths} month${searchMonths === 1 ? '' : 's'} for a realistic search and negotiation cycle.`
    : `You're already market-ready (HRS ${hrsScore}) — ${searchMonths} month${searchMonths === 1 ? '' : 's'} reflects a realistic search and negotiation cycle.`

  return { total, prepMonths, searchMonths, explanation }
}