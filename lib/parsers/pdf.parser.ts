/* eslint-disable @typescript-eslint/no-require-imports */
export async function parsePDF(buffer: Buffer): Promise<string> {
  // v1.1.4 — simple function call API. The package's index.js has a
  // debug block guarded by `module.parent` that can misfire in some
  // bundled serverless environments; requiring the internal lib file
  // directly skips that debug path entirely.
  const pdfParse = require('pdf-parse/lib/pdf-parse.js')
  const data = await pdfParse(buffer, { max: 0 })
  const text = data.text?.trim() ?? ''
  if (text.length < 30) throw new Error('PDF contains insufficient extractable text')
  return text
}