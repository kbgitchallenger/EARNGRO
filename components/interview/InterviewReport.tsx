'use client'

import Link from 'next/link'
import { INTERVIEWER_PERSONAS } from '@/lib/interview/personas'

interface Turn {
  turn_index: number
  question: string
  user_answer: string | null
  sub_scores: { structure: number; specificity: number; confidence: number; relevance: number } | null
  feedback: string | null
  improved_answer: string | null
}

interface Props {
  session: {
    id: string
    mode: string
    role: string
    industry: string
    persona: string
    overall_score: number | null
    target_dimension: string
    created_at: string
  }
  turns: Turn[]
}

const SCORE_COLOR = (s: number) =>
  s >= 70 ? 'var(--teal)' : s >= 50 ? 'var(--amber)' : 'var(--red)'

const SCORE_LABEL = (s: number) =>
  s >= 80 ? 'Strong' : s >= 60 ? 'Good' : s >= 40 ? 'Developing' : 'Needs work'

export default function InterviewReport({ session, turns }: Props) {
  const persona = INTERVIEWER_PERSONAS.find(p => p.id === session.persona) ?? INTERVIEWER_PERSONAS[0]
  const answeredTurns = turns.filter(t => t.user_answer)
  const overallScore = session.overall_score ?? 0

  const dimScores = answeredTurns.reduce(
    (acc, t) => {
      if (!t.sub_scores) return acc
      return {
        structure:   acc.structure + t.sub_scores.structure,
        specificity: acc.specificity + t.sub_scores.specificity,
        confidence:  acc.confidence + t.sub_scores.confidence,
        relevance:   acc.relevance + t.sub_scores.relevance,
        count:       acc.count + 1,
      }
    },
    { structure: 0, specificity: 0, confidence: 0, relevance: 0, count: 0 }
  )

  const avgScores = dimScores.count > 0 ? {
    structure:   Math.round(dimScores.structure / dimScores.count),
    specificity: Math.round(dimScores.specificity / dimScores.count),
    confidence:  Math.round(dimScores.confidence / dimScores.count),
    relevance:   Math.round(dimScores.relevance / dimScores.count),
  } : null

  const scoredTurns = answeredTurns.filter(t => t.sub_scores)
  const turnAvg = (t: Turn) => t.sub_scores
    ? (t.sub_scores.structure + t.sub_scores.specificity + t.sub_scores.confidence + t.sub_scores.relevance) / 4
    : 0
  const bestTurn: Turn | null = scoredTurns.length > 0
    ? scoredTurns.reduce((best, t) => turnAvg(t) > turnAvg(best) ? t : best, scoredTurns[0])
    : null
  const worstTurn: Turn | null = scoredTurns.length > 0
    ? scoredTurns.reduce((worst, t) => turnAvg(t) < turnAvg(worst) ? t : worst, scoredTurns[0])
    : null

  return (
    <>
      <style>{`
        .ir-score-hero {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .ir-score-num {
          font-family: var(--serif);
          font-size: 56px;
          font-weight: 700;
          line-height: 1;
        }
        .ir-dim-label { width: 72px; flex-shrink: 0; font-size: 11px; color: var(--muted); }
        .ir-answer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ir-question-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 12px;
          line-height: 1.5;
        }
        @media (max-width: 540px) {
          .ir-score-hero { flex-direction: column; align-items: flex-start; gap: 16px; }
          .ir-score-num  { font-size: 40px; }
          .ir-dim-label  { width: 60px; }
          .ir-answer-grid {
            grid-template-columns: 1fr;
          }
          .ir-question-text { font-size: 12px; }
        }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
              Interview Report
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
              {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)} · {session.role} · with {persona.name} ·{' '}
              {new Date(session.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <Link href="/interview" style={{
            fontSize: 13, color: 'var(--teal)', textDecoration: 'none',
            border: '1px solid var(--teal-mid)', padding: '8px 16px',
            borderRadius: 99, background: 'var(--teal-l)', whiteSpace: 'nowrap',
          }}>
            Practice again →
          </Link>
        </div>

        {/* Overall score hero */}
        <div className="ir-score-hero" style={{
          background: `linear-gradient(135deg, ${persona.color}18, ${persona.color}08)`,
          border: `1px solid ${persona.color}30`,
          borderRadius: 'var(--r-xl)', padding: '24px 20px', marginBottom: 16,
        }}>
          {/* Score circle */}
          <div style={{ textAlign: 'center', minWidth: 90 }}>
            <div className="ir-score-num" style={{ color: SCORE_COLOR(overallScore) }}>
              {overallScore}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>out of 100</div>
            <div style={{
              display: 'inline-block', marginTop: 8,
              fontSize: 11, fontWeight: 700, color: SCORE_COLOR(overallScore),
              background: `${SCORE_COLOR(overallScore)}15`,
              border: `1px solid ${SCORE_COLOR(overallScore)}30`,
              padding: '3px 10px', borderRadius: 99,
            }}>
              {SCORE_LABEL(overallScore)}
            </div>
          </div>

          {/* Dimension bars */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
              {persona.name}&apos;s assessment
            </div>
            {avgScores && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Structure',   key: 'structure'   as const },
                  { label: 'Specificity', key: 'specificity' as const },
                  { label: 'Confidence', key: 'confidence'  as const },
                  { label: 'Relevance',  key: 'relevance'   as const },
                ].map(d => (
                  <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="ir-dim-label">{d.label}</div>
                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: SCORE_COLOR(avgScores[d.key]),
                        width: `${avgScores[d.key]}%`,
                        borderRadius: 99,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: SCORE_COLOR(avgScores[d.key]), width: 28, textAlign: 'right', flexShrink: 0 }}>
                      {avgScores[d.key]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Worst answer improved */}
        {worstTurn?.improved_answer && (
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
              ✏️ Your weakest answer — improved
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Same question, rewritten using the right framework and specific language. Study this before your next real interview.
            </div>

            {/* Question — removed uppercase, normal sentence case */}
            <div style={{
              fontSize: 12, fontWeight: 600, color: 'var(--teal-d)',
              background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)',
              borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 14,
              lineHeight: 1.5,
            }}>
              Q: {worstTurn.question}
            </div>

            {/* Answer comparison — stacks to single column on mobile */}
            <div className="ir-answer-grid">
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Your answer
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.65 }}>
                  {worstTurn.user_answer}
                </div>
              </div>
              <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal-d)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Improved answer
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.65 }}>
                  {worstTurn.improved_answer}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Best answer */}
        {bestTurn && bestTurn.turn_index !== worstTurn?.turn_index && (
          <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-d)', marginBottom: 10 }}>
              ⭐ Your strongest answer
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, lineHeight: 1.5 }}>
              Q: {bestTurn.question}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.65 }}>{bestTurn.user_answer}</div>
            {bestTurn.feedback && (
              <div style={{ fontSize: 12, color: 'var(--teal-d)', marginTop: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
                💬 {bestTurn.feedback}
              </div>
            )}
          </div>
        )}

        {/* Full breakdown */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Full breakdown</div>
          {answeredTurns.map((t, i) => {
            const avg = t.sub_scores
              ? Math.round((t.sub_scores.structure + t.sub_scores.specificity + t.sub_scores.confidence + t.sub_scores.relevance) / 4)
              : null
            return (
              <div key={t.turn_index} style={{
                paddingBottom: i < answeredTurns.length - 1 ? 16 : 0,
                marginBottom: i < answeredTurns.length - 1 ? 16 : 0,
                borderBottom: i < answeredTurns.length - 1 ? '1px solid var(--border-l)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Question {t.turn_index + 1}
                  </div>
                  {avg !== null && (
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: SCORE_COLOR(avg),
                      background: `${SCORE_COLOR(avg)}12`,
                      border: `1px solid ${SCORE_COLOR(avg)}25`,
                      padding: '2px 10px', borderRadius: 99, flexShrink: 0,
                    }}>
                      {avg}/100
                    </div>
                  )}
                </div>
                <div className="ir-question-text">{t.question}</div>
                {t.feedback && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic', marginTop: 4 }}>
                    💬 {t.feedback}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Practice again CTA */}
        <div style={{ background: 'linear-gradient(135deg, var(--teal-d), var(--teal))', borderRadius: 'var(--r-xl)', padding: '28px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎤</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(16px,3vw,20px)', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Ready to improve?
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', maxWidth: 340, margin: '0 auto 18px', lineHeight: 1.65 }}>
            Professionals who practice weekly close their gap 3× faster. Your next session will target what moved least today.
          </p>
          <Link href="/interview" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#fff', color: 'var(--teal-d)',
            fontSize: 14, fontWeight: 700, padding: '12px 26px',
            borderRadius: 99, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}>
            Practice again →
          </Link>
        </div>

      </div>
    </>
  )
}