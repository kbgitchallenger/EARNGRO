// Full-scale, faithful recreation of the real CV Analysis page — rendered
// at actual product font sizes (not shrunk to fit a small card), meant to
// be shown full-width so it reads as a real screenshot, not a miniature.

function Ring({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28, circ = 2 * Math.PI * r
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} transform="rotate(-90 36 36)" />
        <text x="36" y="41" textAnchor="middle" fontSize="16" fontWeight="700" fill={color} fontFamily="var(--serif)">{score}</text>
      </svg>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
    </div>
  )
}

export default function CVAnalysisMockup() {
  return (
    <div className="cva-card">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 12.5, color: 'var(--teal)', marginBottom: 6 }}>← All versions / Resume v1</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
            Vicky Neloson — Market Intelligence
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>4 years experience · Uploaded 18 Jun 2026</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 99, padding: '9px 18px', whiteSpace: 'nowrap' }}>
          Upload new version
        </span>
      </div>

      {/* Extracted profile + Market score */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 10 }}>Extracted profile</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Vicky Neloson</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 3 }}>✉ vicky.neloson@gmail.com</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 3 }}>📍 Gurugram, India</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>💼 4 years experience</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink)', marginBottom: 10 }}>Latest: <strong>Sr. Business Analyst, Last Mile Strategy</strong> @ Delhivery Limited</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['SQL', 'Presto DB', 'MySQL', 'PostgreSQL', 'Python'].map((s, i) => (
              <span key={i} style={{ fontSize: 11.5, padding: '4px 12px', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', color: 'var(--teal-d)', borderRadius: 99 }}>{s}</span>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 10 }}>Market score</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 700, color: 'var(--teal)', lineHeight: 1 }}>71</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 16px' }}>out of 100</div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '71%', background: 'var(--teal)' }} />
          </div>
        </div>
      </div>

      {/* Composite scores — flat row, matches real page */}
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-lg)', padding: 22, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 700, color: 'var(--teal)' }}>71</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Overall Score</span>
          </div>
          <Ring score={68} label="ATS Pass" color="var(--amber)" />
          <Ring score={72} label="Recruiter" color="var(--teal)" />
          <Ring score={75} label="Market Fit" color="var(--teal)" />
          <Ring score={70} label="Hire Chance" color="var(--teal)" />
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, paddingTop: 16, borderTop: '1px solid var(--border-l)' }}>
          💡 Solid mid-senior analytics profile with strong quantified achievements and relevant technical skills for India's 2026-2027 market. Resume demonstrates clear business impact (₹7L savings, 1.5x growth, 600 hours automation) and modern tech stack (AWS, Python, SQL). However, several red flags limit market competitiveness: title inconsistency, only 4 years experience for senior roles, short tenure, zero certifications, and missing trending tools.
        </div>
      </div>

      {/* Section breakdown + Keywords */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Section breakdown</div>
          {[['Skills', 72, 'var(--teal)'], ['Summary', 65, 'var(--amber)'], ['Education', 60, 'var(--amber)'], ['Experience', 78, 'var(--teal)'], ['Formatting', 75, 'var(--teal)'], ['Achievements', 0, 'var(--red)']].map(([label, val, color], i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{val}/100</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${val}%`, background: color as string, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Keywords — 15/15 found</div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ height: '100%', width: '100%', background: 'var(--teal)', borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['SQL', 'Python', 'AWS', 'Data Visualization'].map((k, i) => (
              <span key={i} style={{ fontSize: 11.5, fontWeight: 500, padding: '4px 12px', borderRadius: 99, background: 'var(--red-l)', border: '1px solid #F5CCCC', color: 'var(--red)' }}>{k}</span>
            ))}
            {['Tableau', 'ETL', 'Dashboard Development', 'Automation', 'Stakeholder Management', 'KPI', 'Business Intelligence'].map((k, i) => (
              <span key={i} style={{ fontSize: 11.5, fontWeight: 500, padding: '4px 12px', borderRadius: 99, background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', color: 'var(--teal-d)' }}>{k}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .cva-card {
          background: var(--paper);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 28px;
          box-shadow: var(--sh-lg);
          height: 560px;
          overflow-y: auto;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease;
        }
        .cva-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--sh-lg), 0 24px 48px -14px rgba(14,122,90,0.2);
        }
      `}</style>
    </div>
  )
}