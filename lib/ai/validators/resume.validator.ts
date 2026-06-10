import { z } from 'zod'

export const KeywordMatchSchema = z.object({
  keyword: z.string(),
  found: z.boolean(),
  weight: z.enum(['critical', 'high', 'medium', 'low']),
  context: z.string().optional().nullable(),
})

export const SectionScoresSchema = z.object({
  summary:     z.number().min(0).max(100),
  experience:  z.number().min(0).max(100),
  skills:      z.number().min(0).max(100),
  education:   z.number().min(0).max(100),
  formatting:  z.number().min(0).max(100),
  achievements: z.number().min(0).max(100).optional().default(0),
})

export const ImprovementSchema = z.object({
  section:  z.string(),
  issue:    z.string().optional(),
  current:  z.string(),
  improved: z.string(),
  impact:   z.enum(['high', 'medium', 'low']).optional(),
})

export const ATSResultSchema = z.object({
  ats_score:           z.number().min(0).max(100),
  recruiter_score:     z.number().min(0).max(100),
  market_alignment:    z.number().min(0).max(100),
  hiring_probability:  z.number().min(0).max(100),
  keyword_matches:     z.array(KeywordMatchSchema),
  keyword_gaps:        z.array(z.string()),
  section_scores:      SectionScoresSchema,
  strengths:           z.array(z.string()).max(5),
  critical_issues:     z.array(z.string()).max(5),
  improvements:        z.array(ImprovementSchema).max(5),
  ai_summary:          z.string(),
  recruiter_first_impression: z.string().optional(),
  ats_pass_likelihood: z.enum(['very_high','high','medium','low','very_low']).optional(),
})

export const VersionComparisonSchema = z.object({
  score_delta:        z.number(),
  ats_delta:          z.number(),
  recruiter_delta:    z.number(),
  improvements_made:  z.array(z.string()),
  regressions:        z.array(z.string()),
  verdict:            z.enum(['significantly_better','better','same','worse']),
  recommendation:     z.string(),
})

export const QuickScoreSchema = z.object({
  ats_score:    z.number().min(0).max(100),
  market_score: z.number().min(0).max(100),
  top_issue:    z.string(),
  top_strength: z.string(),
})

export type ATSResult          = z.infer<typeof ATSResultSchema>
export type KeywordMatch       = z.infer<typeof KeywordMatchSchema>
export type SectionScores      = z.infer<typeof SectionScoresSchema>
export type Improvement        = z.infer<typeof ImprovementSchema>
export type VersionComparison  = z.infer<typeof VersionComparisonSchema>
export type QuickScore         = z.infer<typeof QuickScoreSchema>