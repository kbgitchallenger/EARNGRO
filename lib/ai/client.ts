import Anthropic from '@anthropic-ai/sdk'
import type { ZodSchema, z } from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface AICallOptions {
  maxTokens?: number
  model?: string
}

function extractJSON(raw: string): unknown {
  // Remove markdown fences properly
  let cleaned = raw
    .replace(/^```json\s*/i, '')  // Remove opening ```json
    .replace(/^```\s*/i, '')      // Remove opening ```
    .replace(/```\s*$/i, '')      // Remove closing ```
    .trim()

  // Find first { and last }
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
    // Try to fix common JSON issues
    try {
      // Remove trailing commas before ] or }
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')
      // Remove unescaped newlines in strings (be careful)
      cleaned = cleaned.replace(/:\s*"([^"]*)[\n\r]+([^"]*)"/g, ': "$1 $2"')
      return JSON.parse(cleaned)
    } catch {
      // Log context around the error position
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

export async function callAIJSON<T extends ZodSchema>(
  prompt: string,
  schema: T,
  options: AICallOptions = {}
): Promise<z.infer<T>> {
  const message = await anthropic.messages.create({
    model: options.model ?? 'claude-sonnet-4-5',
    max_tokens: options.maxTokens ?? 1024,
    system: 'You are a JSON API. Return ONLY a valid JSON object. No markdown, no backticks, no explanation, no trailing commas. Start your response with { and end with }. Ensure all strings are properly escaped.',
    messages: [{ role: 'user', content: prompt }],
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
  const message = await anthropic.messages.create({
    model: options.model ?? 'claude-sonnet-4-5',
    max_tokens: options.maxTokens ?? 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from AI')
  return textBlock.text
}