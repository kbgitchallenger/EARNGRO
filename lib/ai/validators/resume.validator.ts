// lib/ai/validators/resume.validator.ts

import { z } from 'zod'

export const ParsedResumeSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
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
  certifications: z.array(z.string()).optional(),
  total_experience_years: z.number(),
})

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

export type ParsedResume = z.infer<typeof ParsedResumeSchema>
export type ATSResult = z.infer<typeof ATSResultSchema>