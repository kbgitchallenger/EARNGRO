'use client'

import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

export type CVTemplate = 'classic' | 'modern' | 'minimal'

// All three templates are deliberately single-column — no sidebars, no
// multi-column layouts. ATS parsers are well documented to misread content
// order in multi-column resumes, and ATS compatibility is this product's
// core value proposition. Templates differ only in typography, accent
// treatment, and spacing — never in structural layout.
const TEMPLATE_STYLES: Record<CVTemplate, {
  fontFamily: string
  headerBorder: string
  sectionLabelColor: string
  sectionLabelStyle: React.CSSProperties
  bulletColor: string
  chipBg: string
  chipBorder: string
  chipColor: string
}> = {
  classic: {
    fontFamily: 'Georgia, serif',
    headerBorder: '2px solid #1a1a1a',
    sectionLabelColor: 'var(--teal)',
    sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)', paddingBottom: 4 },
    bulletColor: 'var(--teal)',
    chipBg: 'var(--teal-l)',
    chipBorder: 'var(--teal-mid)',
    chipColor: 'var(--teal-d)',
  },
  modern: {
    fontFamily: 'var(--sans)',
    headerBorder: '3px solid var(--teal)',
    sectionLabelColor: 'var(--teal-d)',
    sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.06em', borderLeft: '3px solid var(--teal)', paddingLeft: 8 },
    bulletColor: 'var(--teal)',
    chipBg: 'var(--teal-l)',
    chipBorder: 'var(--teal-mid)',
    chipColor: 'var(--teal-d)',
  },
  minimal: {
    fontFamily: 'var(--sans)',
    headerBorder: '1px solid #333',
    sectionLabelColor: '#333',
    sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #ddd', paddingBottom: 4 },
    bulletColor: '#666',
    chipBg: '#f5f5f5',
    chipBorder: '#ddd',
    chipColor: '#333',
  },
}

export default function CVPreview({ data, template = 'classic' }: { data: ParsedResume; template?: CVTemplate }) {
  const t = TEMPLATE_STYLES[template]

  return (
    <div id="cv-preview-print" style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '32px 28px',
      fontFamily: t.fontFamily,
      fontSize: 13,
      lineHeight: 1.6,
      color: '#1a1a1a',
      minHeight: 600,
      boxShadow: 'var(--sh-md)',
    }}>
      {/* Header */}
      <div style={{ borderBottom: t.headerBorder, paddingBottom: 12, marginBottom: 16 }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
          {data.name || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#555' }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sectionLabelColor, marginBottom: 6, ...t.sectionLabelStyle }}>
            Professional Summary
          </div>
          <p style={{ margin: 0, color: '#333', lineHeight: 1.7 }}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sectionLabelColor, marginBottom: 8, ...t.sectionLabelStyle }}>
            Experience
          </div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
                <div>
                  <span style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>{exp.role}</span>
                  <span style={{ color: '#555', fontSize: 13 }}> · {exp.company}</span>
                </div>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#888' }}>
                  {exp.start_date} – {exp.is_current ? 'Present' : (exp.end_date ?? 'Present')}
                </span>
              </div>
              {exp.bullets?.map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 2, paddingLeft: 4 }}>
                  <span style={{ color: t.bulletColor, flexShrink: 0, marginTop: 2 }}>•</span>
                  <span style={{ color: '#333', fontSize: 12 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sectionLabelColor, marginBottom: 8, ...t.sectionLabelStyle }}>
            Skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.skills.map((s, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 10px', background: t.chipBg, border: `1px solid ${t.chipBorder}`, color: t.chipColor, borderRadius: 99, fontFamily: 'var(--sans)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sectionLabelColor, marginBottom: 8, ...t.sectionLabelStyle }}>
            Education
          </div>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 6 }}>
              <div>
                <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13 }}>{edu.degree}</span>
                <span style={{ color: '#555', fontSize: 13 }}> · {edu.institution}</span>
              </div>
              {edu.year && <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#888' }}>{edu.year}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: data.languages?.length ? 16 : 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sectionLabelColor, marginBottom: 8, ...t.sectionLabelStyle }}>
            Certifications
          </div>
          {data.certifications.map((cert, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--sans)' }}>{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
              {cert.year && <span style={{ fontSize: 11, color: '#888', fontFamily: 'var(--sans)' }}>{cert.year}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sectionLabelColor, marginBottom: 8, ...t.sectionLabelStyle }}>
            Languages
          </div>
          <div style={{ fontSize: 12, fontFamily: 'var(--sans)', color: '#333' }}>
            {data.languages.join(' · ')}
          </div>
        </div>
      )}
    </div>
  )
}