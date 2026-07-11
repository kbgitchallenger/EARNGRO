// lib/ai/client.ts
import Anthropic from '@anthropic-ai/sdk'
import type { ZodSchema, z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface AICallOptions {
  maxTokens?: number
  model?: string
  feature?: string   // e.g. 'growdna', 'cv_parse_analyze', 'ats_reanalyze', 'calculator'
  userId?: string     // null/undefined for anonymous calls (e.g. the calculator)
}

function extractJSON(raw: string): unknown {
  // Remove markdown fences properly
  let cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) {
    console.error('No JSON braces found. Raw response length:', raw.length)
    console.error('First 500 chars:', raw.substring(0, 500))
    throw new Error('No JSON object found in response')
  }

  cleaned = cleaned.slice(start, end + 1)

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    try {
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')
      cleaned = cleaned.replace(/:\s*"([^"]*)[\n\r]+([^"]*)"/g, ': "$1 $2"')
      return JSON.parse(cleaned)
    } catch {
      const match = (e as any)?.message?.match(/position (\d+)/)
      if (match) {
        const pos = parseInt(match[1], 10)
        console.error(`JSON error at position ${pos}:`)
        console.error('Context:', cleaned.substring(Math.max(0, pos - 50), pos + 50))
      }
      throw new Error(`Invalid JSON in AI response: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
}

// ── Usage logging — fire and forget, never blocks or fails the caller ──
async function logUsage(params: {
  feature?: string
  userId?: string
  model: string
  inputTokens: number
  outputTokens: number
}) {
  try {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await supabase.from('ai_usage_log').insert({
    feature: params.feature ?? 'unknown',
    user_id: params.userId ?? null,
    model: params.model,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    created_at: new Date().toISOString(),
  })
} catch (err) {
  console.warn('AI usage logging failed (non-fatal):', err)
}
}

export async function callAIJSON<T extends ZodSchema>(
  prompt: string,
  schema: T,
  options: AICallOptions = {}
): Promise<z.infer<T>> {
  const model = options.model ?? 'claude-sonnet-4-6'

  const message = await anthropic.messages.create({
    model,
    max_tokens: options.maxTokens ?? 1024,
    system: 'You are a JSON API. Return ONLY a valid JSON object. No markdown, no backticks, no explanation, no trailing commas. Start your response with { and end with }. Ensure all strings are properly escaped.',
    messages: [{ role: 'user', content: prompt }],
  })

  // Log real usage — don't await inline in a way that could delay the response;
  // this is intentionally not blocking the parse/return below.
  logUsage({
    feature: options.feature,
    userId: options.userId,
    model,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  const textBlock = message.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from AI')

  const parsed = extractJSON(textBlock.text)
  return schema.parse(parsed)
}

export async function callAIText(
  prompt: string,
  options: AICallOptions = {}
): Promise<string> {
  const model = options.model ?? 'claude-sonnet-4-5'

  const message = await anthropic.messages.create({
    model,
    max_tokens: options.maxTokens ?? 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  logUsage({
    feature: options.feature,
    userId: options.userId,
    model,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  const textBlock = message.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from AI')
  return textBlock.text
}