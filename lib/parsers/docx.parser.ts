export async function parseDOCX(buffer: Buffer): Promise<string | null> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value?.trim() ?? ''
    console.log(`DOCX extracted ${text.length} chars`)
    return text.length > 10 ? text : null  // null = caller should try OCR
  } catch (err) {
    console.warn('mammoth failed:', err)
    return null
  }
}