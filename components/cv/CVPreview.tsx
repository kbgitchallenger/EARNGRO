'use client'

import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

export type CVTemplate =
  | 'classic' | 'modern' | 'minimal' | 'sidebar'
  | 'fresher' | 'technical' | 'sales' | 'executive' | 'academic'

const TEMPLATE_STYLES: Record<CVTemplate, {
  fontFamily: string
  headerBorder: string
  sectionLabelColor: string
  sectionLabelStyle: React.CSSProperties
  bulletColor: string
  chipBg: string
  chipBorder: string
  chipColor: string
  layout: 'single' | 'sidebar'
  atsRisk: 'safe' | 'moderate'
}> = {
  classic:   { fontFamily: 'Georgia, serif', headerBorder: '2px solid #1a1a1a', sectionLabelColor: 'var(--teal)', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)', paddingBottom: 4 }, bulletColor: 'var(--teal)', chipBg: 'var(--teal-l)', chipBorder: 'var(--teal-mid)', chipColor: 'var(--teal-d)', layout: 'single', atsRisk: 'safe' },
  modern:    { fontFamily: 'var(--sans)', headerBorder: '3px solid var(--teal)', sectionLabelColor: 'var(--teal-d)', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.06em', borderLeft: '3px solid var(--teal)', paddingLeft: 8 }, bulletColor: 'var(--teal)', chipBg: 'var(--teal-l)', chipBorder: 'var(--teal-mid)', chipColor: 'var(--teal-d)', layout: 'single', atsRisk: 'safe' },
  minimal:   { fontFamily: 'var(--sans)', headerBorder: '1px solid #333', sectionLabelColor: '#333', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #ddd', paddingBottom: 4 }, bulletColor: '#666', chipBg: '#f5f5f5', chipBorder: '#ddd', chipColor: '#333', layout: 'single', atsRisk: 'safe' },
  sidebar:   { fontFamily: 'var(--sans)', headerBorder: 'none', sectionLabelColor: 'var(--teal-d)', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', paddingBottom: 4 }, bulletColor: 'var(--teal)', chipBg: '#fff', chipBorder: 'var(--teal-mid)', chipColor: 'var(--teal-d)', layout: 'sidebar', atsRisk: 'moderate' },
  fresher:   { fontFamily: 'var(--sans)', headerBorder: '2px solid var(--teal)', sectionLabelColor: 'var(--teal-d)', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', paddingBottom: 4 }, bulletColor: 'var(--teal)', chipBg: 'var(--teal-l)', chipBorder: 'var(--teal-mid)', chipColor: 'var(--teal-d)', layout: 'single', atsRisk: 'safe' },
  technical: { fontFamily: 'var(--sans)', headerBorder: '2px solid #1a1a1a', sectionLabelColor: 'var(--teal-d)', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', paddingBottom: 4 }, bulletColor: 'var(--teal)', chipBg: '#f0f4f8', chipBorder: '#cbd5e1', chipColor: '#334155', layout: 'single', atsRisk: 'safe' },
  sales:     { fontFamily: 'var(--sans)', headerBorder: '2px solid var(--amber)', sectionLabelColor: '#b45309', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', paddingBottom: 4 }, bulletColor: 'var(--amber)', chipBg: '#fef3c7', chipBorder: '#fde68a', chipColor: '#92400e', layout: 'single', atsRisk: 'safe' },
  executive: { fontFamily: 'Georgia, serif', headerBorder: '1px solid #1a1a1a', sectionLabelColor: '#1a1a1a', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid #ccc', paddingBottom: 4 }, bulletColor: '#555', chipBg: '#f5f5f5', chipBorder: '#ddd', chipColor: '#333', layout: 'single', atsRisk: 'safe' },
  academic:  { fontFamily: 'Georgia, serif', headerBorder: '1px solid #1a1a1a', sectionLabelColor: 'var(--teal-d)', sectionLabelStyle: { fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)', paddingBottom: 4 }, bulletColor: 'var(--teal)', chipBg: 'var(--teal-l)', chipBorder: 'var(--teal-mid)', chipColor: 'var(--teal-d)', layout: 'single', atsRisk: 'safe' },
}

export { TEMPLATE_STYLES }

// ── Deterministic skill categorizer for the Technical template ──
// Keyword lookup, not AI — a skill not in this list falls into "Other",
// a visible, honest limitation rather than a silent miscategorization.
const SKILL_CATEGORIES: Record<string, string[]> = {
  'Languages': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'sql', 'r', 'php', 'ruby', 'kotlin', 'swift'],
  'Frameworks & Libraries': ['react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'express', 'next.js', '.net', 'tensorflow', 'pytorch'],
  'Tools & Platforms': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'jenkins', 'terraform', 'jira', 'figma', 'tableau', 'power bi'],
}
function categorizeSkills(skills: string[]) {
  const groups: Record<string, string[]> = { 'Languages': [], 'Frameworks & Libraries': [], 'Tools & Platforms': [], 'Other': [] }
  for (const skill of skills) {
    const lower = skill.toLowerCase()
    let placed = false
    for (const [cat, keywords] of Object.entries(SKILL_CATEGORIES)) {
      if (keywords.some(k => lower.includes(k))) { groups[cat].push(skill); placed = true; break }
    }
    if (!placed) groups['Other'].push(skill)
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0)
}

// ── Deterministic quantified-bullet extractor for the Sales template ──
// Only surfaces bullets that ALREADY contain a real number/%/currency
// symbol in the source data — never fabricates a metric. Returns empty
// if nothing qualifies, and the highlight strip simply doesn't render.
function extractQuantifiedBullets(experience: ParsedResume['experience'], max = 3): string[] {
  const metricPattern = /(\d+%|\d+x\b|₹[\d,]+|\$[\d,]+|\d{2,})/i
  const found: string[] = []
  for (const exp of experience ?? []) {
    for (const b of exp.bullets ?? []) {
      if (metricPattern.test(b) && found.length < max) found.push(b)
    }
  }
  return found
}

function SectionLabel({ children, t }: { children: React.ReactNode; t: typeof TEMPLATE_STYLES[CVTemplate] }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: t.sectionLabelColor, marginBottom: 8, ...t.sectionLabelStyle }}>{children}</div>
}

function HeaderBlock({ data, t }: { data: ParsedResume; t: typeof TEMPLATE_STYLES[CVTemplate] }) {
  return (
    <div style={{ borderBottom: t.headerBorder, paddingBottom: 12, marginBottom: 16 }}>
      <h1 style={{ fontFamily: 'var(--sans)', fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{data.name || 'Your Name'}</h1>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#555' }}>
        {data.email && <span>✉ {data.email}</span>}
        {data.phone && <span>📞 {data.phone}</span>}
        {data.location && <span>📍 {data.location}</span>}
      </div>
    </div>
  )
}

function SummaryBlock({ data, t, emphasized }: { data: ParsedResume; t: typeof TEMPLATE_STYLES[CVTemplate]; emphasized?: boolean }) {
  if (!data.summary) return null
  return (
    <div style={{ marginBottom: 16, ...(emphasized ? { background: '#f9f9f7', border: '1px solid #e5e5e0', borderRadius: 6, padding: '14px 16px' } : {}) }}>
      <SectionLabel t={t}>{emphasized ? 'Executive Summary' : 'Professional Summary'}</SectionLabel>
      <p style={{ margin: 0, color: '#333', lineHeight: 1.7, fontSize: emphasized ? 13.5 : 13 }}>{data.summary}</p>
    </div>
  )
}

function ExperienceBlock({ data, t, maxBullets }: { data: ParsedResume; t: typeof TEMPLATE_STYLES[CVTemplate]; maxBullets?: number }) {
  if (!data.experience?.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel t={t}>Experience</SectionLabel>
      {data.experience.map((exp, i) => {
        const bullets = maxBullets ? exp.bullets?.slice(0, maxBullets) : exp.bullets
        const hidden = maxBullets && exp.bullets && exp.bullets.length > maxBullets ? exp.bullets.length - maxBullets : 0
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
              <div><span style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>{exp.role}</span><span style={{ color: '#555', fontSize: 13 }}> · {exp.company}</span></div>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#888' }}>{exp.start_date} – {exp.is_current ? 'Present' : (exp.end_date ?? 'Present')}</span>
            </div>
            {bullets?.map((b, j) => (
              <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 2, paddingLeft: 4 }}>
                <span style={{ color: t.bulletColor, flexShrink: 0, marginTop: 2 }}>•</span>
                <span style={{ color: '#333', fontSize: 12 }}>{b}</span>
              </div>
            ))}
            {hidden > 0 && <div style={{ fontSize: 10.5, color: '#999', paddingLeft: 16, marginTop: 2 }}>+{hidden} more achievement{hidden > 1 ? 's' : ''}</div>}
          </div>
        )
      })}
    </div>
  )
}

function SkillsBlock({ data, t }: { data: ParsedResume; t: typeof TEMPLATE_STYLES[CVTemplate] }) {
  if (!data.skills?.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel t={t}>Skills</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {data.skills.map((s, i) => (
          <span key={i} style={{ fontSize: 11, padding: '3px 10px', background: t.chipBg, border: `1px solid ${t.chipBorder}`, color: t.chipColor, borderRadius: 99, fontFamily: 'var(--sans)' }}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function EducationBlock({ data, t }: { data: ParsedResume; t: typeof TEMPLATE_STYLES[CVTemplate] }) {
  if (!data.education?.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel t={t}>Education</SectionLabel>
      {data.education.map((edu, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 6 }}>
          <div><span style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13 }}>{edu.degree}</span><span style={{ color: '#555', fontSize: 13 }}> · {edu.institution}</span></div>
          {edu.year && <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: '#888' }}>{edu.year}</span>}
        </div>
      ))}
    </div>
  )
}

function CertificationsBlock({ data, t }: { data: ParsedResume; t: typeof TEMPLATE_STYLES[CVTemplate] }) {
  if (!data.certifications?.length) return null
  return (
    <div style={{ marginBottom: data.languages?.length ? 16 : 0 }}>
      <SectionLabel t={t}>Certifications</SectionLabel>
      {data.certifications.map((cert, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--sans)' }}>{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
          {cert.year && <span style={{ fontSize: 11, color: '#888', fontFamily: 'var(--sans)' }}>{cert.year}</span>}
        </div>
      ))}
    </div>
  )
}

function LanguagesBlock({ data, t }: { data: ParsedResume; t: typeof TEMPLATE_STYLES[CVTemplate] }) {
  if (!data.languages?.length) return null
  return (
    <div>
      <SectionLabel t={t}>Languages</SectionLabel>
      <div style={{ fontSize: 12, fontFamily: 'var(--sans)', color: '#333' }}>{data.languages.join(' · ')}</div>
    </div>
  )
}

export default function CVPreview({ data, template = 'classic' }: { data: ParsedResume; template?: CVTemplate }) {
  const t = TEMPLATE_STYLES[template]

  // ── Sidebar — structurally distinct two-column layout ──
  if (t.layout === 'sidebar') {
    return (
      <div id="cv-preview-print" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', fontFamily: t.fontFamily, fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', minHeight: 600, boxShadow: 'var(--sh-md)', display: 'grid', gridTemplateColumns: '200px 1fr' }}>
        <div style={{ background: 'var(--teal-xl)', padding: '28px 18px', borderRight: '1px solid var(--teal-mid)' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 4, lineHeight: 1.3 }}>{data.name || 'Your Name'}</h1>
          {data.experience?.[0]?.role && <div style={{ fontSize: 12, color: 'var(--teal-d)', marginBottom: 18 }}>{data.experience[0].role}</div>}
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--teal-d)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Contact</div>
          <div style={{ fontSize: 11, color: '#444', marginBottom: 3, wordBreak: 'break-word' }}>{data.email}</div>
          <div style={{ fontSize: 11, color: '#444', marginBottom: 3 }}>{data.phone}</div>
          <div style={{ fontSize: 11, color: '#444', marginBottom: 18 }}>{data.location}</div>
          {data.skills?.length > 0 && (<>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--teal-d)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Skills</div>
            {data.skills.map((s, i) => <div key={i} style={{ fontSize: 11, color: '#333', marginBottom: 4 }}>{s}</div>)}
          </>)}
        </div>
        <div style={{ padding: '28px 26px' }}>
          <SummaryBlock data={data} t={t} />
          <ExperienceBlock data={data} t={t} />
          <EducationBlock data={data} t={t} />
          <CertificationsBlock data={data} t={t} />
        </div>
      </div>
    )
  }

  // ── Fresher/Entry-level — Education + Skills before Experience ──
  if (template === 'fresher') {
    return (
      <div id="cv-preview-print" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px 28px', fontFamily: t.fontFamily, fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', minHeight: 600, boxShadow: 'var(--sh-md)' }}>
        <HeaderBlock data={data} t={t} />
        <SummaryBlock data={data} t={t} />
        <EducationBlock data={data} t={t} />
        <SkillsBlock data={data} t={t} />
        <ExperienceBlock data={data} t={t} />
        <CertificationsBlock data={data} t={t} />
        <LanguagesBlock data={data} t={t} />
      </div>
    )
  }

  // ── Technical — categorized skills prominent, near top ──
  if (template === 'technical') {
    const categorized = categorizeSkills(data.skills ?? [])
    return (
      <div id="cv-preview-print" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px 28px', fontFamily: t.fontFamily, fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', minHeight: 600, boxShadow: 'var(--sh-md)' }}>
        <HeaderBlock data={data} t={t} />
        <SummaryBlock data={data} t={t} />
        {categorized.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <SectionLabel t={t}>Technical Skills</SectionLabel>
            {categorized.map(([cat, items]) => (
              <div key={cat} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: '#334155', minWidth: 130, flexShrink: 0 }}>{cat}:</span>
                <span style={{ color: '#333' }}>{items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}
        <ExperienceBlock data={data} t={t} />
        <EducationBlock data={data} t={t} />
        <CertificationsBlock data={data} t={t} />
        <LanguagesBlock data={data} t={t} />
      </div>
    )
  }

  // ── Sales/Business — quantified highlight strip from REAL bullets only ──
  if (template === 'sales') {
    const highlights = extractQuantifiedBullets(data.experience ?? [])
    return (
      <div id="cv-preview-print" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px 28px', fontFamily: t.fontFamily, fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', minHeight: 600, boxShadow: 'var(--sh-md)' }}>
        <HeaderBlock data={data} t={t} />
        <SummaryBlock data={data} t={t} />
        {highlights.length > 0 && (
          <div style={{ marginBottom: 16, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '12px 14px' }}>
            <SectionLabel t={t}>Key Highlights</SectionLabel>
            {highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 12.5 }}>
                <span style={{ color: 'var(--amber)', flexShrink: 0 }}>▲</span><span style={{ color: '#333' }}>{h}</span>
              </div>
            ))}
          </div>
        )}
        <ExperienceBlock data={data} t={t} />
        <SkillsBlock data={data} t={t} />
        <EducationBlock data={data} t={t} />
      </div>
    )
  }

  // ── Executive — emphasized summary, compressed bullets ──
  if (template === 'executive') {
    return (
      <div id="cv-preview-print" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px 28px', fontFamily: t.fontFamily, fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', minHeight: 600, boxShadow: 'var(--sh-md)' }}>
        <HeaderBlock data={data} t={t} />
        <SummaryBlock data={data} t={t} emphasized />
        <ExperienceBlock data={data} t={t} maxBullets={2} />
        <EducationBlock data={data} t={t} />
      </div>
    )
  }

  // ── Academic/Research — Education first, optional Publications ──
  if (template === 'academic') {
    return (
      <div id="cv-preview-print" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px 28px', fontFamily: t.fontFamily, fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', minHeight: 600, boxShadow: 'var(--sh-md)' }}>
        <HeaderBlock data={data} t={t} />
        <SummaryBlock data={data} t={t} />
        <EducationBlock data={data} t={t} />
        {data.publications && data.publications.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <SectionLabel t={t}>Publications</SectionLabel>
            {data.publications.map((pub, i) => (
              <div key={i} style={{ marginBottom: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{pub.title}</div>
                <div style={{ color: '#666', fontSize: 11 }}>{[pub.venue, pub.year].filter(Boolean).join(' · ')}{pub.authors ? ` — ${pub.authors}` : ''}</div>
              </div>
            ))}
          </div>
        )}
        <ExperienceBlock data={data} t={t} />
        <CertificationsBlock data={data} t={t} />
      </div>
    )
  }

  // ── Classic / Modern / Minimal — default single-column order ──
  return (
    <div id="cv-preview-print" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '32px 28px', fontFamily: t.fontFamily, fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', minHeight: 600, boxShadow: 'var(--sh-md)' }}>
      <HeaderBlock data={data} t={t} />
      <SummaryBlock data={data} t={t} />
      <ExperienceBlock data={data} t={t} />
      <SkillsBlock data={data} t={t} />
      <EducationBlock data={data} t={t} />
      <CertificationsBlock data={data} t={t} />
      <LanguagesBlock data={data} t={t} />
    </div>
  )
}