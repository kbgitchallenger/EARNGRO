import { z } from 'zod'

// ── Certification as object (not string) ─────────────────────────
export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  year: z.string().optional(),
})

// ── Parsed resume structure ───────────────────────────────────────
export const ParsedResumeSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  primary_role: z.string().optional(),
  seniority_level: z.string().optional(),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    start_date: z.string(),
    end_date: z.string().optional(),
    bullets: z.array(z.string()),
    is_current: z.boolean().default(false),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    year: z.string().optional(),
  })),
  skills: z.array(z.string()),
  certifications: z.array(CertificationSchema).optional(),  // ← object, not string
  total_experience_years: z.number(),
})

// ── ATS result ────────────────────────────────────────────────────
export const ATSResultSchema = z.object({
  ats_score: z.number().min(0).max(100),
  recruiter_score: z.number().min(0).max(100),
  market_alignment: z.number().min(0).max(100),
  hiring_probability: z.number().min(0).max(100),
  keyword_matches: z.array(z.object({
    keyword: z.string(),
    found: z.boolean(),
    weight: z.enum(['critical', 'high', 'medium', 'low']),
  })),
  section_scores: z.object({
    summary: z.number(),
    experience: z.number(),
    skills: z.number(),
    education: z.number(),
    formatting: z.number(),
  }),
  strengths: z.array(z.string()).max(5),
  critical_issues: z.array(z.string()).max(5),
  improvements: z.array(z.object({
    section: z.string(),
    current: z.string(),
    improved: z.string(),
  })).max(5),
  ai_summary: z.string(),
})

// ── Market positioning ────────────────────────────────────────────
export const MarketPositioningSchema = z.object({
  headline: z.string(),
  value_proposition: z.string(),
  target_roles: z.array(z.string()),
  target_industries: z.array(z.string()),
  key_differentiators: z.array(z.string()),
  salary_range_min: z.number().optional(),
  salary_range_max: z.number().optional(),
  market_readiness_score: z.number().min(0).max(100), // ← correct field name
})

// ── Bullet optimisation ───────────────────────────────────────────
export const BulletOptimizationSchema = z.object({
  original: z.string(),
  optimized: z.string(),
  improvement_reason: z.string(),
  impact_score: z.number().min(1).max(10),
})

// ── Type exports ──────────────────────────────────────────────────
export type ParsedResume        = z.infer<typeof ParsedResumeSchema>
export type ATSResult           = z.infer<typeof ATSResultSchema>
export type MarketPositioning   = z.infer<typeof MarketPositioningSchema>
export type Certification       = z.infer<typeof CertificationSchema>
export type BulletOptimization  = z.infer<typeof BulletOptimizationSchema>