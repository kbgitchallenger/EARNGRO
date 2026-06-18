'use client'

import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

export default function CVPreview({ data }: { data: ParsedResume }) {
  return (
    <>
      <div id="cv-print-area" style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '32px 28px',
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        lineHeight: 1.6,
        color: '#1a1a1a',
        minHeight: 600,
        boxShadow: 'var(--sh-md)',
      }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: 12, marginBottom: 16 }}>
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
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: 6 }}>
              Professional Summary
            </div>
            <p style={{ margin: 0, color: '#333', lineHeight: 1.7 }}>{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
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
                    <span style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 2 }}>•</span>
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
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 11, padding: '3px 10px', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', color: 'var(--teal-d)', borderRadius: 99, fontFamily: 'var(--sans)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
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
          <div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
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
      </div>

      {/* Print styles — only active when window.print() is called */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cv-print-area, #cv-print-area * { visibility: visible !important; }
          #cv-print-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 24px 32px !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
            font-size: 11pt !important;
          }
          @page {
            margin: 12mm 14mm;
            size: A4;
          }
        }
      `}</style>
    </>
  )
}