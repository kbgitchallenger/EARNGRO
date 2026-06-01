/* eslint-disable @typescript-eslint/no-require-imports */
export async function parsePDF(buffer: Buffer): Promise<string> {
  const pdfParse = require('pdf-parse')
  const data = await pdfParse(buffer, { max: 0 })
  const text = data.text?.trim() ?? ''
  if (text.length < 30) throw new Error('PDF contains insufficient extractable text')
  return text
}