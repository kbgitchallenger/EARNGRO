/* eslint-disable @typescript-eslint/no-require-imports */
export async function parsePDF(buffer: Buffer): Promise<string> {
  // Import the internal lib directly — bypasses pdf-parse's index.js
  // which has a debug block that tries to read a test fixture file
  // that doesn't exist in Vercel's serverless filesystem (ENOENT)
  const pdfParse = require('pdf-parse/lib/pdf-parse.js')
  const data = await pdfParse(buffer, { max: 0 })
  const text = data.text?.trim() ?? ''
  if (text.length < 30) throw new Error('PDF contains insufficient extractable text')
  return text
}