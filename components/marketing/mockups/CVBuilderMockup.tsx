// Full one-page resume recreation, matching the real CVPreview layout
// completely — not a fragment. The resume sheet itself IS the elevated
// card (paper-like shadow), rather than a card wrapping a smaller preview.

export default function CVBuilderMockup() {
  return (
    <div className="cvb-sheet">
      <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 19, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>Vicky Neloson</div>
        <div style={{ fontSize: 11.5, color: '#666' }}>vicky.neloson@gmail.com · +91 98765 43210 · Gurugram, India</div>
      </div>

      <SectionLabel>Summary</SectionLabel>
      <p style={{ fontSize: 11.5, color: '#333', lineHeight: 1.65, marginBottom: 14 }}>
        Mid-senior analytics professional with 4 years driving delivery strategy and stakeholder alignment across large-scale logistics operations. Proven track record translating data into measurable cost and SLA improvements.
      </p>

      <SectionLabel>Experience</SectionLabel>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Sr. Business Analyst</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 10.5, color: '#888' }}>2022 – Present</span>
        </div>
        <div style={{ fontSize: 11.5, color: '#555', marginBottom: 6 }}>Delhivery Limited</div>
        <Bullet>Led delivery strategy across 12 city hubs, cutting cost-per-shipment 18%</Bullet>
        <Bullet>Reduced SLA breaches from 9% to 2% through workflow automation</Bullet>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Business Analyst</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 10.5, color: '#888' }}>2020 – 2022</span>
        </div>
        <div style={{ fontSize: 11.5, color: '#555', marginBottom: 6 }}>BharatPe</div>
        <Bullet>Built dashboards tracking 500K+ daily transactions, cutting reporting time 35%</Bullet>
      </div>

      <SectionLabel>Education</SectionLabel>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>B.Tech, Mechanical Engineering</span>
          <span style={{ fontSize: 11.5, color: '#555' }}> — Delhi Technological University</span>
        </div>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 10.5, color: '#888' }}>2020</span>
      </div>

      <SectionLabel>Certifications</SectionLabel>
      <div style={{ fontSize: 11.5, color: '#333', marginBottom: 14 }}>Google Data Analytics Certificate — Google, 2023</div>

      <SectionLabel>Skills</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {['SQL', 'Python', 'AWS', 'Tableau', 'ETL', 'Stakeholder Management'].map((s, i) => (
          <span key={i} style={{ fontFamily: 'var(--sans)', fontSize: 10.5, padding: '3px 10px', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', color: 'var(--teal-d)', borderRadius: 99 }}>{s}</span>
        ))}
      </div>

      <style>{`
        .cvb-sheet {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 32px 30px;
          font-family: Georgia, serif;
          box-shadow: var(--sh-md);
          height: 560px;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .cvb-sheet:hover {
          transform: translateY(-6px);
          box-shadow: var(--sh-lg), 0 20px 40px -12px rgba(14,122,90,0.18);
          border-color: var(--teal-mid);
        }
      `}</style>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--sans)', fontSize: 10.5, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
      {children}
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
      <span style={{ color: 'var(--teal)', flexShrink: 0 }}>•</span>
      <span style={{ fontSize: 11.5, color: '#333', lineHeight: 1.5 }}>{children}</span>
    </div>
  )
}