//components/cv/ATSScoreCard.tsx
'use client'

import { useState } from 'react'
import CountUpNumber from '@/components/shared/CountUpNumber'
import ShowMoreList from '@/components/shared/ShowMoreList'
import PremiumHero from '@/components/ui/PremiumHero'

interface KeywordMatch {
  keyword: string
  found: boolean
  weight: 'critical' | 'high' | 'medium' | 'low'
}

interface SectionScores {
  summary: number
  experience: number
  skills: number
  education: number
  formatting: number
}

interface Improvement {
  section: string
  current: string
  improved: string
}

interface ATSData {
  ats_score: number
  recruiter_score: number
  market_alignment: number
  hiring_probability: number
  composite_score: number
  keyword_matches: KeywordMatch[]
  section_scores: SectionScores
  strengths: string[]
  critical_issues: string[]
  improvements: Improvement[]
  ai_summary: string
}

const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label={`${label}: ${score} out of 100`}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="#fff" strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff" fontFamily="var(--serif)">{score}</text>
      </svg>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

const Bar = ({ label, value, color = 'var(--teal)' }: { label: string; value: number; color?: string }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}/100</span>
    </div>
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', background: color, width: `${value}%`, borderRadius: 99, transition: 'width 0.8s ease' }} />
    </div>
  </div>
)

const PanelHead = ({ icon, iconColor, iconBg, title }: { icon: string; iconColor: string; iconBg: string; title: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
    <span style={{ fontSize: 13, width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: iconColor, background: iconBg }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{title}</span>
  </div>
)

const scoreColor = (s: number) => s >= 70 ? 'var(--teal)' : s >= 45 ? 'var(--amber)' : 'var(--red)'
const weightColor: Record<string, string> = { critical: 'var(--red)', high: 'var(--amber)', medium: '#0891b2', low: 'var(--muted)' }

export default function ATSScoreCard({ data }: { data: ATSData }) {
  const [showAllKeywords, setShowAllKeywords] = useState(false)
  const composite = data.composite_score ?? Math.round(
    data.ats_score * 0.35 + data.recruiter_score * 0.25 +
    data.market_alignment * 0.25 + data.hiring_probability * 0.15
  )
  const found = data.keyword_matches?.filter(k => k.found) ?? []
  const missing = data.keyword_matches?.filter(k => !k.found) ?? []
  const KEYWORD_CAP = 18
  const visibleKeywords = showAllKeywords ? data.keyword_matches : data.keyword_matches?.slice(0, KEYWORD_CAP)
  const hiddenKeywordCount = (data.keyword_matches?.length ?? 0) - KEYWORD_CAP

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Composite + 4 scores */}
      <PremiumHero style={{ marginBottom: 14, flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, lineHeight: 1 }}>
              <CountUpNumber value={composite} style={{ fontSize: 44, color: '#fff' }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall Score</div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }} className="ats-rings-grid">
            <ScoreRing score={data.ats_score} label="ATS Pass" color={scoreColor(data.ats_score)} />
            <ScoreRing score={data.recruiter_score} label="Recruiter" color={scoreColor(data.recruiter_score)} />
            <ScoreRing score={data.market_alignment} label="Market Fit" color={scoreColor(data.market_alignment)} />
            <ScoreRing score={data.hiring_probability} label="Hire Chance" color={scoreColor(data.hiring_probability)} />
          </div>
        </div>
        {data.ai_summary && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
            💡 {data.ai_summary}
          </div>
        )}
      </PremiumHero>

      {/* Section scores + Keywords — 2 column on desktop, stacks on tablet portrait & phone */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }} className="ats-2col">

        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <PanelHead icon="📐" iconColor="var(--blue)" iconBg="var(--blue-l)" title="Section breakdown" />
          {Object.entries(data.section_scores ?? {}).map(([k, v]) => (
            <Bar key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v as number} color={scoreColor(v as number)} />
          ))}
        </div>

        {data.keyword_matches?.length > 0 && (
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            <PanelHead icon="🔑" iconColor="var(--purple)" iconBg="var(--purple-l)" title={`Keywords — ${found.length}/${data.keyword_matches.length} found`} />
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ height: '100%', background: 'var(--teal)', width: `${(found.length / data.keyword_matches.length) * 100}%`, borderRadius: 99 }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {visibleKeywords.map((k, i) => (
                <span key={i} className="ats-keyword-chip" style={{ border: `1px solid ${k.found ? weightColor[k.weight] : 'var(--border)'}`, background: k.found ? weightColor[k.weight] : 'var(--paper-2)', color: k.found ? '#fff' : 'var(--muted)', textDecoration: k.found ? 'none' : 'line-through' }}>
                  {k.keyword}
                </span>
              ))}
            </div>
            {hiddenKeywordCount > 0 && !showAllKeywords && (
              <button onClick={() => setShowAllKeywords(true)} className="ats-show-more-btn">
                +{hiddenKeywordCount} more →
              </button>
            )}
            {missing.filter(k => k.weight === 'critical' || k.weight === 'high').length > 0 && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--red-l)', border: '1px solid var(--red-mid)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--red)' }}>
                ⚠️ Missing critical keywords: {missing.filter(k => k.weight === 'critical' || k.weight === 'high').map(k => k.keyword).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Strengths + Issues */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="ats-strengths-grid">
        <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: 18 }}>
          <PanelHead icon="✅" iconColor="var(--teal-d)" iconBg="var(--teal-l)" title="Strengths" />
          {data.strengths?.length > 0 && (
            <ShowMoreList
              items={data.strengths}
              defaultCount={3}
              itemLabel="strength"
              renderItem={(s, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--ink)', padding: '5px 0', borderBottom: i < data.strengths.length - 1 ? '1px solid var(--teal-mid)' : 'none', lineHeight: 1.5 }}>{s}</div>
              )}
            />
          )}
        </div>
        <div style={{ background: 'var(--red-l)', border: '1px solid var(--red-mid)', borderRadius: 'var(--r-lg)', padding: 18 }}>
          <PanelHead icon="⚠️" iconColor="var(--red)" iconBg="#fff" title="Critical issues" />
          {data.critical_issues?.length > 0 && (
            <ShowMoreList
              items={data.critical_issues}
              defaultCount={3}
              itemLabel="issue"
              renderItem={(s, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--ink)', padding: '5px 0', borderBottom: i < data.critical_issues.length - 1 ? '1px solid var(--red-mid)' : 'none', lineHeight: 1.5 }}>{s}</div>
              )}
            />
          )}
        </div>
      </div>

      {/* Improvements */}
      {data.improvements?.length > 0 && (
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <PanelHead icon="✨" iconColor="var(--amber-d)" iconBg="var(--amber-l)" title="AI improvements" />
          <ShowMoreList
            items={data.improvements}
            defaultCount={2}
            itemLabel="improvement"
            renderItem={(imp, i) => (
              <div key={i} style={{ paddingBottom: i < data.improvements.length - 1 ? 14 : 0, marginBottom: i < data.improvements.length - 1 ? 14 : 0, borderBottom: i < data.improvements.length - 1 ? '1px solid var(--border-l)' : 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{imp.section}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, padding: '8px 10px', background: 'var(--red-l)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--red)' }}>
                  {imp.current}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink)', padding: '8px 10px', background: 'var(--teal-xl)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--teal)' }}>
                  {imp.improved}
                </div>
              </div>
            )}
          />
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .ats-2col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .ats-strengths-grid { grid-template-columns: 1fr !important; }
        }
        /* FIX: the previous middle tier (481-599px: keep 4 columns, just
           shrink each ring's SVG to a hard-coded 56px) had a hidden
           minimum-width problem — 4×56px rings + 3 grid gaps + the 100px
           composite-score block sitting next to them adds up to more
           width than many real phones actually have available inside
           the card's padding, even after the shrink. The grid can't
           shrink columns below that fixed 56px SVG size, so it just
           overflowed instead of wrapping — confirmed by screenshots
           showing rings and "Recruiter"/"Hire Chance" labels clipped at
           the card edge. Removed that fragile tier entirely: now it's a
           single, higher breakpoint (960px) straight from 4 columns to
           2, always at full 72px ring size — no dependency on a shrink
           hack surviving on every real device width. */
        @media (max-width: 960px) {
          .ats-rings-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
        }
        .ats-keyword-chip { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 99px; transition: transform 0.12s ease; }
        .ats-keyword-chip:hover { transform: translateY(-1px); }
        .ats-show-more-btn { display: inline-flex; margin-top: 10px; font-size: 11.5px; font-weight: 600; color: var(--teal); background: none; border: none; cursor: pointer; padding: 4px 0; }
        .ats-show-more-btn:hover { color: var(--teal-d); text-decoration: underline; }
      `}</style>
    </div>
  )
}