import { resumeRepository } from '@/repositories/resume.repository'
import { parserService } from './parser.service'
import { callAIJSON } from '@/lib/ai/client'
import { MARKET_POSITIONING_PROMPT } from '@/lib/ai/prompts/resume.prompts'
import { MarketPositioningSchema } from '@/lib/ai/validators/resume.validator'
import type { CVVersion, CreateCVVersionDTO, ParseResult } from '@/types/resume.types'
import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

export class ResumeService {

  async initializeUpload(
    userId: string,
    fileUrl: string,
    fileName: string,
    fileSize: number,
    _mimeType: string
  ): Promise<{ versionId: string; versionNumber: number; jobId: string }> {
    const latestNumber = await resumeRepository.getLatestVersionNumber(userId)
    const versionNumber = latestNumber + 1

    const version = await resumeRepository.create({
      user_id: userId,
      version_number: versionNumber,
      name: `Resume v${versionNumber}`,
      source: 'upload',
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      is_primary: versionNumber === 1,
    })

    const job = await resumeRepository.createParseJob(version.id, userId)

    return { versionId: version.id, versionNumber, jobId: job.id }
  }

  async runParsePipeline(
    versionId: string,
    jobId: string,
    fileUrl: string,
    mimeType: string
  ): Promise<ParseResult> {
    await resumeRepository.updateParseJob(jobId, {
      status: 'parsing',
      started_at: new Date().toISOString(),
    })

    let result: ParseResult

    try {
      result = await parserService.parse(fileUrl, mimeType)
    } catch (err) {
      await resumeRepository.updateParseJob(jobId, {
        status: 'failed',
        error_message: err instanceof Error ? err.message : 'Parse failed',
        completed_at: new Date().toISOString(),
      })
      throw err
    }

    await resumeRepository.updateParseJob(jobId, {
      status: 'normalizing',
      parse_method: result.parse_method,
    })

    await resumeRepository.update(versionId, {
      raw_text: result.raw_text,
      parsed_data: result.parsed_data,
    })

    await resumeRepository.updateParseJob(jobId, {
      status: 'complete',
      completed_at: new Date().toISOString(),
    })

    return result
  }

  async calculateMarketScore(
    parsed: ParsedResume,
    city: string
  ): Promise<number> {
    try {
      const primaryRole = parsed.experience?.[0]?.role ?? parsed.name ?? 'Professional'
      const positioning = await callAIJSON(
        MARKET_POSITIONING_PROMPT(
          {
  name: parsed.name,
  email: parsed.email,
  phone: parsed.phone,
  location: parsed.location,
  summary: parsed.summary,

  primary_role:
    parsed.primary_role ??
    parsed.experience?.[0]?.role ??
    'Professional',

  seniority_level:
    parsed.seniority_level ??
    this.calculateSeniorityLevel(parsed),

  total_experience_years:
    parsed.total_experience_years,

  skills: parsed.skills ?? [],

  experience:
    parsed.experience?.map(e => ({
      company: e.company,
      role: e.role ?? '',
      start_date: e.start_date ?? '',
      end_date: e.end_date,
      bullets: e.bullets ?? [],
      is_current: e.is_current ?? false,
    })) ?? [],

  education:
    parsed.education?.map(e => ({
      institution: e.institution,
      degree: e.degree,
      year: e.year,
    })) ?? [],

  certifications:
    parsed.certifications?.map(c => ({
      name: c.name,
      issuer: c.issuer,
      year: c.year,
    })) ?? [],
},
          city
        ),
        MarketPositioningSchema,
        { maxTokens: 800 }
      )
      return positioning.market_readiness_score
    } catch {
      // Fallback heuristic
      const expScore = Math.min(parsed.total_experience_years * 5, 40)
      const skillScore = Math.min(parsed.skills.length * 3, 30)
      const certScore = Math.min((parsed.certifications?.length ?? 0) * 5, 15)
      const summaryScore = parsed.summary ? 15 : 0
      return Math.round(expScore + skillScore + certScore + summaryScore)
    }
  }

  private calculateSeniorityLevel(parsed: ParsedResume): string {
    const years = parsed.total_experience_years
    if (years >= 15) return 'senior'
    if (years >= 7) return 'mid'
    if (years >= 3) return 'junior'
    return 'entry'
  }

  async saveBuilderVersion(
    userId: string,
    parsedData: ParsedResume,
    name?: string
  ): Promise<CVVersion> {
    const latestNumber = await resumeRepository.getLatestVersionNumber(userId)
    const versionNumber = latestNumber + 1

    return resumeRepository.create({
      user_id: userId,
      version_number: versionNumber,
      name: name ?? `Resume v${versionNumber}`,
      source: 'builder',
      parsed_data: parsedData,
      raw_text: this.parsedToPlainText(parsedData),
    })
  }

  async setPrimary(userId: string, versionId: string): Promise<void> {
    return resumeRepository.setAsPrimary(userId, versionId)
  }

  async getHistory(userId: string): Promise<CVVersion[]> {
    return resumeRepository.findByUser(userId)
  }

  async canCreateVersion(userId: string, plan: string): Promise<boolean> {
    const limits: Record<string, number> = { free: 1, grow: 5, accelerate: -1 }
    const limit = limits[plan] ?? 1
    if (limit === -1) return true
    const count = await resumeRepository.countByUser(userId)
    return count < limit
  }

  parsedToPlainText(parsed: ParsedResume): string {
    const lines: string[] = []

    if (parsed.name) lines.push(parsed.name)
    if (parsed.email) lines.push(parsed.email)
    if (parsed.phone) lines.push(parsed.phone)
    if (parsed.location) lines.push(parsed.location)
    if (parsed.summary) lines.push('\nSUMMARY\n' + parsed.summary)

    if (parsed.experience?.length) {
      lines.push('\nEXPERIENCE')
      for (const exp of parsed.experience) {
        lines.push(`${exp.role} at ${exp.company} (${exp.start_date} – ${exp.end_date ?? 'Present'})`)
        for (const b of exp.bullets) lines.push(`• ${b}`)
      }
    }

    if (parsed.education?.length) {
      lines.push('\nEDUCATION')
      for (const edu of parsed.education) {
        lines.push(`${edu.degree} — ${edu.institution} ${edu.year ?? ''}`)
      }
    }

    if (parsed.skills?.length) {
      lines.push('\nSKILLS\n' + parsed.skills.join(', '))
    }

    if (parsed.certifications?.length) {
      lines.push('\nCERTIFICATIONS')
      for (const cert of parsed.certifications) {
        const issuer = cert.issuer ? ` — ${cert.issuer}` : ''
        lines.push(`${cert.name}${issuer}`)
      }
    }

    return lines.join('\n')
  }
}

export const resumeService = new ResumeService()