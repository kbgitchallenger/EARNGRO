import Anthropic from '@anthropic-ai/sdk'
import type { ZodSchema, z } from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface AICallOptions {
  maxTokens?: number
  model?: string
}

function extractJSON(raw: string): unknown {
  // Remove markdown fences
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()

  // Find first { and last }
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')

  cleaned = cleaned.slice(start, end + 1)
  return JSON.parse(cleaned)
}

export async function callAIJSON<T extends ZodSchema>(
  prompt: string,
  schema: T,
  options: AICallOptions = {}
): Promise<z.infer<T>> {
  const message = await anthropic.messages.create({
    model: options.model ?? 'claude-sonnet-4-5',
    max_tokens: options.maxTokens ?? 1024,
    system: 'You are a JSON API. Return ONLY a valid JSON object. No markdown, no backticks, no explanation. Start your response with { and end with }.',
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