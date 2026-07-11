'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CVPreview, { type CVTemplate } from './CVPreview'
import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

const TEMPLATE_OPTIONS: { id: CVTemplate; label: string; desc: string }[] = [
  { id: 'classic', label: 'Classic', desc: 'Serif, traditional' },
  { id: 'modern', label: 'Modern', desc: 'Clean, teal accents' },
  { id: 'minimal', label: 'Minimal', desc: 'Neutral, conservative' },
]

const EMPTY: ParsedResume = {
  name: '', email: '', phone: '', location: '', summary: '',
  experience: [], education: [], skills: [], certifications: [],
  total_experience_years: 0,
  languages: [],
  industry_signals: []
}

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-md)', fontSize: 13, fontFamily: 'var(--sans)',
  outline: 'none', color: 'var(--ink)', background: 'var(--paper)',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
}
const sectionHead: React.CSSProperties = {
  fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600,
  color: 'var(--ink)', marginBottom: 14, paddingBottom: 8,
  borderBottom: '1px solid var(--border)',
}

interface CVBuilderProps {
  initialData?: ParsedResume
  // Safest default is 'free' — if a parent page ever forgets to pass this,
  // we watermark rather than silently letting a free-plan export go clean.
  plan?: string
}

export default function CVBuilder({ initialData, plan = 'free' }: CVBuilderProps) {
  const [data, setData] = useState<ParsedResume>(initialData ?? EMPTY)
  const [name, setName] = useState('My Resume')
  const [template, setTemplate] = useState<CVTemplate>('classic')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [error, setError] = useState('')
  const router = useRouter()
  const isFreePlan = plan === 'free'

  const set = (k: keyof ParsedResume, v: unknown) =>
    setData(p => ({ ...p, [k]: v }))

  // ── Experience helpers ──────────────────────────────────────────
  // All of these now build a fully new nested object each time, rather
  // than mutating the existing experience[i] in place before setData —
  // the old version mutated the previous state's nested object directly,
  // which happened to still re-render (top-level references changed) but
  // is the kind of pattern that silently breaks under memoization later.
  function addExp() {
    set('experience', [...(data.experience ?? []), { company: '', role: '', start_date: '', end_date: '', is_current: false, bullets: [''] }])
  }
  function setExp(i: number, k: string, v: unknown) {
    const arr = (data.experience ?? []).map((exp, j) => j === i ? { ...exp, [k]: v } : exp)
    set('experience', arr)
  }
  function removeExp(i: number) {
    set('experience', (data.experience ?? []).filter((_, j) => j !== i))
  }
  function addBullet(ei: number) {
    const arr = (data.experience ?? []).map((exp, j) =>
      j === ei ? { ...exp, bullets: [...(exp.bullets ?? []), ''] } : exp
    )
    set('experience', arr)
  }
  function setBullet(ei: number, bi: number, v: string) {
    const arr = (data.experience ?? []).map((exp, j) =>
      j === ei ? { ...exp, bullets: (exp.bullets ?? []).map((b, k) => k === bi ? v : b) } : exp
    )
    set('experience', arr)
  }
  function removeBullet(ei: number, bi: number) {
    const arr = (data.experience ?? []).map((exp, j) =>
      j === ei ? { ...exp, bullets: (exp.bullets ?? []).filter((_, k) => k !== bi) } : exp
    )
    set('experience', arr)
  }

  // ── Education helpers ───────────────────────────────────────────
  function addEdu() {
    set('education', [...(data.education ?? []), { institution: '', degree: '', year: '' }])
  }
  function setEdu(i: number, k: string, v: string) {
    const arr = (data.education ?? []).map((edu, j) => j === i ? { ...edu, [k]: v } : edu)
    set('education', arr)
  }
  function removeEdu(i: number) {
    set('education', (data.education ?? []).filter((_, j) => j !== i))
  }

  // ── Certifications helpers — NEW, previously had no UI at all ────
  function addCert() {
    set('certifications', [...(data.certifications ?? []), { name: '', issuer: '', year: '' }])
  }
  function setCert(i: number, k: string, v: string) {
    const arr = (data.certifications ?? []).map((c, j) => j === i ? { ...c, [k]: v } : c)
    set('certifications', arr)
  }
  function removeCert(i: number) {
    set('certifications', (data.certifications ?? []).filter((_, j) => j !== i))
  }

  function exportPDF() {
    if (!data.name.trim()) {
      setError('Add your name before exporting.')
      return
    }
    setError('')

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const previewEl = document.getElementById('cv-preview-print')
    if (!previewEl) return

    // Free-plan watermark — diagonal, repeated, printed into the same
    // document rather than overlaid client-side, so it survives to PDF.
    const watermarkStyle = isFreePlan ? `
      body { position: relative; }
      body::before {
        content: 'EARNGRO · FREE PLAN · EARNGRO · FREE PLAN';
        position: fixed; top: 45%; left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 34px; font-weight: 700; letter-spacing: 0.1em;
        color: rgba(14,122,90,0.08); white-space: nowrap;
        font-family: Arial, sans-serif; pointer-events: none; z-index: 999;
      }
    ` : ''

    // Print body font must match the selected template — previously hardcoded
    // to Georgia regardless of template, which would mismatch Modern/Minimal
    // (both sans-serif on screen) once templates existed.
    const printBodyFont = template === 'classic'
      ? 'Georgia, serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.name || 'Resume'} — EarnGro</title>
        <style>
          /* CVPreview's inline styles reference these CSS custom properties
             (var(--teal), var(--border), etc.) — they're defined in the main
             app's globals.css, which does NOT carry over into this separate
             print window/document. Without redefining them here, every teal
             accent (section headings, bullet dots, skill chips) silently
             falls back to unstyled/black in the exported PDF, even though
             it renders correctly on screen. Teal values below match what
             this file already used elsewhere for print; --border is an
             approximation — worth confirming against the real globals.css
             if the printed divider lines look off. */
          :root {
            --teal: #0e7a5a;
            --teal-d: #095c43;
            --teal-l: #f0faf5;
            --teal-mid: #c8e9db;
            --border: #e5e2da; /* approximation, not confirmed against globals.css */
            --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: ${printBodyFont}; font-size: 12px; color: #1a1a1a; padding: 32px 40px; line-height: 1.5; }
          @media print { body { padding: 20px 24px; } }
          ${watermarkStyle}
        </style>
      </head>
      <body>
        ${previewEl.innerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 400)
  }

  async function save() {
    if (!data.name.trim()) {
      setError('Add your name before saving.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/cv/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parsedData: data, name }),
      })
      if (!res.ok) throw new Error('Save failed')
      const { versionId } = await res.json()
      router.push(`/cv/analysis/${versionId}`)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'edit', label: '✏️ Edit' },
    { id: 'preview', label: '👁️ Preview' },
  ] as const

  return (
    <div className="cvb-page">

      {/* Template picker — all three are single-column by design. Multi-column
          / sidebar layouts are a known way ATS parsers misread content order,
          and ATS compatibility is this product's core promise, so templates
          differ only in typography/accent, never in structural layout. */}
      <div className="cvb-template-picker">
        {TEMPLATE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setTemplate(opt.id)}
            className={`cvb-template-btn${template === opt.id ? ' active' : ''}`}
          >
            <span style={{ fontWeight: 600 }}>{opt.label}</span>
            <span style={{ fontSize: 11, color: template === opt.id ? 'rgba(255,255,255,0.75)' : 'var(--muted)' }}>{opt.desc}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="cvb-toolbar">
        <div className="cvb-tabs">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`cvb-tab-btn${activeTab === tab.id ? ' active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="cvb-actions">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Resume name" style={{ ...inp, width: 160 }} className="cvb-name-input" />
          <button onClick={exportPDF} className="cvb-btn-outline">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save PDF
          </button>
          <button onClick={save} disabled={saving} className="cvb-btn-primary">
            {saving ? 'Saving…' : '💾 Save & Analyse'}
          </button>
        </div>
      </div>

      {isFreePlan && (
        <div className="cvb-watermark-note">
          <span aria-hidden>💧</span> Free plan exports include an EarnGro watermark. <a href="/pricing">Upgrade</a> to remove it.
        </div>
      )}

      {error && <div className="cvb-error">{error}</div>}

      {/* Two-column layout on desktop, tab-controlled on mobile */}
      <div className="cvb-grid" data-tab={activeTab}>

        {/* Edit panel */}
        {activeTab === 'edit' && (
          <div className="cvb-edit-col">

            {/* Personal Info */}
            <div className="cvb-card">
              <div style={sectionHead}>Personal Information</div>
              <div className="cvb-2col">
                <div><label style={lbl}>Full Name *</label><input style={inp} value={data.name} onChange={e => set('name', e.target.value)} placeholder="Ravi Kumar" /></div>
                <div><label style={lbl}>Email</label><input style={inp} type="email" value={data.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="ravi@company.com" /></div>
                <div><label style={lbl}>Phone</label><input style={inp} value={data.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" /></div>
                <div><label style={lbl}>Location</label><input style={inp} value={data.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="Bengaluru, India" /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Total Experience (years)</label><input style={inp} type="number" min="0" value={data.total_experience_years} onChange={e => set('total_experience_years', Math.max(0, +e.target.value || 0))} /></div>
              </div>
            </div>

            {/* Summary */}
            <div className="cvb-card">
              <div style={sectionHead}>Professional Summary</div>
              <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} value={data.summary ?? ''} onChange={e => set('summary', e.target.value)} placeholder="A compelling 2-3 sentence summary of your professional background and career goals." />
            </div>

            {/* Experience */}
            <div className="cvb-card">
              <div className="cvb-card-head">
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Experience</div>
                <button onClick={addExp} className="cvb-add-btn">+ Add role</button>
              </div>
              {(data.experience ?? []).map((exp, i) => (
                <div key={i} className="cvb-exp-row">
                  <div className="cvb-2col" style={{ marginBottom: 10 }}>
                    <div><label style={lbl}>Job Title *</label><input style={inp} value={exp.role} onChange={e => setExp(i, 'role', e.target.value)} placeholder="Software Engineer" /></div>
                    <div><label style={lbl}>Company *</label><input style={inp} value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} placeholder="Infosys" /></div>
                    <div><label style={lbl}>Start Date</label><input style={inp} value={exp.start_date} onChange={e => setExp(i, 'start_date', e.target.value)} placeholder="Jan 2020" /></div>
                    <div>
                      <label style={lbl}>End Date</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input style={{ ...inp, flex: 1 }} value={exp.end_date ?? ''} onChange={e => setExp(i, 'end_date', e.target.value)} placeholder="Dec 2023" disabled={exp.is_current} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <input type="checkbox" checked={exp.is_current} onChange={e => setExp(i, 'is_current', e.target.checked)} />
                          Current
                        </label>
                      </div>
                    </div>
                  </div>
                  <label style={lbl}>Achievements / Bullets</label>
                  {(exp.bullets ?? []).map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}>
                      <textarea
                        style={{ ...inp, flex: 1, minHeight: 48, resize: 'vertical', lineHeight: 1.5 }}
                        value={b}
                        onChange={e => setBullet(i, bi, e.target.value)}
                        placeholder="Achieved X by doing Y resulting in Z"
                        rows={2}
                      />
                      <button onClick={() => removeBullet(i, bi)} className="cvb-remove-x">×</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <button onClick={() => addBullet(i)} style={{ fontSize: 11, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontWeight: 600 }}>+ Add bullet</button>
                    <button onClick={() => removeExp(i)} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }}>Remove role</button>
                  </div>
                </div>
              ))}
              {(data.experience ?? []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>No experience added yet</div>
              )}
            </div>

            {/* Skills */}
            <div className="cvb-card">
              <div style={sectionHead}>Skills</div>
              <textarea
                style={{ ...inp, minHeight: 80, resize: 'vertical' }}
                value={(data.skills ?? []).join(', ')}
                onChange={e => set('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Python, React, AWS, SQL, Figma — separate with commas"
              />
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Separate skills with commas</div>
            </div>

            {/* Education */}
            <div className="cvb-card">
              <div className="cvb-card-head">
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Education</div>
                <button onClick={addEdu} className="cvb-add-btn">+ Add</button>
              </div>
              {(data.education ?? []).map((edu, i) => (
                <div key={i} className="cvb-edu-row">
                  <div><label style={lbl}>Degree</label><input style={inp} value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} placeholder="B.Tech Computer Science" /></div>
                  <div><label style={lbl}>Institution</label><input style={inp} value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder="IIT Delhi" /></div>
                  <div><label style={lbl}>Year</label><input style={inp} value={edu.year ?? ''} onChange={e => setEdu(i, 'year', e.target.value)} placeholder="2019" /></div>
                  <button onClick={() => removeEdu(i)} className="cvb-remove-x" style={{ alignSelf: 'end' }}>×</button>
                </div>
              ))}
              {(data.education ?? []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>No education added yet</div>
              )}
            </div>

            {/* Certifications — NEW, previously had no UI at all despite
                the schema and PDF export both supporting it */}
            <div className="cvb-card">
              <div className="cvb-card-head">
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Certifications</div>
                <button onClick={addCert} className="cvb-add-btn">+ Add</button>
              </div>
              {(data.certifications ?? []).map((cert, i) => (
                <div key={i} className="cvb-edu-row">
                  <div><label style={lbl}>Certification</label><input style={inp} value={cert.name} onChange={e => setCert(i, 'name', e.target.value)} placeholder="AWS Solutions Architect" /></div>
                  <div><label style={lbl}>Issuer</label><input style={inp} value={cert.issuer ?? ''} onChange={e => setCert(i, 'issuer', e.target.value)} placeholder="Amazon Web Services" /></div>
                  <div><label style={lbl}>Year</label><input style={inp} value={cert.year ?? ''} onChange={e => setCert(i, 'year', e.target.value)} placeholder="2023" /></div>
                  <button onClick={() => removeCert(i)} className="cvb-remove-x" style={{ alignSelf: 'end' }}>×</button>
                </div>
              ))}
              {(data.certifications ?? []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>No certifications added yet</div>
              )}
            </div>

            {/* Languages — NEW, previously had no UI at all */}
            <div className="cvb-card">
              <div style={sectionHead}>Languages</div>
              <input
                style={inp}
                value={(data.languages ?? []).join(', ')}
                onChange={e => set('languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="English, Hindi, Kannada — separate with commas"
              />
            </div>

          </div>
        )}

        {/* Preview panel — always visible on desktop; on mobile only shown
            when the Preview tab is active, since the tab toggle previously
            did nothing on narrow screens (both panels rendered regardless). */}
        <div className={`cvb-preview-col${activeTab === 'edit' ? ' cvb-preview-mobile-hidden' : ''}`}>
          <div className="cvb-preview-sticky">
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Live Preview
            </div>
            <CVPreview data={data} template={template} />
          </div>
        </div>

      </div>

      <style>{`
        .cvb-template-picker { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .cvb-template-btn {
          display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
          padding: 8px 16px; border-radius: var(--r-md); border: 1.5px solid var(--border);
          background: var(--paper); color: var(--ink); cursor: pointer; font-family: var(--sans);
          font-size: 13px; transition: all 0.15s;
        }
        .cvb-template-btn.active { background: var(--teal); border-color: var(--teal); color: #fff; }
        .cvb-page { max-width: 1100px; margin: 0 auto; }
        .cvb-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
        .cvb-tabs { display: flex; background: var(--paper-2); border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; }
        .cvb-tab-btn { padding: 9px 20px; background: transparent; color: var(--muted); border: none; cursor: pointer; font-size: 13px; font-weight: 600; font-family: var(--sans); }
        .cvb-tab-btn.active { background: var(--teal); color: #fff; }
        .cvb-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .cvb-btn-outline { background: var(--paper); color: var(--ink); border: 1.5px solid var(--border); border-radius: var(--r-md); padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--sans); display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .cvb-btn-primary { background: var(--teal); color: #fff; border: none; border-radius: var(--r-md); padding: 9px 22px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--sans); white-space: nowrap; }
        .cvb-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .cvb-watermark-note { font-size: 12px; color: var(--amber); background: var(--amber-l); border: 1px solid var(--amber-mid); border-radius: var(--r-md); padding: 8px 14px; margin-bottom: 14px; }
        .cvb-watermark-note a { color: var(--teal-d); font-weight: 600; }
        .cvb-error { font-size: 13px; color: var(--red); background: var(--red-l); border: 1px solid #F5CCCC; border-radius: var(--r-md); padding: 10px 14px; margin-bottom: 14px; }

        .cvb-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(320px,1fr)); gap: 16px; }
        .cvb-grid[data-tab="preview"] { grid-template-columns: 1fr; }
        .cvb-edit-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .cvb-card { background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px; }
        .cvb-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .cvb-add-btn { font-size: 12px; font-weight: 600; color: var(--teal); background: var(--teal-l); border: 1px solid var(--teal-mid); border-radius: 99px; padding: 5px 14px; cursor: pointer; font-family: var(--sans); }
        .cvb-remove-x { padding: 8px 10px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: var(--red); cursor: pointer; font-size: 14px; flex-shrink: 0; }

        .cvb-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cvb-exp-row { margin-bottom: 16px; padding: 14px; background: var(--paper-2); border-radius: var(--r-md); border: 1px solid var(--border-l); }
        .cvb-edu-row { display: grid; grid-template-columns: 1fr 1fr 80px auto; gap: 8px; margin-bottom: 8px; align-items: end; }

        .cvb-preview-col { min-width: 0; }
        .cvb-preview-sticky { position: sticky; top: 70px; }

        @media (max-width: 900px) {
          .cvb-2col { grid-template-columns: 1fr; }
          .cvb-edu-row { grid-template-columns: 1fr 1fr; }
          .cvb-preview-sticky { position: static; }
          .cvb-preview-mobile-hidden { display: none; }
        }
        @media (max-width: 480px) {
          .cvb-toolbar { flex-direction: column; align-items: stretch; }
          .cvb-tabs { justify-content: center; }
          .cvb-actions { justify-content: stretch; }
          .cvb-name-input { flex: 1; width: auto !important; }
          .cvb-edu-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}