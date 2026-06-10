import type { ATSResult as ATSScore } from '../lib/ai/validators/ats.validator'
import type { ParsedResume } from '../lib/ai/validators/resume.validator'
import type { ATSResult } from '../lib/ai/validators/ats.validator'
// ── Database row types ────────────────────────────────────────────

export interface CVVersion {
  id: string
  user_id: string
  version_number: number
  name: string | null
  source: 'upload' | 'builder' | 'ai_optimized'
  file_url: string | null
  file_name: string | null
  file_size: number | null
  raw_text: string | null
  parsed_data: ParsedResume | null
  template: string
  is_primary: boolean
  market_score: number | null
  created_at: string
  updated_at: string
}

export interface CVAnalysis {
  id: string
  cv_version_id: string
  user_id: string
  job_description: string | null
  job_title: string | null
  company_name: string | null
  ats_score: number | null
  recruiter_score: number | null
  market_alignment: number | null
  hiring_probability: number | null
  keyword_matches: ATSScore['keyword_matches'] | null
  keyword_gaps: string[] | null
  section_scores: ATSScore['section_scores'] | null
  strengths: string[] | null
  critical_issues: string[] | null
  improvements: ATSScore['improvements'] | null
  ai_summary: string | null
  processing_status: 'pending' | 'processing' | 'complete' | 'failed'
  created_at: string
}

export interface CVParseJob {
  id: string
  cv_version_id: string
  user_id: string
  status: 'queued' | 'parsing' | 'normalizing' | 'complete' | 'failed'
  parse_method: 'pdf' | 'docx' | 'ocr' | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// ── DTO types (for creates/updates) ──────────────────────────────

export interface CreateCVVersionDTO {
  user_id: string
  version_number: number
  name?: string
  source: CVVersion['source']
  file_url?: string
  file_name?: string
  file_size?: number
  raw_text?: string
  parsed_data?: ParsedResume
  is_primary?: boolean
  market_score?: number
}

export interface UpdateCVVersionDTO {
  name?: string
  raw_text?: string
  parsed_data?: ParsedResume
  is_primary?: boolean
  market_score?: number
  template?: string
}

export type CreateAnalysisDTO = {
  cv_version_id: string
  user_id: string

  job_description?: string
  job_title?: string
  company_name?: string

  ats_score?: number
  recruiter_score?: number
  market_alignment?: number
  hiring_probability?: number
  composite_score?: number

  keyword_matches?: unknown
  keyword_gaps?: string[]

  section_scores?: Record<string, number>

  strengths?: string[]
  critical_issues?: string[]
  improvements?: unknown

  ai_summary?: string

  processing_status?: 'pending' | 'processing' | 'complete' | 'failed'
}

export interface UpdateAnalysisDTO {
  ats_score?: number
  recruiter_score?: number
  market_alignment?: number
  hiring_probability?: number
  keyword_matches?: ATSScore['keyword_matches']
  keyword_gaps?: string[]
  section_scores?: ATSScore['section_scores']
  strengths?: string[]
  critical_issues?: string[]
  improvements?: ATSScore['improvements']
  ai_summary?: string
  processing_status?: CVAnalysis['processing_status']
}

// ── Score history point (for charts) ─────────────────────────────

export interface ScoreHistoryPoint {
  date: string
  version_number: number
  version_name: string | null
  ats_score: number
  recruiter_score: number
  market_alignment: number
}

// ── Parse result ──────────────────────────────────────────────────

export interface ParseResult {
  raw_text: string
  parsed_data: ParsedResume
  parse_method: 'pdf' | 'docx' | 'ocr'
  confidence: 'high' | 'medium' | 'low'
}

// ── Upload response ───────────────────────────────────────────────

export interface UploadResponse {
  version_id: string
  version_number: number
  job_id: string
  file_url: string
}

// ── Status poll response ──────────────────────────────────────────

export interface ParseStatusResponse {
  status: CVParseJob['status']
  parse_method: string | null
  version?: Partial<CVVersion>
  analysis?: Partial<CVAnalysis>
  error?: string
}