import { ANSWER_EXPLANATIONS, SENIORITY_MOBILITY_NOTE } from './explanations'

export interface DimensionExplanation {
  dimension: string
  notes: string[]
}

const QUESTION_IDS_BY_DIMENSION: Record<string, string[]> = {
  market_alignment: ['industry', 'city'],
  skill_premium:    ['internship_quality', 'certifications_fresher', 'premium_skills'],
  visibility:       ['external_visibility'],
  mobility:         ['promotion_velocity'],
  negotiation:      ['negotiation_history'],
}

export function getDimensionExplanations(
  answers: Record<string, string | string[] | number>
): Record<string, string[]> {
  const result: Record<string, string[]> = {
    market_alignment: [],
    skill_premium: [],
    visibility: [],
    mobility: [],
    negotiation: [],
  }

  for (const [dimension, questionIds] of Object.entries(QUESTION_IDS_BY_DIMENSION)) {
    for (const qid of questionIds) {
      const answer = answers[qid]
      if (!answer) continue

      // Handle multiselect (array) — show explanation for each selected option
      if (Array.isArray(answer)) {
        for (const val of answer) {
          const key = `${qid}.${val}`
          const explanation = ANSWER_EXPLANATIONS[key]
          if (explanation) result[dimension].push(explanation.text)
        }
      } else {
        const key = `${qid}.${answer}`
        const explanation = ANSWER_EXPLANATIONS[key]
        if (explanation) result[dimension].push(explanation.text)
      }
    }
  }

  // Mobility fallback for fresher/junior (no promotion_velocity question exists for them)
  if (result.mobility.length === 0 && answers.seniority) {
    const note = SENIORITY_MOBILITY_NOTE[answers.seniority as string]
    if (note) result.mobility.push(note)
  }

  return result
}