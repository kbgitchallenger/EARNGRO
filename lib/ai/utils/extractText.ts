import type Anthropic from '@anthropic-ai/sdk'

/**
 * Extracts text from Anthropic message content blocks.
 * Handles the union type safely — TypeScript-friendly.
 */
export function extractText(message: Anthropic.Message): string {
  const block = message.content.find(b => b.type === 'text')
  if (!block || block.type !== 'text') {
    throw new Error('No text block found in AI response')
  }
  return block.text
}

/**
 * Extracts all text blocks and joins them.
 * Use when response may span multiple text blocks.
 */
export function extractAllText(message: Anthropic.Message): string {
  return message.content
    .filter(b => b.type === 'text')
    .map(b => (b.type === 'text' ? b.text : ''))
    .join('\n')
}