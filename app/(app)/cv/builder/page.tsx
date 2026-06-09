export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CVBuilder from '@/components/cv/CVBuilder'
import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

export const metadata = { title: 'CV Builder — EarnGro' }

export default async function CVBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { from } = await searchParams

  // If ?from=versionId — pre-populate with parsed data from that version
  let initialData: ParsedResume | undefined

  if (from) {
    const { data: version } = await supabase
      .from('cv_versions')
      .select('parsed_data')
      .eq('id', from)
      .eq('user_id', user.id)
      .single()

    if (version?.parsed_data) {
      initialData = version.parsed_data as ParsedResume
    }
  } else {
    // Pre-populate from latest version if exists
    const { data: latest } = await supabase
      .from('cv_versions')
      .select('parsed_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latest?.parsed_data) {
      initialData = latest.parsed_data as ParsedResume
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
          Resume Builder
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Build or edit your resume · Live preview · AI analysis on save
        </p>
      </div>
      <CVBuilder initialData={initialData} />
    </div>
  )
}