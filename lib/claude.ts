// lib/claude.ts

// ===============================
// TYPES
// ===============================

export interface UserProfile {
  industry: string;
  experience: number;
  role: string;
  city: string;
  salary: number;
  education: string;
  company: string;
  skills: string;
}

export interface DNAAnswers {
  [key: string]: string | number | boolean;
}

export interface QA {
  question: string;
  answer: string;
}

// ===============================
// PERSONA DESCRIPTIONS
// ===============================

export const PERSONA_DESCRIPTIONS: Record<string, string> = {
  hr: "a professional HR interviewer focused on communication and culture fit",
  techLead: "a senior technical lead evaluating problem solving and technical depth",
  founder: "a startup founder looking for ownership mindset and execution ability",
  manager: "a hiring manager assessing leadership and team collaboration",
  consultant: "a strategic consultant evaluating structured thinking and impact",
};

// ===============================
// EARNING GAP PROMPT
// ===============================

export const EARNING_GAP_PROMPT = (profile: UserProfile) => `
You are a senior compensation intelligence analyst for India and 
Southeast Asia, 2025-2026. You have deep knowledge of actual salary 
benchmarks, hiring trends, and career growth patterns.

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
}`;

// ===============================
// GROWDNA PROMPT
// ===============================

export const GROWDNA_PROMPT = (answers: DNAAnswers) => `
You are a career intelligence analyst. Based on these assessment answers,
identify the person's career archetype and earning profile.

ANSWERS: ${JSON.stringify(answers)}

Return ONLY raw JSON:
{
  "archetype": string,
  "archetype_desc": string,
  "top_strengths": [string, string, string],
  "growth_areas": [string, string, string],
  "earning_personality": string,
  "recommended_roles": [string, string, string, string, string],
  "market_demand": string,
  "six_month_goal": string
}`;

// ===============================
// INTERVIEW QUESTION PROMPT
// ===============================

export const INTERVIEW_QUESTION_PROMPT = (
  persona: string,
  role: string,
  questionNum: number,
  previousQA: QA[]
) => `
You are ${PERSONA_DESCRIPTIONS[persona]}.
You are interviewing a candidate for: ${role}
This is question ${questionNum} of 8.

Previous questions asked: ${previousQA
  .map((qa) => qa.question)
  .join(', ')}

Ask ONE new, relevant interview question for this role.
Do NOT repeat previous questions.
Stay completely in character as ${persona}.
Return ONLY the question text — nothing else.`;

// ===============================
// INTERVIEW EVALUATION PROMPT
// ===============================

export const INTERVIEW_EVAL_PROMPT = (
  question: string,
  answer: string,
  role: string,
  persona: string
) => `
You are evaluating an interview answer for a ${role} position.

QUESTION: ${question}
CANDIDATE ANSWER: ${answer}
INTERVIEWER PERSONA: ${persona}

Return ONLY raw JSON:
{
  "score": number,
  "star_method_used": boolean,
  "clarity": number,
  "relevance": number,
  "confidence_signals": number,
  "in_character_response": string,
  "model_answer": string,
  "improvement_tip": string
}`;

// ===============================
// ATS SCORE PROMPT
// ===============================

export const ATS_SCORE_PROMPT = (
  cv: string,
  jobDescription: string
) => `
You are an ATS (Applicant Tracking System) expert and HR consultant.

Analyse this CV against this job description and return ONLY raw JSON:

CV CONTENT:
${cv}

JOB DESCRIPTION:
${jobDescription}

Return:
{
  "ats_score": number,
  "matched_keywords": [string],
  "missing_keywords": [string],
  "weak_sections": [string],
  "strong_sections": [string],
  "improvements": [
    {
      "section": string,
      "current": string,
      "improved": string
    }
  ],
  "summary": string
}`;