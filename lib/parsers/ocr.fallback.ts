import Anthropic from '@anthropic-ai/sdk'

export async function ocrFallback(buffer: Buffer): Promise<string> {
  console.log('🤖 Using Claude vision as OCR fallback...')

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    // Send PDF buffer directly to Claude — it supports PDF documents natively
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: buffer.toString('base64'),
              },
            } as never,
            {
              type: 'text',
              text: 'Extract all text content from this resume document. Return the raw text exactly as it appears — preserve structure, bullet points, dates, and all details. Do not summarise or interpret. Just extract and return the complete text.',
            },
          ],
        },
      ],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text returned from Claude vision')
    }

    const extracted = textBlock.text.trim()

    if (extracted.length < 30) {
      throw new Error('Claude vision returned insufficient content')
    }

    console.log(`✅ Claude vision extracted: ${extracted.length} chars`)
    return extracted

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Claude vision OCR failed: ${msg}`)
  }
}