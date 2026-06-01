export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {versions.map(v => {
          const score = v.market_score
          const scoreColor = score >= 70 ? 'var(--teal)' : score >= 45 ? 'var(--amber)' : 'var(--red)'
          return (
            <Link
              key={v.id}
              href={`/cv/analysis/${v.id}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--paper)', border: `1px solid ${v.is_primary ? 'var(--teal-mid)' : 'var(--border)'}`, borderRadius: 'var(--r-lg)', padding: '16px 18px', transition: 'border-color 0.15s' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: v.source === 'upload' ? 'var(--teal-l)' : 'var(--amber-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {v.source === 'upload' ? '📄' : '🛠️'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{v.name ?? `Resume v${v.version_number}`}</span>
                  {v.is_primary && <span style={{ fontSize: 10, background: 'var(--teal)', color: '#fff', padding: '1px 7px', borderRadius: 99, fontWeight: 700 }}>PRIMARY</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {v.file_name ?? v.source} · {new Date(v.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {score ? (
                  <>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>score</div>
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 99, padding: '3px 10px' }}>Analyse →</div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}