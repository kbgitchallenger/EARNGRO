// ── GrowDNA Analysis Prompt ───────────────────────────────────────

export const GROWDNA_ANALYSIS_PROMPT = (
  answers: Record<string, unknown>,
  scores: Record<string, number>,
  archetypeName: string
) => `
You are a senior compensation intelligence analyst for India and Southeast Asia, 2026–2027.

Analyse this career profile from a GrowDNA assessment and return ONLY raw JSON.

PROFILE:
Industry: ${answers.industry}
Seniority: ${answers.seniority}
Role: ${answers.role}
City: ${answers.city}
Current Annual CTC: ₹${Number(answers.current_ctc).toLocaleString('en-IN')}
Negotiation history: ${answers.negotiation_history}
Growth investment level: ${answers.growth_investment ?? 0} out of 5
Career archetype detected: ${archetypeName}

DIMENSION SCORES (0-100):
Market Alignment: ${scores.market_alignment}
Skill Premium: ${scores.skill_premium}
Visibility: ${scores.visibility}
Mobility: ${scores.mobility}
Negotiation: ${scores.negotiation}
HRS: ${scores.hrs} / 1000

Return exactly this JSON:
{
  "target_salary": number,
  "salary_range_min": number,
  "salary_range_max": number,
  "earning_gap_estimate": number,
  "gap_percentage": number,
  "months_to_close": number,
  "archetype_desc": string,
  "top_strengths": [string, string, string],
  "critical_gaps": [string, string, string],
  "immediate_actions": [
    {"action": string, "impact": string, "timeline": string},
    {"action": string, "impact": string, "timeline": string},
    {"action": string, "impact": string, "timeline": string}
  ],
  "market_insight": string,
  "peer_comparison": string
}

Rules:
- Realistic salaries — not inflated
- Tier 2 cities: 20–30% below metro
- Government/PSU: acknowledge gap, note security trade-off
- Freshers: modest gap, focus on trajectory
- top_strengths and critical_gaps must be specific to this profile
- immediate_actions must name actual platforms, certs, or company types
`.trim()

// ── Earning Gap Calculator Prompt ─────────────────────────────────

export const EARNING_GAP_PROMPT = (profile: {
  industry: string
  experience: string
  role: string
  city: string
  salary: number
  education: string
  company: string
  skills: string
}) => `
You are a senior compensation intelligence analyst for India and Southeast Asia, 2025–2026.
Analyse this profile and return ONLY raw JSON — no markdown, no explanation.

PROFILE:
Industry: ${profile.industry}
Experience: ${profile.experience}
Role: ${profile.role}
City: ${profile.city}
Current Annual CTC: ₹${profile.salary.toLocaleString('en-IN')}
Education: ${profile.education}
Employer Type: ${profile.company}
Skills: ${profile.skills}

Return exactly:
{
  "target_salary": number,
  "salary_range_min": number,
  "salary_range_max": number,
  "gap_amount": number,
  "gap_percentage": number,
  "months_to_close": number,
  "hiring_readiness_score": number,
  "gap_percentile": string,
  "market_context": string,
  "data_source_note": string,
  "gap_reasons": [string, string, string],
  "close_actions": [string, string, string]
}
`.trim()