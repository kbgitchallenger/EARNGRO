export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CVHistoryRow from '@/components/cv/CVHistoryRow'

export default async function CVHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: versions } = await supabase
    .from('cv_versions')
    .select('id, name, version_number, source, market_score, created_at, file_name, is_primary')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!versions?.length) redirect('/cv/upload')

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{versions.length} version{versions.length !== 1 ? 's' : ''}</div>
        <Link href="/cv/upload" style={{ fontSize: 13, fontWeight: 600, background: 'var(--teal)', color: '#fff', padding: '8px 18px', borderRadius: 99, textDecoration: 'none' }}>
          + Upload new
        </Link>
      </div>

      {/* FIX: previously each row declared transition:'border-color 0.15s'
          with no hover state to ever trigger it, and no shadow at all —
          same two gaps found and fixed on Settings and CV Builder earlier.
          CVHistoryRow is a small client component with real hover state. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {versions.map(v => (
          <CVHistoryRow
            key={v.id}
            id={v.id}
            name={v.name}
            versionNumber={v.version_number}
            isPrimary={v.is_primary}
            source={v.source}
            fileName={v.file_name}
            createdAt={v.created_at}
            score={v.market_score}
          />
        ))}
      </div>
    </div>
  )
}