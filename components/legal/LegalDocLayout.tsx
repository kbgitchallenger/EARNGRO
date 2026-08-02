// components/legal/LegalDocLayout.tsx
'use client'

import Link from 'next/link'

export interface LegalSection {
  id: string
  heading: string
  content: React.ReactNode
}

interface LegalDocLayoutProps {
  title: string
  effectiveDate: string
  sections: LegalSection[]
}

export default function LegalDocLayout({ title, effectiveDate, sections }: LegalDocLayoutProps) {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 100px' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--teal)', textDecoration: 'none', marginBottom: 32, fontWeight: 600 }}>
          ← Back to EarnGro
        </Link>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 40 }}>
          Effective {effectiveDate} · Last updated {effectiveDate}
        </p>

        {/* Table of contents */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
            Contents
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '4px 24px' }}>
            {sections.map(s => (
              <li key={s.id} style={{ marginBottom: 4 }}>
                <a href={`#${s.id}`} style={{ fontSize: 13.5, color: 'var(--teal-d)', textDecoration: 'none' }}>{s.heading}</a>
              </li>
            ))}
          </ol>
        </div>

        {sections.map((s, i) => (
          <section key={s.id} id={s.id} style={{ marginBottom: 40, scrollMarginTop: 20 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 600, color: 'var(--ink)', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              {i + 1}. {s.heading}
            </h2>
            <div className="legal-body">{s.content}</div>
          </section>
        ))}

        <div style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: 12.5, color: 'var(--muted)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Terms of Service</Link>
          <a href="mailto:info@earngro.app" style={{ color: 'var(--teal)', textDecoration: 'none' }}>info@earngro.app</a>
        </div>
      </div>

      <style jsx>{`
        .legal-body { font-size: 14.5px; color: var(--ink); line-height: 1.75; }
        .legal-body :global(p) { margin: 0 0 14px; }
        .legal-body :global(ul) { margin: 0 0 14px; padding-left: 22px; }
        .legal-body :global(li) { margin-bottom: 6px; }
        .legal-body :global(strong) { color: var(--ink); font-weight: 600; }
        .legal-body :global(table) { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 13.5px; }
        .legal-body :global(th), .legal-body :global(td) { text-align: left; padding: 8px 12px; border: 1px solid var(--border); vertical-align: top; }
        .legal-body :global(th) { background: var(--paper); font-weight: 600; color: var(--ink); }
        .legal-body :global(.legal-note) {
          background: var(--amber-l); border: 1px solid var(--amber-mid); border-radius: var(--r-md);
          padding: 12px 16px; font-size: 13px; color: #92400E; margin-bottom: 14px;
        }
      `}</style>
    </div>
  )
}