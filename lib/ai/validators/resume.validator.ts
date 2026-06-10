import { z } from 'zod'

export const ExperienceEntrySchema = z.object({
  company:      z.string(),
  role:         z.string(),
  start_date:   z.string(),
  end_date:     z.string().optional().nullable(),
  is_current:   z.boolean().default(false),
  bullets:      z.array(z.string()),
  location:     z.string().optional().nullable(),
  achievements: z.array(z.string()).optional().default([]),
})

export const EducationEntrySchema = z.object({
  institution: z.string(),
  degree:      z.string(),
  field:       z.string().optional().nullable(),
  year:        z.string().optional().nullable(),
  grade:       z.string().optional().nullable(),
})

export const CertificationSchema = z.object({
  name:   z.string(),
  issuer: z.string().optional().nullable(),
  year:   z.string().optional().nullable(),
})

export const ParsedResumeSchema = z.object({
  name:                   z.string(),
  email:                  z.string().optional().nullable(),
  phone:                  z.string().optional().nullable(),
  location:               z.string().optional().nullable(),
  linkedin:               z.string().optional().nullable(),
  github:                 z.string().optional().nullable(),
  portfolio:              z.string().optional().nullable(),
  summary:                z.string().optional().nullable(),
  experience:             z.array(ExperienceEntrySchema),
  education:              z.array(EducationEntrySchema),
  skills:                 z.array(z.string()),
  certifications:         z.array(CertificationSchema).optional().default([]),
  languages:              z.array(z.string()).optional().default([]),
  total_experience_years: z.number().min(0),
  seniority_level:        z.enum(['fresher', 'junior', 'mid', 'senior', 'leadership']),
  primary_role:           z.string(),
  industry_signals:       z.array(z.string()).optional().default([]),
})

export const OptimizedBulletSchema = z.object({
  original:         z.string(),
  optimized:        z.string(),
  improvement_type: z.enum(['quantified', 'action_verb', 'impact_added', 'concise', 'keyword_added']),
  explanation:      z.string(),
})

export const BulletOptimizationResultSchema = z.object({
  bullets:             z.array(OptimizedBulletSchema),
  overall_improvement: z.string(),
})

export const MarketPositioningSchema = z.object({
  market_score:          z.number().min(0).max(100),
  positioning_statement: z.string(),
  target_roles:          z.array(z.string()).max(5),
  salary_range_min:      z.number(),
  salary_range_max:      z.number(),
  key_differentiators:   z.array(z.string()).max(4),
  market_gaps:           z.array(z.string()).max(4),
})

export type ParsedResume             = z.infer<typeof ParsedResumeSchema>
export type ExperienceEntry          = z.infer<typeof ExperienceEntrySchema>
export type EducationEntry           = z.infer<typeof EducationEntrySchema>
export type OptimizedBullet          = z.infer<typeof OptimizedBulletSchema>
export type BulletOptimizationResult = z.infer<typeof BulletOptimizationResultSchema>
export type MarketPositioning        = z.infer<typeof MarketPositioningSchema>