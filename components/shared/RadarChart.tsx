// components/shared/RadarChart.tsx
//
// Extracted from GapPage.tsx, where it was previously defined inline as
// a local, non-exported function — usable only on that one page. Now a
// genuine shared component: takes scores + dimension config as props
// instead of hardcoding either, so GrowPath, GrowDNA's result panel, or
// any future page can render the same radar without re-implementing the
// SVG drawing logic.

import { DIMENSION_KEYS, DIMENSION_DISPLAY, type DimensionScores, type DimensionKey } from '@/lib/growdna/dimensionConfig'

interface RadarChartProps {
  scores: DimensionScores
  prev?: DimensionScores
  size?: number
  keys?: DimensionKey[]
  display?: Record<DimensionKey, { label: string; color: string; tip?: string }>
}

export default function RadarChart({
  scores,
  prev,
  size = 220,
  keys = DIMENSION_KEYS,
  display = DIMENSION_DISPLAY,
}: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  const n = keys.length

  function point(value: number, index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const radius = (value / 100) * r
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  function labelPoint(index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const radius = r + size * 0.1
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  const currentPoints = keys.map((k, i) => point(scores[k] ?? 0, i))
  const prevPoints = prev ? keys.map((k, i) => point(prev[k] ?? 0, i)) : null

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z'

  const rings = [20, 40, 60, 80, 100]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
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

      {keys.map((_, i) => {
        const p = point(100, i)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth="1" />
      })}

      {prevPoints && (
        <path d={toPath(prevPoints)} fill="rgba(14,122,90,0.06)" stroke="rgba(14,122,90,0.25)" strokeWidth="1.5" strokeDasharray="4 3" />
      )}

      <path d={toPath(currentPoints)} fill="rgba(14,122,90,0.15)" stroke="var(--teal)" strokeWidth="2" />

      {currentPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--teal)" stroke="white" strokeWidth="1.5" />
      ))}

      {keys.map((k, i) => {
        const lp = labelPoint(i)
        const d = display[k]
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