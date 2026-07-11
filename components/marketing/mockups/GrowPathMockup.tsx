// Faithful, minimal recreation of the real GrowPath phase-progress view —
// real scale, on-brand only, no sidebar chrome.

export default function GrowPathMockup() {
  const phases = [
    { name: 'Foundation', range: 'Month 1–3', pct: 75, color: 'var(--teal)' },
    { name: 'Momentum', range: 'Month 4–8', pct: 20, color: 'var(--amber)' },
    { name: 'Breakthrough', range: 'Month 9+', pct: 0, color: 'var(--red)' },
  ]
  const companies = [
    { name: 'Bosch', range: '₹26–29L' },
    { name: 'Cummins', range: '₹25–28L' },
    { name: 'John Deere', range: '₹27–30L' },
    { name: 'Schaeffler', range: '₹24–27L' },
  ]

  return (
    <div className="gp-card">
      <div>
        {/* Next action hero */}
        <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-lg)', padding: '16px 18px', marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>
            🎯 Your next action
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
            Publish 2 technical posts on manufacturing optimization
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Visibility · Foundation · Month 3</div>
        </div>

        {/* Phase progress */}
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

      {/* Target companies — real feature, not filler */}
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