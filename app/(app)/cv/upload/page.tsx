import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CVUploadZone from '@/components/cv/CVUploadZone'
import Link from 'next/link'

export const metadata = {
  title: 'Upload Resume — EarnGro',
}

export default async function CVUploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check existing versions
  const { data: versions } = await supabase
    .from('cv_versions')
    .select('id, version_number, name, market_score, created_at, source')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const hasVersions = versions && versions.length > 0

  return (
    <div>
      {/* Previous versions hint */}
      {hasVersions && (
        <div style={{
          background: 'var(--teal-xl)',
          border: '1px solid var(--teal-mid)',
          borderRadius: 'var(--r-lg)',
          padding: '14px 18px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-d)' }}>
              You have {versions.length} resume version{versions.length !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Uploading a new version will be tracked in your history
            </div>
          </div>
          <Link href="/cv/history" style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-d)', textDecoration: 'none' }}>
            View history →
          </Link>
        </div>
      )}

      {/* Upload zone */}
      <CVUploadZone userId={user.id} />

      {/* What happens next */}
      <div style={{
        marginTop: 28,
        background: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '20px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
          What EarnGro analyses in your resume
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
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