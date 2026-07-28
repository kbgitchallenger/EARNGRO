// lib/growdna/aiReadiness.ts
//
// A separate score from HRS's 5 dimensions — deliberately. HRS measures
// current market position; AI Readiness measures something genuinely
// different: how prepared someone is for where the market is heading,
// not where it already is. Folding it into HRS would dilute both
// signals and imply "not being AI-fluent yet" is a current-market
// penalty, which isn't an honest framing for most roles today.
//
// Computed from real Competency Platform data — never AI-generated —
// same grounding discipline as skill_premium.

export interface AIReadinessResult {
  score: number          // 0-100
  level: 'Just starting' | 'Building' | 'AI-fluent' | 'AI-native'
  aiSkillCount: number
  avgRating: number
  explanation: string
}

export function calculateAIReadiness(
  competencies: { category: string; rating?: number }[]
): AIReadinessResult {
  const aiSkills = competencies.filter(c => c.category === 'ai_skill')
  const aiSkillCount = aiSkills.length
  const avgRating = aiSkillCount > 0
    ? aiSkills.reduce((sum, s) => sum + (s.rating ?? 3), 0) / aiSkillCount
    : 0

  // Count contributes most (genuine breadth of AI tool/skill exposure),
  // rating adds a smaller boost (depth once breadth exists) — mirrors
  // the same count-plus-rating logic already used for skill_premium.
  const countScore = Math.min(70, aiSkillCount * 25)
  const ratingBoost = aiSkillCount > 0 ? Math.min(30, avgRating * 6) : 0
  const score = Math.min(100, Math.round(countScore + ratingBoost))

  let level: AIReadinessResult['level']
  let explanation: string
  if (score === 0) {
    level = 'Just starting'
    explanation = 'You haven\'t listed any AI-related skills yet — even basic familiarity with tools like ChatGPT or Copilot is increasingly expected across most roles.'
  } else if (score < 40) {
    level = 'Building'
    explanation = `You've listed ${aiSkillCount} AI-related skill${aiSkillCount === 1 ? '' : 's'} — a real start. Deepening this is one of the fastest-moving expectations in most job markets right now.`
  } else if (score < 75) {
    level = 'AI-fluent'
    explanation = `You have real, self-rated AI skill exposure across ${aiSkillCount} area${aiSkillCount === 1 ? '' : 's'} — ahead of most peers, worth highlighting explicitly in interviews and on your resume.`
  } else {
    level = 'AI-native'
    explanation = `Strong, broad AI skill exposure across ${aiSkillCount} areas with high self-rated proficiency — this is a genuine differentiator worth leading with, not burying in a skills list.`
  }

  return { score, level, aiSkillCount, avgRating: Math.round(avgRating * 10) / 10, explanation }
}