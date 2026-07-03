import { callAIJSON} from '@/lib/ai/client'

import {
  ATS_SCORE_PROMPT,
  QUICK_SCORE_PROMPT,
  EXTRACT_JD_KEYWORDS_PROMPT,
  COMPARE_VERSIONS_PROMPT,
} from '@/lib/ai/prompts/ats.prompts'

import {
  ATSResultSchema,
  QuickScoreSchema,
  VersionComparisonSchema,
  type ATSResult,
  type QuickScore,
  type VersionComparison,
} from '@/lib/ai/validators/ats.validator'

import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

import { analysisRepository } from '@/repositories/analysis.repository'
import { resumeRepository } from '@/repositories/resume.repository'

import type { CVAnalysis } from '@/types/resume.types'

// Hard caps on unbounded inputs — resumeText and jobDescription previously
// had no ceiling, unlike parserService.normalize() which already slices to
// 6000 chars. A long resume + a fully pasted job posting could push input
// tokens well past what cv_parse_analyze / ats_reanalyze assume they cost.
const MAX_RESUME_CHARS = 8000
const MAX_JD_CHARS = 3000

function capText(text: string | null | undefined, max: number): string | undefined {
  if (!text) return text ?? undefined
  if (text.length <= max) return text
  console.warn(`ATS input capped: ${text.length} chars truncated to ${max}`)
  return text.slice(0, max)
}

export class ATSService {

  // ── Full ATS score ────────────────────────────────────────────
  // Comprehensive scoring against a JD or generically

  async score(
    cvVersionId: string,
    userId: string,
    resumeText: string,
    jobDescription: string | null = null,
    jobTitle: string | null = null,
    companyName: string | null = null
  ): Promise<CVAnalysis> {

    const cappedResume = capText(resumeText, MAX_RESUME_CHARS)!
    const cappedJD = capText(jobDescription, MAX_JD_CHARS)

    // Create analysis record in pending state
    const analysis = await analysisRepository.create({
      cv_version_id: cvVersionId,
      user_id: userId,
      job_description: jobDescription ?? undefined,
      job_title: jobTitle ?? undefined,
      company_name: companyName ?? undefined,
      processing_status: 'processing',
    })

    try {
      const result = await callAIJSON(
        ATS_SCORE_PROMPT(cappedResume, cappedJD ?? null, jobTitle),
        ATSResultSchema,
        { maxTokens: 2000, feature: 'cv_parse_analyze', userId }
      )

      // Save full results
      const updated = await analysisRepository.update(analysis.id, {
        ats_score: result.ats_score,
        recruiter_score: result.recruiter_score,
        market_alignment: result.market_alignment,
        hiring_probability: result.hiring_probability,
        keyword_matches: result.keyword_matches,
        keyword_gaps: result.keyword_gaps,
        section_scores: result.section_scores,
        strengths: result.strengths,
        critical_issues: result.critical_issues,
        improvements: result.improvements,
        ai_summary: result.ai_summary,
        processing_status: 'complete',
      })

      // Update version market_score
      await resumeRepository.update(cvVersionId, {
        market_score: result.market_alignment,
      })

      return updated

    } catch (err) {
      await analysisRepository.updateStatus(analysis.id, 'failed')
      console.error('ATS analyze failed:', err)
      throw err
    }
  }

  // ── Advanced analysis workflow ────────────────────────────────
  // Enhanced analysis with composite scoring + analysisId

  async analyze(
    versionId: string,
    userId: string,
    rawText: string,
    parsedData: ParsedResume,
    jobDescription?: string
  ): Promise<ATSResult & { analysisId: string }> {

    const cappedResume = capText(rawText, MAX_RESUME_CHARS)!
    const cappedJD = capText(jobDescription, MAX_JD_CHARS)

    // Run AI analysis — tagged 'ats_reanalyze' since this is the re-run path,
    // distinct from the initial cv_parse_analyze during upload.
    const result = await callAIJSON(
      ATS_SCORE_PROMPT(cappedResume, cappedJD),
      ATSResultSchema,
      { maxTokens: 2000, feature: 'ats_reanalyze', userId }
    )

    // Calculate composite score
    const compositeScore = Math.round(
      result.ats_score * 0.35 +
      result.recruiter_score * 0.25 +
      result.market_alignment * 0.25 +
      result.hiring_probability * 0.15
    )

    // Save to database
    const saved = await analysisRepository.create({
      cv_version_id: versionId,
      user_id: userId,
      job_description: jobDescription,
      ats_score: result.ats_score,
      recruiter_score: result.recruiter_score,
      market_alignment: result.market_alignment,
      hiring_probability: result.hiring_probability,
      composite_score: compositeScore,
      keyword_matches: result.keyword_matches,
      section_scores: result.section_scores,
      strengths: result.strengths,
      critical_issues: result.critical_issues,
      improvements: result.improvements,
      ai_summary: result.ai_summary,
      processing_status: 'complete',
    })

    // Update version market_score
   await resumeRepository.update(versionId, {market_score: compositeScore,})

    return {
      ...result,
      analysisId: saved.id,
    }
  }

  // ── Quick score ───────────────────────────────────────────────
  // Fast background score on upload — no JD needed

  async quickScore(resumeText: string, userId?: string): Promise<QuickScore> {
    const cappedResume = capText(resumeText, MAX_RESUME_CHARS)!
    return callAIJSON(
      QUICK_SCORE_PROMPT(cappedResume),
      QuickScoreSchema,
      { maxTokens: 400, feature: 'quick_score', userId }
    )
  }

  // ── Keyword extraction ────────────────────────────────────────
  // Pre-process JD to show keyword gaps before full scoring

  async extractJDKeywords(jobDescription: string, userId?: string): Promise<{
    must_have: string[]
    good_to_have: string[]
    role_keywords: string[]
    tech_stack: string[]
    soft_skills: string[]
  }> {

    const { z } = await import('zod')

    const schema = z.object({
      must_have: z.array(z.string()),
      good_to_have: z.array(z.string()),
      role_keywords: z.array(z.string()),
      tech_stack: z.array(z.string()),
      soft_skills: z.array(z.string()),
    })

    const cappedJD = capText(jobDescription, MAX_JD_CHARS)!

    return callAIJSON(
      EXTRACT_JD_KEYWORDS_PROMPT(cappedJD),
      schema,
      { maxTokens: 600, feature: 'extract_jd_keywords', userId }
    )
  }

  // ── Version comparison ────────────────────────────────────────
  // Analyses improvement between two resume versions

  async compareVersions(
    v1Id: string,
    v2Id: string,
    userId?: string
  ): Promise<VersionComparison> {

    const [v1, v2] = await Promise.all([
      resumeRepository.findById(v1Id),
      resumeRepository.findById(v2Id),
    ])

    if (!v1 || !v2) {
      throw new Error('One or both versions not found')
    }

    if (!v1.raw_text || !v2.raw_text) {
      throw new Error('Versions missing text content')
    }

    const [v1Analysis, v2Analysis] = await Promise.all([
      analysisRepository.findLatestByVersion(v1Id),
      analysisRepository.findLatestByVersion(v2Id),
    ])

    return callAIJSON(
      COMPARE_VERSIONS_PROMPT(
        capText(v1.raw_text, MAX_RESUME_CHARS)!,
        capText(v2.raw_text, MAX_RESUME_CHARS)!,
        v1Analysis?.ats_score ?? 0,
        v2Analysis?.ats_score ?? 0
      ),
      VersionComparisonSchema,
      { maxTokens: 800, feature: 'compare_versions', userId }
    )
  }

  // ── Helpers ───────────────────────────────────────────────────

  async getLatestForVersion(versionId: string) {
    return analysisRepository.findLatestByVersion(versionId)
  }

  async getHistory(userId: string) {
    return analysisRepository.getByUser(userId)
  }

  // ── Score label helper ────────────────────────────────────────

  getScoreLabel(
    score: number
  ): { label: string; color: string; emoji: string } {

    if (score >= 80) {
      return {
        label: 'Excellent',
        color: 'var(--teal)',
        emoji: '🚀',
      }
    }

    if (score >= 65) {
      return {
        label: 'Strong',
        color: '#16a34a',
        emoji: '✅',
      }
    }

    if (score >= 50) {
      return {
        label: 'Good',
        color: 'var(--amber)',
        emoji: '📈',
      }
    }

    if (score >= 35) {
      return {
        label: 'Needs Work',
        color: '#ea580c',
        emoji: '⚠️',
      }
    }

    return {
      label: 'Critical Gaps',
      color: 'var(--red)',
      emoji: '🔴',
    }
  }

  getHiringProbabilityLabel(prob: number): string {

    if (prob >= 75) {
      return 'Very likely to be shortlisted'
    }

    if (prob >= 55) {
      return 'Good shortlist probability'
    }

    if (prob >= 35) {
      return 'Moderate — improvements needed'
    }

    if (prob >= 20) {
      return 'Low — significant gaps'
    }

    return 'Very low — major restructure needed'
  }
}

export const atsService = new ATSService()