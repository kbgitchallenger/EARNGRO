//app/components/gap/GapPage.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getChangeNarrative, type ChangeNarrative } from '@/lib/growdna/changeNarrative'
import ChangeNarrativeCard from '@/components/shared/ChangeNarrativeCard'

// ── Types ────────────────────────────────────────────────────────
interface DimensionScores {
  market_alignment: number
  skill_premium: number
  visibility: number
  mobility: number
  negotiation: number
}

interface Attempt {
  id: string
  attempt_number: number
  created_at: string
  industry: string
  experience: string
  role: string
  city: string
  current_salary: number
  target_salary: number
  earning_gap: number
  hrs_score: number
  months_to_close: number
  career_archetype: string
  salary_range_min: number
  salary_range_max: number
  dimension_scores: DimensionScores
  gap_reasons: string[]
  close_actions: { action: string; impact: string; timeline: string }[]
  raw_ai_response: {
    peer_comparison?: string
    market_insight?: string
    top_strengths?: string[]
    immediate_actions?: { action: string; impact: string; timeline: string }[]
  }
}

interface Props {
  attempts: Attempt[]
  userId: string
}

// ── Helpers ──────────────────────────────────────────────────────
function fmt(n: number) {
  if (!n) return '₹0'
  const v = Math.round(n)
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + 'Cr'
  if (v >= 100000) return '₹' + (v / 100000).toFixed(1) + 'L'
  return '₹' + v.toLocaleString('en-IN')
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const ARCHETYPE_META: Record<string, { emoji: string; color: string; bg: string }> = {
  'The Hidden Gem':         { emoji: '💎', color: '#6366f1', bg: '#eef2ff' },
  'The Market Ready Pro':   { emoji: '🚀', color: '#059669', bg: '#ecfdf5' },
  'The Underpaid Expert':   { emoji: '💸', color: '#dc2626', bg: '#fef2f2' },
  'The Loyal Underpaid':    { emoji: '⏳', color: '#d97706', bg: '#fffbeb' },
  'The Strategic Climber':  { emoji: '🎯', color: '#0e7a5a', bg: '#f0faf5' },
  'The Fast Starter':       { emoji: '⚡', color: '#0891b2', bg: '#ecfeff' },
  'The Late Bloomer':       { emoji: '🌱', color: '#65a30d', bg: '#f7fee7' },
  'The Growth Professional':{ emoji: '📈', color: '#0e7a5a', bg: '#f0faf5' },
}

const DIMENSION_LABELS: (keyof DimensionScores)[] = [
  'market_alignment', 'skill_premium', 'visibility', 'mobility', 'negotiation'
]
const DIMENSION_DISPLAY: Record<string, { label: string; color: string; tip: string }> = {
  market_alignment: { label: 'Market Alignment', color: '#e8922a', tip: 'How well your industry + city + role match high-paying market segments' },
  skill_premium:    { label: 'Skill Premium',    color: '#0e7a5a', tip: 'Premium skills, certifications, and credentials that command above-market pay' },
  visibility:       { label: 'Visibility',       color: '#6366f1', tip: 'External presence — thought leadership, LinkedIn, speaking, publications' },
  mobility:         { label: 'Career Mobility',  color: '#0891b2', tip: 'Promotion velocity and trajectory vs peers in your field' },
  negotiation:      { label: 'Negotiation',      color: '#dc2626', tip: 'Frequency and effectiveness of salary negotiation behaviour' },
}

const HRS_LEVELS = [
  { min: 0,   max: 200, label: 'Just Starting',   color: '#dc2626', desc: 'Significant gaps to address before targeting market rate' },
  { min: 200, max: 400, label: 'Building Up',      color: '#f59e0b', desc: 'Foundational strengths but key gaps limiting your earning potential' },
  { min: 400, max: 600, label: 'Getting There',    color: '#e8922a', desc: 'Above average profile — targeted improvements will move the needle fast' },
  { min: 600, max: 800, label: 'Market Ready',     color: '#059669', desc: 'Strong profile — focus on visibility and negotiation to capture full value' },
  { min: 800, max: 1000,label: 'Elite Earner',     color: '#0e7a5a', desc: 'Top 10% profile — optimise compensation strategy and multiple income streams' },
]

function getHRSLevel(hrs: number) {
  return HRS_LEVELS.find(l => hrs >= l.min && hrs < l.max) ?? HRS_LEVELS[HRS_LEVELS.length - 1]
}

// ── Celebration / Change narrative card ────────────────────────────
function CelebrationCard({
  narrative,
  attemptId,
}: {
 narrative: ChangeNarrative
  attemptId: string
}) {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (!narrative.isCelebration) return
    const key = `earngro_celebrated_${attemptId}`
    const alreadyCelebrated = typeof window !== 'undefined' && localStorage.getItem(key)
    if (!alreadyCelebrated) {
      setShowCelebration(true)
      if (typeof window !== 'undefined') localStorage.setItem(key, '1')
    }
  }, [narrative.isCelebration, attemptId])

  const isCelebrating = narrative.isCelebration && showCelebration

  return (
    <div
      style={{
        background: isCelebrating
          ? 'linear-gradient(135deg, var(--teal-l), var(--teal-xl))'
          : 'linear-gradient(135deg, var(--teal-xl), var(--paper))',
        border: `1px solid ${isCelebrating ? 'var(--teal)' : 'var(--teal-mid)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '18px 20px',
        marginBottom: 16,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        animation: isCelebrating ? 'celebrateGlow 1.6s ease-out' : 'none',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>
        {narrative.isCelebration ? '🎉' : '👋'}
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.5, marginBottom: narrative.standingLine ? 4 : 6 }}>
          {narrative.headline}
        </div>
        {narrative.standingLine && (
          <div style={{ fontSize: 13, color: 'var(--teal-d)', fontWeight: 500, lineHeight: 1.5, marginBottom: 6 }}>
            {narrative.standingLine}
          </div>
        )}
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
          {narrative.nextStep}
        </div>
      </div>
      {isCelebrating && (
        <style>{`
          @keyframes celebrateGlow {
            0% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(14,122,90,0.35); }
            40% { transform: scale(1.01); box-shadow: 0 0 0 8px rgba(14,122,90,0.12); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(14,122,90,0); }
          }
        `}</style>
      )}
    </div>
  )
}

// ── Radar Chart (pure SVG — no library needed) ───────────────────
function RadarChart({ scores, prev }: { scores: DimensionScores; prev?: DimensionScores }) {
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const r = 80
  const keys = DIMENSION_LABELS
  const n = keys.length

  function point(value: number, index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const radius = (value / 100) * r
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  function labelPoint(index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const radius = r + 22
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  const currentPoints = keys.map((k, i) => point(scores[k] ?? 0, i))
  const prevPoints = prev ? keys.map((k, i) => point(prev[k] ?? 0, i)) : null

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z'

  // Grid rings
  const rings = [20, 40, 60, 80, 100]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Grid rings */}
      {rings.map(ring => {
        const pts = keys.map((_, i) => point(ring, i))
        return (
          <polygon
            key={ring}
            points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
            fill="none" stroke="var(--border)" strokeWidth="1"
          />
        )
      })}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const p = point(100, i)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth="1" />
      })}

      {/* Previous attempt (ghost) */}
      {prevPoints && (
        <path d={toPath(prevPoints)} fill="rgba(14,122,90,0.06)" stroke="rgba(14,122,90,0.25)" strokeWidth="1.5" strokeDasharray="4 3" />
      )}

      {/* Current attempt */}
      <path d={toPath(currentPoints)} fill="rgba(14,122,90,0.15)" stroke="var(--teal)" strokeWidth="2" />

      {/* Dots */}
      {currentPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--teal)" stroke="white" strokeWidth="1.5" />
      ))}

      {/* Labels */}
      {keys.map((k, i) => {
        const lp = labelPoint(i)
        const d = DIMENSION_DISPLAY[k]
        return (
          <text
            key={k}
            x={lp.x} y={lp.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="var(--muted)" fontFamily="var(--sans)"
            style={{ userSelect: 'none' }}
          >
            {d.label.split(' ').map((word, wi) => (
              <tspan key={wi} x={lp.x} dy={wi === 0 ? '0' : '10'}>{word}</tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, var(--border) 25%, var(--border-l) 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  )
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🧬</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>
        No assessment yet
      </h2>
      <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 360, lineHeight: 1.7, marginBottom: 28 }}>
        Complete your GrowDNA assessment to see your Earning Gap, career archetype, and personalised growth roadmap.
      </p>
      <Link href="/growdna" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--teal)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '13px 28px', borderRadius: 99, textDecoration: 'none', boxShadow: '0 4px 16px rgba(14,122,90,0.22)' }}>
        Start GrowDNA assessment →
      </Link>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function GapPage({ attempts, userId }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'skills' | 'actions'>('overview')
  const [animHRS, setAnimHRS] = useState(0)
  const [animGap, setAnimGap] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  const latest = attempts[0]
  const prev = attempts[1]
  const changeNarrative = prev ? getChangeNarrative(latest, prev) : null

  // Animate numbers on mount
  useEffect(() => {
    if (!latest) return
    const targetHRS = latest.hrs_score
    const targetGap = latest.earning_gap
    const duration = 1400
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setAnimHRS(Math.round(targetHRS * e))
      setAnimGap(Math.round(targetGap * e))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [latest])

  if (!latest) return <EmptyState />

  const hrsLevel = getHRSLevel(latest.hrs_score)
  const archetypeMeta = ARCHETYPE_META[latest.career_archetype] ?? ARCHETYPE_META['The Growth Professional']
  const hrsChange = prev ? latest.hrs_score - prev.hrs_score : null
  const gapChange = prev ? prev.earning_gap - latest.earning_gap : null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'journey',  label: 'Journey',  icon: '🗺️' },
    { id: 'skills',   label: 'Skills',   icon: '⚡' },
    { id: 'actions',  label: 'Actions',  icon: '🎯' },
  ] as const

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 80px' }}>

      {/* ── HERO ── */}
      <div ref={heroRef} style={{ padding: '28px 20px 0' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
              Your Earning Gap
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Based on {attempts.length} assessment{attempts.length !== 1 ? 's' : ''} · Last updated {timeAgo(latest.created_at)}
            </p>
          </div>
          <Link href="/growdna" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--teal)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 99, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(14,122,90,0.2)' }}>
            + Retake assessment
          </Link>
        </div>

        {/* Archetype hero card */}
        <div style={{
          background: `linear-gradient(135deg, ${archetypeMeta.color}18, ${archetypeMeta.color}08)`,
          border: `1px solid ${archetypeMeta.color}30`,
          borderRadius: 'var(--r-xl)', padding: '24px 22px', marginBottom: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: `${archetypeMeta.color}08`, borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{archetypeMeta.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: archetypeMeta.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Your career archetype
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                {latest.career_archetype}
              </div>
              {latest.raw_ai_response?.market_insight && (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                  {latest.raw_ai_response.market_insight}
                </p>
              )}
            </div>
          </div>
        </div>

      {changeNarrative && (
        <ChangeNarrativeCard narrative={changeNarrative} attemptId={latest.id} />
      )}

        {/* Key metrics — 2x2 grid on mobile, 4 cols on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
          {/* Earning Gap */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px', borderTop: '3px solid var(--red)' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Annual Gap</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: 'var(--red)', lineHeight: 1 }}>
              {fmt(animGap)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>per year</div>
            {gapChange !== null && (
              <div style={{ fontSize: 11, color: gapChange > 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 600, marginTop: 6 }}>
                {gapChange > 0 ? '↓' : '↑'} {fmt(Math.abs(gapChange))} vs last
              </div>
            )}
          </div>

          {/* HRS Score */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px', borderTop: `3px solid ${hrsLevel.color}` }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>HRS Score</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: hrsLevel.color, lineHeight: 1 }}>
              {animHRS}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>/1000</span>
            </div>
            <div style={{ fontSize: 11, color: hrsLevel.color, fontWeight: 500, marginTop: 4 }}>{hrsLevel.label}</div>
            {hrsChange !== null && (
              <div style={{ fontSize: 11, color: hrsChange > 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 600, marginTop: 6 }}>
                {hrsChange > 0 ? '↑' : '↓'} {Math.abs(hrsChange)} pts vs last
              </div>
            )}
          </div>

          {/* Target salary */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px', borderTop: '3px solid var(--teal)' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Market Value</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: 'var(--teal)', lineHeight: 1 }}>
              {fmt(latest.target_salary)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>you should earn</div>
          </div>

          {/* Months to close */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px', borderTop: '3px solid var(--amber)' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Closes In</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>
              {latest.months_to_close}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}> mo</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>at current trajectory</div>
          </div>
        </div>

        {/* HRS progress bar */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Hiring Readiness Score</span>
            <span style={{ fontSize: 12, color: hrsLevel.color, fontWeight: 600 }}>{hrsLevel.label}</span>
          </div>
          <div style={{ height: 10, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, var(--amber), ${hrsLevel.color})`, width: `${(animHRS / 1000) * 100}%`, borderRadius: 99, transition: 'width 1.4s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{hrsLevel.desc}</div>
        </div>

        {/* Peer comparison */}
        {latest.raw_ai_response?.peer_comparison && (
          <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>👥</span>
            <p style={{ fontSize: 13, color: 'var(--teal-d)', lineHeight: 1.6 }}>{latest.raw_ai_response.peer_comparison}</p>
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--paper-2)', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '13px 18px', background: 'transparent', border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--teal)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--teal)' : 'var(--muted)',
                fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--sans)',
                transition: 'all 0.15s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ padding: '20px 20px 0' }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }} className="gap-overview-grid">

            {/* LEFT COLUMN — Radar chart */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>5 Earning Dimensions</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
                {prev ? 'Solid line = latest · Dashed = previous assessment' : 'Your current profile across 5 key earning factors'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <RadarChart
                  scores={latest.dimension_scores}
                  prev={prev?.dimension_scores}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                  {DIMENSION_LABELS.map(key => {
                    const d = DIMENSION_DISPLAY[key]
                    const val = latest.dimension_scores?.[key] ?? 0
                    const prevVal = prev?.dimension_scores?.[key]
                    const change = prevVal != null ? val - prevVal : null
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {change !== null && (
                              <span style={{ fontSize: 11, color: change >= 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 600 }}>
                                {change >= 0 ? '↑' : '↓'}{Math.abs(change)}
                              </span>
                            )}
                            <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{val}/100</span>
                          </div>
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: d.color, width: `${val}%`, borderRadius: 99 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Salary range + strengths */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Salary range band */}
              <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Market Salary Range — Your Profile</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>25th %ile</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{fmt(latest.salary_range_min)}</div>
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: 20 }}>
                    <div style={{ position: 'absolute', inset: '50% 0', transform: 'translateY(-50%)', height: 8, background: 'linear-gradient(90deg,var(--amber-mid),var(--teal))', borderRadius: 99 }} />
                    {(() => {
                      const pct = Math.min(95, Math.max(5, ((latest.current_salary - latest.salary_range_min) / (latest.salary_range_max - latest.salary_range_min)) * 100))
                      return (
                        <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%,-50%)', width: 16, height: 16, background: 'white', border: '2.5px solid var(--teal-d)', borderRadius: '50%' }}>
                          <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: 'var(--teal-d)', fontWeight: 700, whiteSpace: 'nowrap' }}>You</div>
                        </div>
                      )
                    })()}
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>90th %ile</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{fmt(latest.salary_range_max)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
                  Current: <strong style={{ color: 'var(--ink)' }}>{fmt(latest.current_salary)}</strong> · Target: <strong style={{ color: 'var(--teal)' }}>{fmt(latest.target_salary)}</strong>
                </div>
              </div>

              {/* Top strengths */}
              {latest.raw_ai_response?.top_strengths && (
                <div style={{ background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-lg)', padding: '20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-d)', marginBottom: 14 }}>✅ Your top strengths</div>
                  {latest.raw_ai_response.top_strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < latest.raw_ai_response.top_strengths!.length - 1 ? '1px solid var(--teal-mid)' : 'none' }}>
                      <div style={{ width: 22, height: 22, minWidth: 22, borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', marginTop: 1 }}>{i + 1}</div>
                      <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>{s}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

        {/* ── JOURNEY TAB ── */}
        {activeTab === 'journey' && (
          <div>
            {attempts.length === 1 && (
              <div style={{ background: 'var(--amber-l)', border: '1px solid var(--amber-mid)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--amber-d)' }}>
                💡 Complete your second assessment to see your growth journey and track progress over time.
              </div>
            )}

            {/* HRS trend bar chart */}
            {attempts.length > 1 && (
              <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>HRS Score Over Time</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                  {[...attempts].reverse().map((a, i) => {
                    const pct = (a.hrs_score / 1000) * 100
                    const isLatest = i === attempts.length - 1
                    return (
                      <div key={a.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: isLatest ? 'var(--teal)' : 'var(--muted)' }}>{a.hrs_score}</div>
                        <div style={{ width: '100%', background: isLatest ? 'var(--teal)' : 'var(--teal-mid)', borderRadius: '4px 4px 0 0', height: `${Math.max(pct, 6)}%`, transition: 'height 0.8s ease' }} />
                        <div style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>#{a.attempt_number}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'var(--border)', zIndex: 0 }} />
              {attempts.map((attempt, i) => {
                const isExpanded = expanded === attempt.id
                const meta = ARCHETYPE_META[attempt.career_archetype] ?? ARCHETYPE_META['The Growth Professional']
                const isLatest = i === 0
                return (
                  <div key={attempt.id} style={{ position: 'relative', paddingLeft: 48, marginBottom: 14 }}>
                    {/* Timeline dot */}
                    <div style={{ position: 'absolute', left: 0, top: 16, width: 38, height: 38, background: isLatest ? 'var(--teal)' : 'var(--paper)', border: `2px solid ${isLatest ? 'var(--teal)' : 'var(--border)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, zIndex: 1 }}>
                      {isLatest ? '★' : attempt.attempt_number}
                    </div>

                    <div
                      onClick={() => setExpanded(isExpanded ? null : attempt.id)}
                      style={{ background: 'var(--paper)', border: `1px solid ${isLatest ? 'var(--teal-mid)' : 'var(--border)'}`, borderRadius: 'var(--r-lg)', padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            {isLatest && <span style={{ fontSize: 10, background: 'var(--teal)', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>LATEST</span>}
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{meta.emoji} {attempt.career_archetype}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDate(attempt.created_at)} · {attempt.role} · {attempt.city}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>{fmt(attempt.earning_gap)}</div>
                            <div style={{ fontSize: 10, color: 'var(--muted)' }}>gap</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>{attempt.hrs_score}</div>
                            <div style={{ fontSize: 10, color: 'var(--muted)' }}>HRS</div>
                          </div>
                          <span style={{ color: 'var(--muted)', fontSize: 14 }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-l)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                            {[
                              { l: 'Current CTC', v: fmt(attempt.current_salary), c: 'var(--ink)' },
                              { l: 'Target CTC', v: fmt(attempt.target_salary), c: 'var(--teal)' },
                              { l: 'Closes in', v: `${attempt.months_to_close} mo`, c: 'var(--amber)' },
                            ].map((m, j) => (
                              <div key={j} style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>{m.l}</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: m.c }}>{m.v}</div>
                              </div>
                            ))}
                          </div>
                          {/* Dimension bars */}
                          {attempt.dimension_scores && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {DIMENSION_LABELS.map(key => {
                                const d = DIMENSION_DISPLAY[key]
                                const val = attempt.dimension_scores[key] ?? 0
                                return (
                                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 11, color: 'var(--muted)', width: 100, flexShrink: 0 }}>{d.label}</div>
                                    <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                                      <div style={{ height: '100%', background: d.color, width: `${val}%`, borderRadius: 99 }} />
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: d.color, width: 28, textAlign: 'right' }}>{val}</div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SKILLS TAB ── */}
        {activeTab === 'skills' && (
          <div>
            {/* Critical gaps */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>⚠️ Critical skill gaps</div>
              {(Array.isArray(latest.gap_reasons) ? latest.gap_reasons : []).map((gap, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < (latest.gap_reasons?.length ?? 0) - 1 ? '1px solid var(--border-l)' : 'none' }}>
                  <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--red)', fontWeight: 700, marginTop: 2 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>{typeof gap === 'string' ? gap : JSON.stringify(gap)}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, background: 'var(--red-l)', border: '1px solid #FECACA', color: 'var(--red)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
                      High impact
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dimension breakdown with tips */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>Dimension deep-dive</div>
              {DIMENSION_LABELS.map((key, i) => {
                const d = DIMENSION_DISPLAY[key]
                const val = latest.dimension_scores?.[key] ?? 0
                const status = val >= 70 ? '✅ Strong' : val >= 40 ? '⚠️ Moderate' : '❌ Gap'
                const statusColor = val >= 70 ? 'var(--teal)' : val >= 40 ? 'var(--amber)' : 'var(--red)'
                return (
                  <div key={key} style={{ padding: '14px 0', borderBottom: i < DIMENSION_LABELS.length - 1 ? '1px solid var(--border-l)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{d.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>{status}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{val}/100</span>
                      </div>
                    </div>
                    <div style={{ height: 7, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', background: d.color, width: `${val}%`, borderRadius: 99 }} />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>{d.tip}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── ACTIONS TAB ── */}
        {activeTab === 'actions' && (
          <div>
            {/* Immediate actions from AI */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>🎯 Your 3 immediate actions</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>AI-generated for your specific profile · updated each assessment</div>
              {(latest.raw_ai_response?.immediate_actions ?? latest.close_actions ?? []).slice(0, 3).map((a, i) => {
                const action = typeof a === 'string' ? { action: a, impact: '', timeline: '' } : a
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--border-l)' : 'none' }}>
                    <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--teal-d)', marginTop: 2 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{action.action}</div>
                      {action.impact && <div style={{ fontSize: 12, color: 'var(--teal)', marginBottom: 2 }}>💰 {action.impact}</div>}
                      {action.timeline && <div style={{ fontSize: 12, color: 'var(--muted)' }}>⏱ {action.timeline}</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Retake CTA — gamified */}
            <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-xl)', padding: '24px 22px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
              <div style={{ fontSize: 36, marginBottom: 10 }}>🧬</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                Ready to close more gap?
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, maxWidth: 300, margin: '0 auto 18px' }}>
                Retake your GrowDNA assessment to track progress, update your roadmap, and see your HRS score grow.
              </p>
              {attempts.length > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99, marginBottom: 14 }}>
                  🔥 {attempts.length} assessments · {hrsChange && hrsChange > 0 ? `+${hrsChange} pts last time` : 'keep improving'}
                </div>
              )}
              <div>
                <Link href="/growdna" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--teal-d)', fontSize: 14, fontWeight: 700, padding: '12px 26px', borderRadius: 99, textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                  Retake assessment →
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── CSS for shimmer ── */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 860px) {
          .gap-overview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
