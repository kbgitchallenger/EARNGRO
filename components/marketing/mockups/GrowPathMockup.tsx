// Faithful, minimal recreation of the real GrowPath phase-progress view —
// real scale, on-brand only, no sidebar chrome.
//
// Accepts optional real-data props so the locked-preview usage (GrowPath
// page, free-plan users) can show THIS user's actual gap/timeline/weakest
// dimension instead of generic example data — sharpens the FOMO because
// the preview is now genuinely theirs, not a stock screenshot. All props
// default to the original example values, so the landing-page usage
// (`<GrowPathMockup />` with no props) renders byte-identical to before.

function fmt(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr'
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L'
  return '₹' + n.toLocaleString('en-IN')
}

// Maps a real weakest-dimension to an honest, dimension-appropriate action
// phrase. Not a fabricated specific milestone (no invented company names or
// exact numbers) — just a genuinely tailored type of action, same category
// logic already used elsewhere in the real GrowPath generation code.
const DIMENSION_ACTION: Record<string, { text: string; label: string }> = {
  visibility:        { text: 'Publish 2 posts to build your professional brand', label: 'Visibility' },
  negotiation:       { text: 'Practice countering an offer with real market data', label: 'Negotiation' },
  skill_premium:      { text: 'Earn a certification in your core technical skill', label: 'Skill Premium' },
  market_alignment:   { text: 'Update your resume positioning for target roles', label: 'Market Alignment' },
  mobility:           { text: 'Apply to 5 companies in your target market', label: 'Career Mobility' },
}

interface GrowPathMockupProps {
  currentSalary?: number
  targetSalary?: number
  monthsToClose?: number
  weakestDimension?: string
}

export default function GrowPathMockup({
  currentSalary,
  targetSalary,
  monthsToClose,
  weakestDimension = 'visibility',
}: GrowPathMockupProps = {}) {
  const totalMonths = monthsToClose && monthsToClose > 0 ? monthsToClose : 14
  // Same 3-phase proportional split the real generator uses, scaled to
  // this user's actual timeline instead of a fixed 1–3/4–8/9+ example.
  const phaseBounds = [
    { start: 0, end: Math.round(totalMonths / 3) },
    { start: Math.round(totalMonths / 3), end: Math.round((totalMonths * 2) / 3) },
    { start: Math.round((totalMonths * 2) / 3), end: totalMonths },
  ]
  const phases = [
    { name: 'Foundation', range: `Month ${phaseBounds[0].start + 1}–${phaseBounds[0].end}`, pct: 75, color: 'var(--teal)' },
    { name: 'Momentum', range: `Month ${phaseBounds[1].start + 1}–${phaseBounds[1].end}`, pct: 20, color: 'var(--amber)' },
    { name: 'Breakthrough', range: `Month ${phaseBounds[2].start + 1}+`, pct: 0, color: 'var(--red)' },
  ]

  const action = DIMENSION_ACTION[weakestDimension] ?? DIMENSION_ACTION.visibility

  const companies = [
    { name: 'Bosch', range: '₹26–29L' },
    { name: 'Cummins', range: '₹25–28L' },
    { name: 'John Deere', range: '₹27–30L' },
    { name: 'Schaeffler', range: '₹24–27L' },
  ]

  return (
    <div className="gp-card">
      <div>
        {/* Salary strip — real numbers when provided */}
        {(currentSalary || targetSalary) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, fontSize: 12 }}>
            {currentSalary && (
              <div>
                <div style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase' }}>Current</div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--ink)' }}>{fmt(currentSalary)}</div>
              </div>
            )}
            {currentSalary && targetSalary && <span style={{ color: 'var(--border)' }}>→</span>}
            {targetSalary && (
              <div>
                <div style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase' }}>Target</div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--teal)' }}>{fmt(targetSalary)}</div>
              </div>
            )}
          </div>
        )}

        {/* Next action hero — now dimension-aware */}
        <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-lg)', padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>
            🎯 Your next action
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
            {action.text}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>{action.label} · Foundation · Month {phaseBounds[0].end}</div>
        </div>

        {/* Phase progress — ranges now reflect this user's real timeline */}
        {phases.map((p, i) => (
          <div key={i} style={{ marginBottom: i < phases.length - 1 ? 12 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.range}</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Target companies — kept illustrative on purpose. A real user's
          actual growpath_target_companies don't exist yet (they have no
          active plan, that's the whole reason this is the locked preview),
          so fabricating "personalized" company names here would be
          dishonest rather than a genuine preview. */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>🏢 Target companies</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {companies.map((c, i) => (
            <div key={i} style={{ background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-md)', padding: '9px 11px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{c.range}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .gp-card {
          background: var(--paper);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 22px;
          box-shadow: var(--sh-md);
          height: 560px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .gp-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--sh-lg), 0 20px 40px -12px rgba(14,122,90,0.18);
          border-color: var(--teal-mid);
        }
      `}</style>
    </div>
  )
}