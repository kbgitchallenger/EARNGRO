// Faithful, minimal recreation of the real GrowDNA result screen — the
// archetype hero + gap/timeline stats, matching the actual ResultPanel
// component. Real scale, on-brand only, no sidebar chrome.

function fmt(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  return '₹' + n.toLocaleString('en-IN')
}

export default function GrowDNAMockup() {
  return (
    <div className="dna-card">
      <div>
        {/* Archetype hero */}
        <div style={{ background: 'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius: 'var(--r-lg)', padding: '24px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ fontSize: 34, marginBottom: 8, position: 'relative' }}>📈</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Your career archetype</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 14 }}>The Growth Professional</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 500, padding: '6px 16px', borderRadius: 99 }}>
            Hiring Readiness:&nbsp;<strong style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>490</strong>&nbsp;/ 1000
          </div>
        </div>

        {/* Gap / market value / timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Annual Gap</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 700, color: 'var(--red)' }}>{fmt(500000)}</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Market Value</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 700, color: 'var(--teal)' }}>{fmt(2300000)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Months to Close</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>14</div>
          </div>
        </div>
      </div>

      {/* 5 earning dimensions — real content, not filler, matching the
          actual GrowDNA result's dimension breakdown */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Your 5 earning dimensions</div>
        {[['Market Alignment', 60, 'var(--amber)'], ['Skill Premium', 20, 'var(--red)'], ['Visibility', 20, 'var(--red)'], ['Career Mobility', 45, 'var(--amber)'], ['Negotiation', 75, 'var(--teal)']].map(([label, val, color], i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
              <span style={{ color: 'var(--muted)' }}>{label}</span>
              <span style={{ fontWeight: 700, color: color as string }}>{val}/100</span>
            </div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${val}%`, background: color as string, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .dna-card {
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
        .dna-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--sh-lg), 0 20px 40px -12px rgba(14,122,90,0.18);
          border-color: var(--teal-mid);
        }
      `}</style>
    </div>
  )
}