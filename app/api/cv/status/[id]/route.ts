import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resumeRepository } from '@/repositories/resume.repository'
import { analysisRepository } from '@/repositories/analysis.repository'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { id } = await context.params

    const job = await resumeRepository.getParseJobByVersion(id)
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    if (job.status === 'complete') {
      const version = await resumeRepository.findById(id)
      const analysis = await analysisRepository.findLatestByVersion(id)
      return NextResponse.json({
        status: 'complete',
        parse_method: job.parse_method,
        version,
        analysis,
      })
    }

    return NextResponse.json({
      status: job.status,
      parse_method: job.parse_method ?? null,
      error: job.error_message ?? null,
    })

  } catch (err) {
    console.error('Status check error:', err)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}