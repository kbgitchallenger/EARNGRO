//app/components/cv/ATSScoreCard.tsx
'use client'

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
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill={color} fontFamily="var(--serif)">{score}</text>
      </svg>
      <span style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>{label}</span>
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

const scoreColor = (s: number) => s >= 70 ? 'var(--teal)' : s >= 45 ? 'var(--amber)' : 'var(--red)'
const weightColor: Record<string, string> = { critical: '#dc2626', high: '#e8922a', medium: '#0891b2', low: 'var(--muted)' }

export default function ATSScoreCard({ data }: { data: ATSData }) {
  const composite = data.composite_score ?? Math.round(
    data.ats_score * 0.35 + data.recruiter_score * 0.25 +
    data.market_alignment * 0.25 + data.hiring_probability * 0.15
  )
  const found = data.keyword_matches?.filter(k => k.found) ?? []
  const missing = data.keyword_matches?.filter(k => !k.found) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Composite + 4 scores */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ background: `linear-gradient(135deg, ${scoreColor(composite)}22, ${scoreColor(composite)}08)`, border: `1px solid ${scoreColor(composite)}40`, borderRadius: 'var(--r-lg)', padding: '16px 20px', textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 42, fontWeight: 700, color: scoreColor(composite), lineHeight: 1 }}>{composite}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Overall Score</div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            <ScoreRing score={data.ats_score} label="ATS Pass" color={scoreColor(data.ats_score)} />
            <ScoreRing score={data.recruiter_score} label="Recruiter" color={scoreColor(data.recruiter_score)} />
            <ScoreRing score={data.market_alignment} label="Market Fit" color={scoreColor(data.market_alignment)} />
            <ScoreRing score={data.hiring_probability} label="Hire Chance" color={scoreColor(data.hiring_probability)} />
          </div>
        </div>
        {data.ai_summary && (
          <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            💡 {data.ai_summary}
          </div>
        )}
      </div>

            {/* Section scores + Keywords — 2 column on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }} className="ats-2col">

        {/* Section scores */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>Section breakdown</div>
          {Object.entries(data.section_scores ?? {}).map(([k, v]) => (
            <Bar key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v as number} color={scoreColor(v as number)} />
          ))}
        </div>

      {/* Keywords */}
      {/* Keywords */}
        {data.keyword_matches?.length > 0 && (
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>
            Keywords — {found.length}/{data.keyword_matches.length} found
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ height: '100%', background: 'var(--teal)', width: `${(found.length / data.keyword_matches.length) * 100}%`, borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.keyword_matches.map((k, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99, border: `1px solid ${k.found ? weightColor[k.weight] + '40' : 'var(--border)'}`, background: k.found ? weightColor[k.weight] + '12' : 'var(--paper-2)', color: k.found ? weightColor[k.weight] : 'var(--muted)', textDecoration: k.found ? 'none' : 'line-through' }}>
                {k.keyword}
              </span>
            ))}
          </div>
          {missing.filter(k => k.weight === 'critical' || k.weight === 'high').length > 0 && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--red)' }}>
              ⚠️ Missing critical keywords: {missing.filter(k => k.weight === 'critical' || k.weight === 'high').map(k => k.keyword).join(', ')}
            </div>
          )}
        </div>
      )}
        </div>
      {/* Strengths + Issues */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-d)', marginBottom: 10 }}>✅ Strengths</div>
          {data.strengths?.map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--ink)', padding: '5px 0', borderBottom: i < data.strengths.length - 1 ? '1px solid var(--teal-mid)' : 'none', lineHeight: 1.5 }}>{s}</div>
          ))}
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r-lg)', padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginBottom: 10 }}>⚠️ Critical issues</div>
          {data.critical_issues?.map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--ink)', padding: '5px 0', borderBottom: i < data.critical_issues.length - 1 ? '1px solid #fecaca' : 'none', lineHeight: 1.5 }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      {data.improvements?.length > 0 && (
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>AI improvements</div>
          {data.improvements.map((imp, i) => (
            <div key={i} style={{ paddingBottom: i < data.improvements.length - 1 ? 14 : 0, marginBottom: i < data.improvements.length - 1 ? 14 : 0, borderBottom: i < data.improvements.length - 1 ? '1px solid var(--border-l)' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{imp.section}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, padding: '8px 10px', background: '#fef2f2', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--red)' }}>
                {imp.current}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink)', padding: '8px 10px', background: 'var(--teal-xl)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--teal)' }}>
                {imp.improved}
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 860px) {
          .ats-2col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}