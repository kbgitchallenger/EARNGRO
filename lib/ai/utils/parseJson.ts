/**
 * Safely parses AI response text to JSON.
 * Handles markdown code blocks, leading/trailing whitespace,
 * and partial JSON fence patterns.
 */
export function safeParseJSON(text: string): unknown {
  // Strip markdown code fences
  let cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()

  // Find the first { or [ to handle leading prose
  const firstBrace = cleaned.search(/[{[]/)
  if (firstBrace > 0) {
    cleaned = cleaned.slice(firstBrace)
  }

  // Find the last } or ] to handle trailing prose
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'))
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.slice(0, lastBrace + 1)
  }

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error(`AI response is not valid JSON.\nRaw text (first 200 chars): ${text.slice(0, 200)}`)
  }
}

/**
 * Attempts safeParseJSON and returns null on failure instead of throwing.
 * Use when you have a fallback strategy.
 */
export function tryParseJSON(text: string): unknown | null {
  try {
    return safeParseJSON(text)
  } catch {
    return null
  }
}