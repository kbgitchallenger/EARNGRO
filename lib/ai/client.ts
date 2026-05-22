// lib/ai/client.ts
// One Anthropic instance. All routes use this — never import SDK directly.

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AICallOptions {
  model?: string
  maxTokens?: number
  systemPrompt?: string
}

export async function callAI(
  userPrompt: string,
  options: AICallOptions = {}
): Promise<string> {
  const message = await anthropic.messages.create({
    model: options.model ?? 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens ?? 1500,
    system: options.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  const block = message.content.find(b => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error('No text in AI response')
  return block.text
}

export async function callAIJSON<T>(
  userPrompt: string,
  validator: (raw: unknown) => T,   // Zod .parse()
  options: AICallOptions = {}
): Promise<T> {
  const text = await callAI(userPrompt, options)
  const cleaned = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return validator(parsed)           // throws ZodError if invalid
}