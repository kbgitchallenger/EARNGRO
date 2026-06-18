import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

export const RESUME_NORMALIZE_PROMPT = (rawText: string): string => `
You are a professional resume parser. Extract structured data from this resume text.
Return ONLY raw JSON — no markdown, no backticks, no explanation.

RESUME TEXT:
${rawText}

Return exactly this JSON structure:
{
  "name": "string — full name",
  "email": "string or omit if not found",
  "phone": "string or omit if not found",
  "location": "string — city/country or omit",
  "summary": "string — professional summary or omit",
  "primary_role": "string — the candidate's main/most recent job title or professional identity",
  "seniority_level": "one of: fresher, junior, mid, senior, leadership",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "start_date": "string — e.g. Jan 2020",
      "end_date": "string or omit if current",
      "is_current": true or false,
      "bullets": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string or omit"
    }
  ],
  "skills": ["skill1", "skill2"],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing body or omit",
      "year": "year or omit"
    }
  ],
  "total_experience_years": number
}

Rules:
- seniority_level MUST be exactly one of these five strings: "fresher", "junior", "mid", "senior", "leadership" — no other values, no capitalization changes, no synonyms
- seniority_level guide: 0 years = fresher, 1-3 years = junior, 3-7 years = mid, 7-15 years = senior, 15+ years or people-management scope = leadership
- primary_role is required — infer it from the most recent/relevant experience entry if not explicitly stated as a title
- Extract ALL experience entries, even short ones
- Preserve bullet points as individual array items
- total_experience_years should be a realistic number based on dates
- certifications is an array of objects, never strings
- If a field is not found, omit it entirely rather than returning null (primary_role and seniority_level are the only fields that must always be present)
`

export const MARKET_POSITIONING_PROMPT = (
  parsed: ParsedResume,
  city: string
): string => `
You are a senior career intelligence analyst for India and Southeast Asia.
Analyse this candidate profile and return ONLY raw JSON — no markdown, no backticks.

CANDIDATE PROFILE:
Name: ${parsed.name}
Location: ${city}
Experience: ${parsed.total_experience_years} years
Recent role: ${parsed.experience?.[0]?.role ?? 'Not specified'} at ${parsed.experience?.[0]?.company ?? 'Not specified'}
Skills: ${parsed.skills?.slice(0, 15).join(', ')}
Education: ${parsed.education?.[0]?.degree ?? 'Not specified'} from ${parsed.education?.[0]?.institution ?? 'Not specified'}
Certifications: ${parsed.certifications?.map(c => c.name).join(', ') || 'None listed'}

Return exactly this JSON:
{
  "headline": "string — punchy professional headline for this candidate",
  "value_proposition": "string — 2 sentence unique value proposition",
  "target_roles": ["role 1", "role 2", "role 3"],
  "target_industries": ["industry 1", "industry 2"],
  "key_differentiators": ["differentiator 1", "differentiator 2", "differentiator 3"],
  "salary_range_min": number in INR,
  "salary_range_max": number in INR,
  "market_readiness_score": number 0-100
}
`

export const BULLET_OPTIMIZE_PROMPT = (
  bullet: string,
  role: string,
  industry: string
): string => `
You are an expert resume writer for India and Southeast Asia job market.
Optimise this resume bullet point for a ${role} role in ${industry}.
Return ONLY raw JSON — no markdown, no backticks.

ORIGINAL BULLET:
${bullet}

Return exactly this JSON:
{
  "original": "${bullet.replace(/"/g, '\\"')}",
  "optimized": "string — improved bullet with strong action verb, quantification where possible, and clear impact",
  "improvement_reason": "string — one sentence explaining what was improved",
  "impact_score": number 1-10
}
`

export const RESUME_COMPARE_PROMPT = (
  v1: ParsedResume,
  v2: ParsedResume
): string => `
Compare these two resume versions for the same candidate.
Return ONLY raw JSON — no markdown, no backticks.

VERSION 1 (older):
Skills: ${v1.skills?.join(', ')}
Experience count: ${v1.experience?.length ?? 0} roles
Certifications: ${v1.certifications?.map(c => c.name).join(', ') || 'none'}
Total years: ${v1.total_experience_years}

VERSION 2 (newer):
Skills: ${v2.skills?.join(', ')}
Experience count: ${v2.experience?.length ?? 0} roles
Certifications: ${v2.certifications?.map(c => c.name).join(', ') || 'none'}
Total years: ${v2.total_experience_years}

Return exactly this JSON:
{
  "improvements": ["string — what improved"],
  "regressions": ["string — what got worse or was removed"],
  "net_change": "positive" | "negative" | "neutral",
  "recommendation": "string — one actionable recommendation",
  "score_delta": number positive or negative
}
`