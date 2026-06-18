//app/(app)/cv/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CVUploadZone from '@/components/cv/CVUploadZone'
import Link from 'next/link'

export const metadata = { title: 'Resume Intelligence — EarnGro' }

export default async function CVUploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: versions } = await supabase
    .from('cv_versions')
    .select('id, version_number, name, market_score, created_at, source, parsed_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const latest = versions?.[0]
  const parsedLatest = latest?.parsed_data as { name?: string; total_experience_years?: number; skills?: string[] } | null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Hero — if resume exists show intelligence summary */}
      {latest ? (
        <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-xl)', padding: '24px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Latest resume · v{latest.version_number}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                {parsedLatest?.name ?? latest.name}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>
                {parsedLatest?.total_experience_years ? `${parsedLatest.total_experience_years} years experience · ` : ''}
                {versions?.length} version{versions?.length !== 1 ? 's' : ''} uploaded
              </div>
              {parsedLatest?.skills?.slice(0, 6).map((s, i) => (
                <span key={i} style={{ display: 'inline-block', fontSize: 11, padding: '3px 10px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 99, margin: '0 4px 4px 0' }}>
                  {s}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              {latest.market_score && (
                <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--r-lg)', padding: '12px 18px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{latest.market_score}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>market score</div>
                </div>
              )}
              <Link href={`/cv/analysis/${latest.id}`} style={{ fontSize: 13, fontWeight: 600, background: '#fff', color: 'var(--teal-d)', padding: '9px 18px', borderRadius: 99, textDecoration: 'none' }}>
                View analysis →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--teal-d)', marginBottom: 4 }}>
            🎯 Upload your resume to get started
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            AI will analyse your ATS score, recruiter fit, keyword gaps, and market salary positioning.
          </div>
        </div>
      )}

      {/* Version history strip */}
      {versions && versions.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {versions.map((v, i) => (
            <Link key={v.id} href={`/cv/analysis/${v.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ background: i === 0 ? 'var(--teal-l)' : 'var(--paper)', border: `1px solid ${i === 0 ? 'var(--teal-mid)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', padding: '10px 14px', minWidth: 120 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? 'var(--teal-d)' : 'var(--ink)' }}>v{v.version_number}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                  {new Date(v.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
                {v.market_score && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', marginTop: 4 }}>{v.market_score}/100</div>
                )}
              </div>
            </Link>
          ))}
          <Link href="/cv/history" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px', minWidth: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>All →</span>
            </div>
          </Link>
        </div>
      )}

      {/* Upload zone */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>
          {latest ? '⬆️ Upload new version' : '⬆️ Upload your resume'}
        </div>
        <CVUploadZone userId={user.id} />
      </div>

      {/* What we analyse grid */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
          What EarnGro analyses in your resume
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
          {[
            { icon: '🎯', title: 'ATS Score', desc: 'How well your CV passes automated screening' },
            { icon: '👔', title: 'Recruiter Score', desc: 'Human readability and first impression' },
            { icon: '📊', title: 'Market Alignment', desc: 'Fit against current hiring demand' },
            { icon: '🔑', title: 'Keyword Gaps', desc: 'Missing high-value terms for your target role' },
            { icon: '💰', title: 'Salary Positioning', desc: 'How your CV positions your market value' },
            { icon: '✏️', title: 'AI Optimization', desc: 'Bullet-by-bullet improvement suggestions' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}