//app/(app)/cv/analysis/[id]/page.tsx
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ATSScoreCard from '@/components/cv/ATSScoreCard'
import AnalyzeClientButton from '@/components/cv/AnalyzeClientButton'
import ParsingStatus from '@/components/cv/ParsingStatus'
import CheckoutButton from '@/components/billing/CheckoutButton'
import PremiumHero from '@/components/ui/PremiumHero'
import { getBalance, getFeatureCost } from '@/services/credits.service'
import { resumeRepository } from '@/repositories/resume.repository'

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

  const parseJob = await resumeRepository.getParseJobByVersion(id)
  const parseFailed = parseJob?.status === 'failed'
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

  const isParsing = !version.raw_text
  const hasParsed = !!version.raw_text
  const hasAnalysis = !!analysis
  const plan = profile?.plan ?? 'free'
  const isFreePlan = plan === 'free'

  const [creditCost, creditBalance] = hasParsed && !isFreePlan
    ? await Promise.all([getFeatureCost('cv_analyze'), getBalance(user.id)])
    : [0, 0]

  let scoreDelta: number | null = null
  if (hasAnalysis && version.market_score != null) {
    const { data: priorVersion } = await supabase
      .from('cv_versions')
      .select('market_score')
      .eq('user_id', user.id)
      .neq('id', version.id)
      .not('market_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (priorVersion?.market_score != null) {
      scoreDelta = version.market_score - priorVersion.market_score
    }
  }

  return (
    <div className="cva-page">

      {/* Header */}
      <div className="cva-header">
        <div>
          <div className="cva-crumb">
            <Link href="/cv/history" className="cva-crumb-link">← All versions</Link>
            {' / '}
            <span>{version.name ?? `Resume v${version.version_number}`}</span>
          </div>
          <h1 className="cva-title">
            {parsed?.name ? `${parsed.name} — Market Intelligence` : version.name ?? `Resume v${version.version_number}`}
          </h1>
          <div className="cva-meta">
            {parsed?.total_experience_years ? `${parsed.total_experience_years} years experience · ` : ''}
            Uploaded {new Date(version.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <Link href="/cv/upload" className="cva-upload-btn">Upload new version</Link>
      </div>

      {/* ── State 1 — Parsing / genuine failure ── */}
      {isParsing && parseFailed && (
        <div className="cva-section" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
            We couldn't read this resume
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 380, margin: '0 auto 8px', lineHeight: 1.7 }}>
            {parseJob?.error_message ?? 'Something went wrong extracting text from your file.'}
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--muted-l)', maxWidth: 380, margin: '0 auto 24px' }}>
            Common causes: a scanned/image-only PDF, a password-protected file, or an unsupported format.
          </p>
          <Link href="/cv/upload" className="cva-cta-solid">Upload a different file</Link>
        </div>
      )}

      {isParsing && !parseFailed && (
        <div className="cva-section">
          <ParsingStatus />
        </div>
      )}

      {/* ── State 2 — Parsed, no analysis yet ── */}
      {hasParsed && !hasAnalysis && (
        <>
          {parsed && <ProfileSummary parsed={parsed} marketScore={version.market_score} />}

          <div className="cva-section" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'none', background: 'transparent' }}>
            <PremiumHero>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
                {isFreePlan ? 'Unlock your ATS Intelligence Report' : 'Get your ATS Intelligence Report'}
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 380, margin: '0 auto 6px', lineHeight: 1.65 }}>
                {isFreePlan
                  ? 'Full ATS scoring, keyword gap analysis, and market alignment against real India/SEA hiring data.'
                  : 'AI analyses your resume against ATS systems, recruiter expectations, and India/SEA market demand.'}
              </p>

              {isFreePlan ? (
                <>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', maxWidth: 380, margin: '0 auto 22px' }}>
                    Available on the Grow plan — ₹99/month for 1,500 credits.
                  </p>
                  <CheckoutButton
                    type="plan_upgrade"
                    planKey="grow"
                    label="Upgrade to Grow →"
                    style={{ maxWidth: 260, margin: '0 auto', background: '#fff', color: 'var(--teal-d)' }}
                  />
                </>
              ) : (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 99, marginBottom: 20 }}>
                    Costs {creditCost} credits · you have {creditBalance}
                  </div>
                  <div>
                    {creditBalance >= creditCost ? (
                      <AnalyzeClientButton versionId={version.id} white plan={plan} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 12.5, color: '#FEF3C7' }}>Not enough credits for this analysis.</div>
                        <CheckoutButton type="recharge" planKey="grow_recharge" label="Add credits →" style={{ maxWidth: 220, background: '#fff', color: 'var(--teal-d)' }} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </PremiumHero>
          </div>
        </>
      )}

      {/* ── State 3 — Analysis exists ── */}
      {hasAnalysis && (
        <>
          {parsed && <ProfileSummary parsed={parsed} marketScore={version.market_score} />}

          {scoreDelta !== null && scoreDelta > 0 && (
            <div className="cva-delta-strip">
              ◈ Your market score is up {scoreDelta} point{scoreDelta === 1 ? '' : 's'} since your last upload.
            </div>
          )}

          <div className="cva-section">
            <div className="cva-section-head">
              <div className="cva-section-head-row"><span className="cva-section-icon" style={{ color: 'var(--teal-d)', background: 'var(--teal-l)' }}>📋</span><h2 className="cva-section-title">ATS Intelligence Report</h2></div>
              <p className="cva-section-sub">Full scoring, keyword gaps, and market alignment for this version</p>
            </div>
            <ATSScoreCard data={analysis} />
          </div>

          <div className="cva-section" style={{ textAlign: 'center' }}>
            {isFreePlan ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Want to re-run this analysis?</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>Re-analysis is available on the Grow plan.</div>
                <CheckoutButton type="plan_upgrade" planKey="grow" label="Upgrade to Grow →" />
              </>
            ) : creditBalance >= creditCost ? (
              <>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10 }}>
                  Update your resume and re-analyze for updated results · you have {creditBalance} credits
                </div>
                <AnalyzeClientButton versionId={version.id} plan={plan} />
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>Not enough credits to re-analyze</div>
                <CheckoutButton type="recharge" planKey={plan === 'accelerate' ? 'accelerate_recharge' : 'grow_recharge'} label="Add credits →" />
              </>
            )}
          </div>
        </>
      )}

      <style>{`
        .cva-page { max-width: 900px; margin: 0 auto; padding: 0 0 60px; background: #ffffff !important; }
        .cva-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
        .cva-crumb { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
        .cva-crumb-link { color: var(--teal); text-decoration: none; }
        .cva-title { font-family: var(--serif); font-size: clamp(18px,3vw,26px); font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .cva-meta { font-size: 12px; color: var(--muted); }
        .cva-upload-btn { font-size: 13px; font-weight: 500; color: var(--muted); border: 1px solid var(--border); border-radius: 99px; padding: 8px 16px; text-decoration: none; transition: all 0.15s ease; }
        .cva-upload-btn:hover { border-color: var(--border-d); color: var(--ink); background: var(--paper-2); }

        .cva-section { background: #fff; border: 1px solid var(--border); border-radius: var(--r-xl); padding: 26px 28px; box-shadow: var(--shadow-sm); margin-bottom: 22px; }
        .cva-section:last-child { margin-bottom: 0; }
        .cva-section-head { display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px; }
        .cva-section-head-row { display: flex; align-items: center; gap: 10px; }
        .cva-section-icon { font-size: 14px; line-height: 1; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cva-section-title { font-family: var(--serif); font-size: 18px; font-weight: 600; color: var(--ink); margin: 0; }
        .cva-section-sub { font-size: 12px; color: var(--muted); margin: 0 0 0 38px; }

        .cva-delta-strip { display: flex; align-items: center; gap: 10px; background: var(--amber-l); border: 1px solid var(--amber-mid); border-radius: var(--r-lg); padding: 12px 16px; font-size: 13px; color: var(--amber-d); margin-bottom: 22px; }

        .cva-profile-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap: 14px; }
        .cva-skill-chip { display: inline-block; font-size: 10.5px; font-weight: 500; padding: 3px 10px; background: var(--teal-l); border: 1px solid var(--teal-mid); color: var(--teal-d); border-radius: 99px; margin: 0 5px 5px 0; }

        .cva-cta-solid { display: inline-flex; font-size: 14px; font-weight: 600; color: #fff; background: var(--teal); border-radius: 99px; padding: 11px 24px; text-decoration: none; transition: background 0.15s ease; }
        .cva-cta-solid:hover { background: var(--teal-d); }

        @media (max-width: 600px) { .cva-page { padding-left: 4px; padding-right: 4px; } }
      `}</style>
    </div>
  )
}

// Profile summary — now a proper v2 card section (icon header + tinted
// sub-boxes) instead of two bare bordered divs with no section context.
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
    <div className="cva-section">
      <div className="cva-section-head">
        <div className="cva-section-head-row"><span className="cva-section-icon" style={{ color: 'var(--blue)', background: 'var(--blue-l)' }}>🪪</span><h2 className="cva-section-title">Your Profile</h2></div>
        <p className="cva-section-sub">Extracted directly from your uploaded resume</p>
      </div>

      <div className="cva-profile-grid">
        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-lg)', padding: 18 }}>
          {parsed.name && <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{parsed.name}</div>}
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
              <span key={i} className="cva-skill-chip">{s}</span>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-lg)', padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Market score</div>
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
    </div>
  )
}