export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ATSScoreCard from '@/components/cv/ATSScoreCard'
import AnalyzeClientButton from '@/components/cv/AnalyzeClientButton'
import RefreshButton from '@/components/cv/RefreshButton'
import LimitReachedCard from '@/components/shared/LimitReachedCard'
import { hasUsedFeature, canAfford } from '@/services/credits.service'

export default async function CVAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const { data: version } = await supabase
    .from('cv_versions')
    .select('id, name, version_number, source, market_score, created_at, raw_text, parsed_data, file_name')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!version) redirect('/cv/history')

  const { data: analysis } = await supabase
    .from('cv_analyses')
    .select('*')
    .eq('cv_version_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const parsed = version.parsed_data as {
    name?: string
    email?: string
    phone?: string
    location?: string
    skills?: string[]
    experience?: { role: string; company: string }[]
    total_experience_years?: number
  } | null

  // Determine page state
  const isParsing = !version.raw_text
  const hasParsed = !!version.raw_text
  const hasAnalysis = !!analysis

  // ── Eligibility check — only matters if analysis already exists (re-run) ──
  const plan = profile?.plan ?? 'free'
  let canReanalyze = true
  let limitReason: 'FREE_LIMIT_REACHED' | 'INSUFFICIENT_CREDITS' | null = null

  if (hasAnalysis) {
    if (plan === 'free') {
      const alreadyUsed = await hasUsedFeature(user.id, 'cv_parse_analyze')
      if (alreadyUsed) {
        canReanalyze = false
        limitReason = 'FREE_LIMIT_REACHED'
      }
    } else {
      const affordable = await canAfford(user.id, 'ats_reanalyze')
      if (!affordable) {
        canReanalyze = false
        limitReason = 'INSUFFICIENT_CREDITS'
      }
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 80px' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
            <Link href="/cv/history" style={{ color: 'var(--teal)', textDecoration: 'none' }}>
              ← All versions
            </Link>
            {' / '}
            <span>{version.name ?? `Resume v${version.version_number}`}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            {parsed?.name ? `${parsed.name} — Market Intelligence` : version.name ?? `Resume v${version.version_number}`}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {parsed?.total_experience_years ? `${parsed.total_experience_years} years experience · ` : ''}
            Uploaded {new Date(version.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <Link href="/cv/upload" style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 99, padding: '8px 16px', textDecoration: 'none' }}>
          Upload new version
        </Link>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* State 1 — Still parsing */}
        {isParsing && (
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
              Analysis pending
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.7 }}>
              Your resume is still being processed. Refresh in a moment or upload again if it is taking too long.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <RefreshButton />
              <Link href="/cv/upload" style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 99, padding: '11px 22px', textDecoration: 'none' }}>
                Upload again
              </Link>
            </div>
          </div>
        )}

        {/* State 2 — Parsed, no analysis yet — always allowed, never gated */}
        {hasParsed && !hasAnalysis && (
          <>
            {parsed && <ProfileSummary parsed={parsed} marketScore={version.market_score} />}
            <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-xl)', padding: '32px 24px', textAlign: 'center', marginTop: 14 }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
                Get your ATS Intelligence Report
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.65 }}>
                AI analyses your resume against ATS systems, recruiter expectations, and India/SEA market demand.
              </p>
              <AnalyzeClientButton versionId={version.id} white />
            </div>
          </>
        )}

        {/* State 3 — Analysis exists — show results, gate re-run if limit hit */}
        {hasAnalysis && (
          <>
            {parsed && <ProfileSummary parsed={parsed} marketScore={version.market_score} />}
            <div style={{ marginTop: 14 }}>
              <ATSScoreCard data={analysis} />
            </div>
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              {canReanalyze ? (
                <AnalyzeClientButton versionId={version.id} />
              ) : (
                <LimitReachedCard reason={limitReason ?? 'FREE_LIMIT_REACHED'} feature="cv_analysis" />
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

// Extracted profile summary card
function ProfileSummary({
  parsed,
  marketScore,
}: {
  parsed: {
    name?: string
    email?: string
    location?: string
    skills?: string[]
    experience?: { role: string; company: string }[]
    total_experience_years?: number
  }
  marketScore?: number
}) {
  const scoreColor = !marketScore ? 'var(--muted)'
    : marketScore >= 70 ? 'var(--teal)'
    : marketScore >= 45 ? 'var(--amber)'
    : 'var(--red)'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12, marginBottom: 4 }}>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Extracted profile</div>
        {parsed.name && <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{parsed.name}</div>}
        {parsed.email && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>✉ {parsed.email}</div>}
        {parsed.location && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>📍 {parsed.location}</div>}
        {parsed.total_experience_years != null && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>💼 {parsed.total_experience_years} years experience</div>
        )}
        {parsed.experience?.[0] && (
          <div style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 10 }}>
            Latest: <strong>{parsed.experience[0].role}</strong> @ {parsed.experience[0].company}
          </div>
        )}
        <div>
          {parsed.skills?.slice(0, 10).map((s, i) => (
            <span key={i} style={{ display: 'inline-block', fontSize: 10, padding: '2px 8px', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', color: 'var(--teal-d)', borderRadius: 99, margin: '0 4px 4px 0' }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Market score</div>
        {marketScore ? (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 42, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
              {marketScore}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, marginBottom: 12 }}>out of 100</div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: scoreColor, width: `${marketScore}%`, borderRadius: 99 }} />
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Run ATS analysis to calculate your market score
          </div>
        )}
      </div>
    </div>
  )
}
