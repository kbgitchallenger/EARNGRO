import { parsePDF } from '@/lib/parsers/pdf.parser'
import { parseDOCX } from '@/lib/parsers/docx.parser'
import { ocrFallback } from '@/lib/parsers/ocr.fallback'
import { callAIJSON } from '@/lib/ai/client'
import { RESUME_NORMALIZE_PROMPT } from '@/lib/ai/prompts/resume.prompts'
import { ParsedResumeSchema, type ParsedResume } from '@/lib/ai/validators/resume.validator'
import type { ParseResult } from '@/types/resume.types'

export class ParserService {

  async parse(fileUrl: string, mimeType: string, userId?: string): Promise<ParseResult> {
    const t0 = Date.now()
    const buffer = await this.fetchBuffer(fileUrl)
    console.log(`⏱ Fetch buffer: ${Date.now() - t0}ms, size: ${buffer.length} bytes`)

    let rawText = ''
    let parseMethod: 'pdf' | 'docx' | 'ocr'

    const isPDF = mimeType === 'application/pdf' || fileUrl.toLowerCase().includes('.pdf')
    const isDOCX = mimeType.includes('wordprocessingml') || fileUrl.toLowerCase().includes('.docx')

    if (isPDF) {
      const t1 = Date.now()
      try {
        rawText = await parsePDF(buffer)
        parseMethod = 'pdf'
        console.log(`⏱ pdf-parse SUCCESS: ${Date.now() - t1}ms, chars: ${rawText.length}`)
      } catch (pdfErr) {
        console.log(`⏱ pdf-parse FAILED at ${Date.now() - t1}ms:`, pdfErr instanceof Error ? pdfErr.message : pdfErr)
        const t2 = Date.now()
        try {
          rawText = await ocrFallback(buffer)
          parseMethod = 'ocr'
          console.log(`⏱ OCR fallback SUCCESS: ${Date.now() - t2}ms, chars: ${rawText.length}`)
        } catch (ocrErr) {
          console.log(`⏱ OCR fallback FAILED at ${Date.now() - t2}ms:`, ocrErr instanceof Error ? ocrErr.message : ocrErr)
          throw new Error('Could not extract text from this PDF. Please ensure it is not scanned or password-protected.')
        }
      }
    } else if (isDOCX) {
      const t1 = Date.now()
      const extracted = await parseDOCX(buffer)
      console.log(`⏱ DOCX parse: ${Date.now() - t1}ms`)
      if (!extracted) throw new Error('Could not extract text from DOCX file.')
      rawText = extracted
      parseMethod = 'docx'
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`)
    }

    if (!rawText || rawText.trim().length < 30) {
      throw new Error('Resume appears empty or unreadable.')
    }

    const t3 = Date.now()
    const parsedData = await this.normalize(rawText, userId)
    console.log(`⏱ AI normalize: ${Date.now() - t3}ms`)
    console.log(`⏱ TOTAL pipeline: ${Date.now() - t0}ms`)

    return {
      raw_text: rawText,
      parsed_data: parsedData,
      parse_method: parseMethod,
      confidence: 'high',
    }
  }

  private async fetchBuffer(fileUrl: string): Promise<Buffer> {
    const response = await fetch(fileUrl, { headers: { 'Cache-Control': 'no-cache' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length === 0) throw new Error('Downloaded file is empty')
    return buffer
  }

  private async normalize(rawText: string, userId?: string): Promise<ParsedResume> {
    return callAIJSON(
      RESUME_NORMALIZE_PROMPT(rawText.slice(0, 6000)),
      ParsedResumeSchema,
      { maxTokens: 2000, feature: 'cv_parse_analyze', userId }
    )
  }
}

export const parserService = new ParserService()