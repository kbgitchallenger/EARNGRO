export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ATSScoreCard from '@/components/cv/ATSScoreCard'
import AnalyzeClientButton from '@/components/cv/AnalyzeClientButton'
import ParsingStatus from '@/components/cv/ParsingStatus'
import CheckoutButton from '@/components/billing/CheckoutButton'
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

  // Distinguish a genuine parse failure from "still processing" — without
  // this, both looked identical (just !version.raw_text) and a real
  // failure silently waited out ParsingStatus's full 60s timeout before
  // the user found out anything was wrong. Uses the existing repository
  // method (confirmed against resume.repository.ts) rather than a
  // duplicate inline query.
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

  // Real credit cost + balance — shown BEFORE any action, not discovered
  // after clicking. This is the actual fix for the trust gap: previously
  // this page showed a generic "Get your report" CTA with no cost and no
  // plan check at all, so a free-plan user could click through only to
  // hit a raw 403 from the API with no context.
  const [creditCost, creditBalance] = hasParsed && !isFreePlan
    ? await Promise.all([getFeatureCost('cv_analyze'), getBalance(user.id)])
    : [0, 0]

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

        {/* State 1 — Parsing (or genuinely failed). A real failure now
            surfaces immediately via parse_jobs.status rather than making
            the user wait through ParsingStatus's full timeout to find out. */}
        {isParsing && parseFailed && (
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '48px 32px', textAlign: 'center' }}>
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
            <Link href="/cv/upload" style={{ display: 'inline-flex', fontSize: 14, fontWeight: 600, color: '#fff', background: 'var(--teal)', borderRadius: 99, padding: '11px 24px', textDecoration: 'none' }}>
              Upload a different file
            </Link>
          </div>
        )}

        {isParsing && !parseFailed && <ParsingStatus />}

        {/* State 2 — Parsed, no analysis yet. Plan-aware gate replaces the
            old one-size-fits-all gradient CTA with zero cost transparency
            and zero plan check. */}
        {hasParsed && !hasAnalysis && (
          <>
            {parsed && <ProfileSummary parsed={parsed} marketScore={version.market_score} />}

            {isFreePlan ? (
              <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-xl)', padding: '32px 24px', textAlign: 'center', marginTop: 14 }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
                  Unlock your ATS Intelligence Report
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 380, margin: '0 auto 6px', lineHeight: 1.65 }}>
                  Full ATS scoring, keyword gap analysis, and market alignment against real India/SEA hiring data.
                </p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', maxWidth: 380, margin: '0 auto 22px' }}>
                  Available on the Grow plan — ₹99/month for 1,500 credits.
                </p>
                <CheckoutButton
                  type="plan_upgrade"
                  planKey="grow"
                  label="Upgrade to Grow →"
                  style={{ maxWidth: 260, margin: '0 auto', background: '#fff', color: 'var(--teal-d)' }}
                />
              </div>
            ) : (
              <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-xl)', padding: '32px 24px', textAlign: 'center', marginTop: 14 }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
                  Get your ATS Intelligence Report
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.65 }}>
                  AI analyses your resume against ATS systems, recruiter expectations, and India/SEA market demand.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 99, marginBottom: 20 }}>
                  Costs {creditCost} credits · you have {creditBalance}
                </div>
                <div>
                  {creditBalance >= creditCost ? (
                    <AnalyzeClientButton versionId={version.id} white />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 12.5, color: '#FEF3C7' }}>Not enough credits for this analysis.</div>
                      <CheckoutButton type="recharge" planKey="grow_recharge" label="Add credits →" style={{ maxWidth: 220, background: '#fff', color: 'var(--teal-d)' }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* State 3 — Analysis exists. Re-run always costs the same real
            price (cv_analyze), shown up front rather than discovered on
            click, and the gate now checks the CURRENT plan/credit reality
            instead of stale feature names that no longer match the backend. */}
        {hasAnalysis && (
          <>
            {parsed && <ProfileSummary parsed={parsed} marketScore={version.market_score} />}
            <div style={{ marginTop: 14 }}>
              <ATSScoreCard data={analysis} />
            </div>
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              {isFreePlan ? (
                <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', maxWidth: 420, margin: '0 auto' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Want to re-run this analysis?</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>Re-analysis is available on the Grow plan.</div>
                  <CheckoutButton type="plan_upgrade" planKey="grow" label="Upgrade to Grow →" />
                </div>
              ) : creditBalance >= creditCost ? (
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10 }}>
                    Update Your Resume and Re-analyze for Updated Results· you have {creditBalance}
                  </div>
                  <AnalyzeClientButton versionId={version.id} />
                </div>
              ) : (
                <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', maxWidth: 380, margin: '0 auto' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>Not enough credits to re-analyze</div>
                  <CheckoutButton type="recharge" planKey={plan === 'accelerate' ? 'accelerate_recharge' : 'grow_recharge'} label="Add credits →" />
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

// Extracted profile summary card — unchanged from before, this part was
// already good: extraction is free and always shown regardless of plan.
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