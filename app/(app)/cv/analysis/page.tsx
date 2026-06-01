
// Inline client component for the analyze button
import AnalyzeClientButton from '@/components/cv/AnalyzeClientButton'
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ATSScoreCard from '@/components/cv/ATSScoreCard'

export default async function CVAnalysisPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: version } = await supabase
    .from('cv_versions')
    .select('id, name, version_number, source, market_score, created_at, raw_text, parsed_data, file_name')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!version) redirect('/cv/upload')

  const { data: analysis } = await supabase
    .from('cv_analyses')
    .select('*')
    .eq('cv_version_id', params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const parsed = version.parsed_data as {
    name?: string
    email?: string
    phone?: string
    location?: string
    skills?: string[]
    experience?: { role: string; company: string }[]
    total_experience_years?: number
  } | null

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 80px' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
            <Link href="/cv/history" style={{ color: 'var(--teal)', textDecoration: 'none' }}>← Resume history</Link>
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            {version.name ?? `Resume v${version.version_number}`}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {version.file_name} · {new Date(version.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!analysis && version.raw_text && (
            <AnalyzeButton versionId={version.id} />
          )}
          <Link href="/cv/upload" style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 99, padding: '8px 16px', textDecoration: 'none' }}>
            Upload new version
          </Link>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14, marginBottom: 20 }}>
        {/* Parsed summary */}
        {parsed && (
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Extracted profile</div>
            {parsed.name && <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{parsed.name}</div>}
            {parsed.email && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>✉ {parsed.email}</div>}
            {parsed.location && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>📍 {parsed.location}</div>}
            {parsed.total_experience_years != null && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>💼 {parsed.total_experience_years} years experience</div>}
            {parsed.experience?.[0] && (
              <div style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 10 }}>
                Latest: <strong>{parsed.experience[0].role}</strong> @ {parsed.experience[0].company}
              </div>
            )}
            {parsed.skills?.slice(0, 10).map((s, i) => (
              <span key={i} style={{ display: 'inline-block', fontSize: 10, padding: '2px 8px', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', color: 'var(--teal-d)', borderRadius: 99, margin: '0 4px 4px 0' }}>{s}</span>
            ))}
          </div>
        )}

        {/* Market score */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Market score</div>
          {version.market_score ? (
            <>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 42, fontWeight: 700, color: version.market_score >= 70 ? 'var(--teal)' : version.market_score >= 45 ? 'var(--amber)' : 'var(--red)', lineHeight: 1 }}>
                {version.market_score}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>out of 100</div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginTop: 12 }}>
                <div style={{ height: '100%', background: 'var(--teal)', width: `${version.market_score}%`, borderRadius: 99 }} />
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Run ATS analysis to get your score</div>
          )}
        </div>
      </div>

      {/* ATS Results or CTA */}
      <div style={{ padding: '0 20px' }}>
        {analysis ? (
          <ATSScoreCard data={analysis} />
        ) : (
          <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-xl)', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
              Get your ATS Intelligence Report
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.65 }}>
              AI analyses your resume against ATS systems, recruiter expectations, and India/SEA market demand.
            </p>
            <AnalyzeButton versionId={version.id} white />
          </div>
        )}
      </div>
    </div>
  )
}

function AnalyzeButton({ versionId, white }: { versionId: string; white?: boolean }) {
  return (
    <form action={`/api/cv/analyze`} method="POST">
      <input type="hidden" name="versionId" value={versionId} />
      <AnalyzeClientButton versionId={versionId} white={white} />
    </form>
  )
}
