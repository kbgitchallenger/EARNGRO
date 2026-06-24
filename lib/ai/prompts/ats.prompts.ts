import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

// ────────────────────────────────────────────────────────────────
// FULL ATS ANALYSIS PROMPT
// Comprehensive ATS + recruiter + market intelligence scoring
// ────────────────────────────────────────────────────────────────

export const ATS_SCORE_PROMPT = (
  resumeText: string,
  jobDescription?: string | null,
  jobTitle?: string | null
): string => `

You are an elite ATS and recruiter intelligence engine specialised in:
- India hiring market
- Southeast Asia hiring market
- Remote-first hiring ecosystem
- SaaS and technology hiring
- Product, engineering, growth, operations, and leadership hiring
- 2026-2027 recruitment standards

Your job is to analyse this resume exactly like:
1. ATS software
2. Human recruiter
3. Hiring manager
4. Market intelligence system

Return ONLY valid raw JSON.
NO markdown.
NO backticks.
NO explanation.

==================================================
RESUME
==================================================

${resumeText.slice(0, 4500)}

==================================================
TARGET ROLE
==================================================

${jobTitle ?? 'General market fit analysis'}

==================================================
JOB DESCRIPTION
==================================================

${
  jobDescription
    ? jobDescription.slice(0, 2000)
    : 'No specific job description provided. Analyse for overall market competitiveness.'
}

==================================================
RETURN EXACTLY THIS JSON STRUCTURE (valid example)
==================================================

{
  "ats_score": 75,
  "recruiter_score": 78,
  "market_alignment": 82,
  "hiring_probability": 80,
  "keyword_matches": [
    {"keyword": "React", "found": true, "weight": "critical"},
    {"keyword": "TypeScript", "found": true, "weight": "high"}
  ],
  "keyword_gaps": ["Python", "AWS"],
  "section_scores": {
    "summary": 70,
    "experience": 85,
    "skills": 80,
    "education": 75,
    "formatting": 90,
    "achievements": 82
  },
  "strengths": ["5+ years experience", "Strong technical skills"],
  "critical_issues": ["Weak summary section"],
  "improvements": [
    {"section": "summary", "current": "Experienced engineer", "improved": "Senior React engineer with 5+ years building scalable web apps at tech companies"},
    {"section": "skills", "current": "List format", "improved": "Organized by category with proficiency levels"}
  ],
  "ai_summary": "Strong candidate with solid experience and modern tech stack."
}

==================================================
SCORING RULES
==================================================

- Most resumes should score between 40-70
- Be harsh but fair
- Avoid inflated scores
- Evaluate ATS compatibility realistically
- Consider current India + SEA hiring trends
- Penalize vague resumes
- Reward quantified achievements
- Reward modern tech stack relevance
- Reward clarity and structure
- Penalize keyword stuffing
- Penalize weak formatting
- Penalize generic summaries

section_scores.achievements specifically:
- Score 0-30 if the resume has no quantified, measurable outcomes anywhere
- Score 40-60 if some metrics exist but impact is vague or not tied to a clear action
- Score 70-100 if there are strong, specific business-impact numbers (₹ amounts, percentages, scale, before/after) clearly tied to what the person did
- Never default this to 0 — actively search experience bullets for numbers, percentages, currency amounts, and scale indicators before scoring
==================================================
KEYWORD MATCH RULES
==================================================

- Include top 10-15 most important keywords
- Include technical skills
- Include role-specific terms
- Include business/domain keywords
- Include certifications/tools/frameworks
- Weight values allowed:
  - critical
  - high
  - medium
  - low

==================================================
IMPROVEMENT RULES
==================================================

- Maximum 5 improvements
- Must be specific
- Must be actionable
- Must improve ATS ranking
- Must improve recruiter readability

==================================================
IMPORTANT - JSON FORMATTING RULES
==================================================

1. Return ONLY raw JSON
2. No markdown code blocks
3. No backticks
4. No trailing commas
5. Properly escape all strings with backslashes for special characters
6. Ensure all arrays and objects are properly closed
7. No comments in JSON
8. Start with { and end with }

Output ONLY valid JSON.
No markdown.
No explanation.
No additional text.

`

// ────────────────────────────────────────────────────────────────
// QUICK ATS SCORE PROMPT
// Fast lightweight score on upload
// ────────────────────────────────────────────────────────────────

export const QUICK_SCORE_PROMPT = (
  resumeText: string
): string => `

You are a fast ATS scoring engine.

Analyse this resume quickly and return ONLY valid raw JSON.

==================================================
RESUME
==================================================

${resumeText.slice(0, 2200)}

==================================================
RETURN EXACTLY
==================================================

{
  "ats_score": <number 0-100>,

  "top_issues": [
    "issue 1",
    "issue 2",
    "issue 3"
  ],

  "top_strengths": [
    "strength 1",
    "strength 2"
  ]
}

==================================================
RULES
==================================================

- Be concise
- Be realistic
- Most resumes should score 40-70
- Focus on ATS compatibility
- Focus on recruiter readability
- Return ONLY JSON

`

// ────────────────────────────────────────────────────────────────
// JD KEYWORD EXTRACTION
// Extracts structured hiring requirements
// ────────────────────────────────────────────────────────────────

export const EXTRACT_JD_KEYWORDS_PROMPT = (
  jobDescription: string
): string => `

You are a recruiter intelligence engine.

Extract the most important hiring signals from this job description.

Return ONLY valid JSON.

==================================================
JOB DESCRIPTION
==================================================

${jobDescription.slice(0, 3000)}

==================================================
RETURN EXACTLY
==================================================

{
  "must_have": ["string"],
  "good_to_have": ["string"],
  "role_keywords": ["string"],
  "tech_stack": ["string"],
  "soft_skills": ["string"]
}

==================================================
RULES
==================================================

- Extract realistic recruiter signals
- Include frameworks/tools/platforms
- Include business keywords
- Include hiring intent keywords
- Return ONLY JSON

`

// ────────────────────────────────────────────────────────────────
// VERSION COMPARISON PROMPT
// Compare resume evolution
// ────────────────────────────────────────────────────────────────

export const COMPARE_VERSIONS_PROMPT = (
  oldResume: string,
  newResume: string,
  oldScore: number,
  newScore: number
): string => `

You are an expert recruiter intelligence system.

Compare these two resume versions and analyse:
- ATS improvements
- recruiter readability improvements
- keyword optimization
- impact improvements
- market positioning improvements

Return ONLY valid JSON.

==================================================
OLD RESUME
==================================================

${oldResume.slice(0, 2500)}

OLD ATS SCORE:
${oldScore}

==================================================
NEW RESUME
==================================================

${newResume.slice(0, 2500)}

NEW ATS SCORE:
${newScore}

==================================================
RETURN EXACTLY
==================================================

{
  "improvement_score": <number>,
  "summary": "string",

  "improved_areas": [
    "string"
  ],

  "remaining_gaps": [
    "string"
  ],

  "ats_impact": "string",

  "recruiter_impact": "string"
}

==================================================
RULES
==================================================

- Be realistic
- Focus on actual improvement quality
- Focus on hiring outcomes
- Return ONLY JSON

`