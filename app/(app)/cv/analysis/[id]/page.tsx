import { redirect, notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { resumeRepository } from '@/repositories/resume.repository'
import { analysisRepository } from '@/repositories/analysis.repository'

import { atsService } from '@/services/ats.service'

import ATSScoreCard from '@/components/cv/ATSScoreCard'

import type {
  ParsedResume,
} from '@/lib/ai/validators/resume.validator'

export default async function CVAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  // ── Auth ─────────────────────────────────────────────────────

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ── Resume Version ───────────────────────────────────────────

  const version = await resumeRepository.findById(id)

  if (!version || version.user_id !== user.id) {
    notFound()
  }

  // ── Latest Analysis ──────────────────────────────────────────

  let analysis =
    await analysisRepository.findLatestByVersion(id)

  // ── Auto-generate analysis if missing ────────────────────────

  if (!analysis && version.raw_text) {
    try {

      analysis = await atsService.score(
        id,
        user.id,
        version.raw_text,
        null,
        null,
        null
      )

    } catch (err) {
      console.error('ATS generation failed:', err)
    }
  }

  // ── Parsed Resume ────────────────────────────────────────────

  const parsed =
    version.parsed_data as ParsedResume | null

  // ── Null-safe analysis mapping ───────────────────────────────

  type NullableNumbers = {
    composite_score?: number | null
    ats_score?: number | null
    recruiter_score?: number | null
    market_alignment?: number | null
    hiring_probability?: number | null
  }

  const raw =
    analysis as (typeof analysis & NullableNumbers) | null

  const analysisWithDefaults = raw
    ? {
        ...raw,

        composite_score:
          raw.composite_score ?? 0,

        ats_score:
          raw.ats_score ?? 0,

        recruiter_score:
          raw.recruiter_score ?? 0,

        market_alignment:
          raw.market_alignment ?? 0,

        hiring_probability:
          raw.hiring_probability ?? 0,

        keyword_matches:
          raw.keyword_matches ?? [],

        keyword_gaps:
          raw.keyword_gaps ?? [],

        strengths:
          raw.strengths ?? [],

        critical_issues:
          raw.critical_issues ?? [],

        improvements:
          raw.improvements ?? [],

        ai_summary:
          raw.ai_summary ?? '',

        section_scores:
          raw.section_scores ?? {
            summary: 0,
            experience: 0,
            skills: 0,
            education: 0,
            formatting: 0,
          },
      }
    : null

  // ── Render ───────────────────────────────────────────────────

  return (
    <div>

      {/* ── Header ───────────────────────────────────────────── */}

      <div style={{ marginBottom: 28 }}>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
          }}
        >

          <a
            href="/cv/history"
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              textDecoration: 'none',
            }}
          >
            ← All versions
          </a>

          <span
            style={{
              fontSize: 12,
              color: 'var(--border)',
            }}
          >
            |
          </span>

          <span
            style={{
              fontSize: 12,
              color: 'var(--muted)',
            }}
          >
            {version.name ??
              `Resume v${version.version_number}`}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >

          <div>

            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(22px,3vw,30px)',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: 4,
                letterSpacing: -0.3,
              }}
            >
              {parsed?.name ?? 'Resume'}
              {' '}
              — Market Intelligence
            </h1>

            <p
              style={{
                fontSize: 13,
                color: 'var(--muted)',
                fontWeight: 300,
              }}
            >
              {parsed?.primary_role ??
                'Professional'}

              {' · '}

              {parsed?.total_experience_years ??
                '—'}

              {' years experience · Uploaded '}

              {new Date(
                version.created_at
              ).toLocaleDateString(
                'en-IN',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }
              )}
            </p>

          </div>

          {version.market_score && (

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--teal-l)',
                border:
                  '1px solid var(--teal-mid)',
                borderRadius: 99,
                padding: '8px 16px',
              }}
            >

              <span
                style={{
                  fontSize: 11,
                  color: 'var(--teal-d)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Market Score
              </span>

              <span
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--teal-d)',
                }}
              >
                {version.market_score}
              </span>

            </div>
          )}

        </div>
      </div>

      {/* ── Empty State ───────────────────────────────────────── */}

      {!analysis && (

        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >

          <div
            style={{
              fontSize: 44,
              marginBottom: 16,
            }}
          >
            🔍
          </div>

          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: 8,
            }}
          >
            Analysis pending
          </h2>

          <p
            style={{
              fontSize: 14,
              color: 'var(--muted)',
              maxWidth: 360,
              margin: '0 auto 24px',
              lineHeight: 1.7,
            }}
          >
            Your resume is still being processed.
            Refresh in a moment or upload again
            if it is taking too long.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
            }}
          >

            <a
              href={`/cv/analysis/${id}`}
              style={{
                background: 'var(--teal)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                padding: '11px 22px',
                borderRadius: 99,
                textDecoration: 'none',
              }}
            >
              Refresh
            </a>

            <a
              href="/cv/upload"
              style={{
                background: 'var(--paper)',
                color: 'var(--muted)',
                fontSize: 14,
                padding: '11px 22px',
                borderRadius: 99,
                textDecoration: 'none',
                border:
                  '1px solid var(--border)',
              }}
            >
              Upload again
            </a>

          </div>
        </div>
      )}

      {/* ── ATS Score Card ────────────────────────────────────── */}

      {analysisWithDefaults && (
        <ATSScoreCard
          data={analysisWithDefaults}
        />
      )}

    </div>
  )
}