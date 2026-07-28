'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import CVPreview, { type CVTemplate } from './CVPreview'
import LimitReachedCard from '@/components/shared/LimitReachedCard'
import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

const TEMPLATE_OPTIONS: { id: CVTemplate; label: string; desc: string; atsRisk: 'safe' | 'moderate'; swatchLayout: 'single' | 'sidebar'; accent: string }[] = [
  { id: 'classic', label: 'Classic', desc: 'Serif, traditional', atsRisk: 'safe', swatchLayout: 'single', accent: '#1a1a1a' },
  { id: 'modern', label: 'Modern', desc: 'Clean, teal accents', atsRisk: 'safe', swatchLayout: 'single', accent: '#0e7a5a' },
  { id: 'minimal', label: 'Minimal', desc: 'Neutral, conservative', atsRisk: 'safe', swatchLayout: 'single', accent: '#6b6b64' },
  { id: 'sidebar', label: 'Sidebar', desc: 'Two-column, visual', atsRisk: 'moderate', swatchLayout: 'sidebar', accent: '#0e7a5a' },
  { id: 'fresher', label: 'Fresher', desc: 'Education first', atsRisk: 'safe', swatchLayout: 'single', accent: '#0891b2' },
  { id: 'technical', label: 'Technical', desc: 'Categorized skills', atsRisk: 'safe', swatchLayout: 'single', accent: '#6366f1' },
  { id: 'sales', label: 'Sales/Business', desc: 'Metrics highlighted', atsRisk: 'safe', swatchLayout: 'single', accent: '#e8922a' },
  { id: 'executive', label: 'Executive', desc: 'Concise, senior tone', atsRisk: 'safe', swatchLayout: 'single', accent: '#1a1a1a' },
  { id: 'academic', label: 'Academic', desc: 'Research-focused', atsRisk: 'safe', swatchLayout: 'single', accent: '#0e7a5a' },
]

const EMPTY: ParsedResume = {
  name: '', email: '', phone: '', location: '', summary: '',
  experience: [], education: [], skills: [], certifications: [],
  total_experience_years: 0,
  languages: [],
  industry_signals: [],
  publications: []
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

// The B+D hybrid: auto-fits to container width by default (so it's never
// clipped, same real bug fix as before) but adds genuine user-controlled
// zoom on top — the first attempt only auto-shrank with no way to zoom
// back in to actually read a two-column template, which is why it was
// rejected. baseScale is the "fits perfectly" starting point, computed
// once per template/content change; zoomMultiplier is purely the user's
// own +/- control layered on top of that baseline. On desktop, baseScale
// naturally computes to ~1 already (nothing to shrink), so the zoom UI
// stays present but effectively inert there — no separate desktop design
// needed.
function ZoomablePreview({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [baseScale, setBaseScale] = useState(1)
  const [zoomMultiplier, setZoomMultiplier] = useState(1)
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined)

  const finalScale = baseScale * zoomMultiplier

  useEffect(() => {
    function computeBaseScale() {
      if (!outerRef.current || !innerRef.current) return
      const containerWidth = outerRef.current.offsetWidth
      const naturalWidth = innerRef.current.scrollWidth
      const fit = naturalWidth > containerWidth ? containerWidth / naturalWidth : 1
      setBaseScale(fit)
    }
    computeBaseScale()
    const ro = new ResizeObserver(computeBaseScale)
    if (outerRef.current) ro.observe(outerRef.current)
    return () => ro.disconnect()
  }, [children])

  useEffect(() => {
    if (!innerRef.current) return
    setScaledHeight(innerRef.current.scrollHeight * finalScale)
  }, [finalScale, children])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 2px' }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {zoomMultiplier === 1 ? 'Fits your screen' : 'Zoomed'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 99, padding: 3 }}>
          <button
            onClick={() => setZoomMultiplier(z => Math.max(0.6, Math.round((z - 0.15) * 100) / 100))}
            style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', fontSize: 14, fontWeight: 700, color: 'var(--teal-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Zoom out"
          >−</button>
          <span style={{ fontSize: 10.5, color: 'var(--muted)', minWidth: 34, textAlign: 'center' }}>{Math.round(zoomMultiplier * 100)}%</span>
          <button
            onClick={() => setZoomMultiplier(z => Math.min(2, Math.round((z + 0.15) * 100) / 100))}
            style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', fontSize: 14, fontWeight: 700, color: 'var(--teal-d)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Zoom in"
          >+</button>
        </div>
      </div>
      <div ref={outerRef} style={{ width: '100%', overflow: finalScale > baseScale ? 'auto' : 'hidden', height: scaledHeight, border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
        <div ref={innerRef} style={{ transform: `scale(${finalScale})`, transformOrigin: 'top left', width: 800 }}>
          {children}
        </div>
      </div>
    </div>
  )
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
  const [optimizing, setOptimizing] = useState<number | null>(null)
  const [optimizeResults, setOptimizeResults] = useState<Record<number, { original: string; optimized: string; improvement_type: string; explanation: string }[]>>({})
  const [bulletLimitReached, setBulletLimitReached] = useState<Record<number, { balance: number; required: number }>>({})
  const router = useRouter()
  const isFreePlan = plan === 'free'

  const estimatedChars = [
    data.summary ?? '',
    ...(data.experience ?? []).flatMap(e => [e.role, e.company, ...(e.bullets ?? [])]),
    ...(data.education ?? []).map(e => `${e.degree} ${e.institution}`),
    (data.skills ?? []).join(' '),
    ...(data.certifications ?? []).map(c => c.name),
    ...(data.publications ?? []).map(p => p.title),
  ].join(' ').length
  const estimatedPages = Math.max(0.1, estimatedChars / 3200)

  const set = (k: keyof ParsedResume, v: unknown) =>
    setData(p => ({ ...p, [k]: v }))

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

  async function optimizeBullets(ei: number) {
    const exp = (data.experience ?? [])[ei]
    if (!exp || !exp.bullets?.some(b => b.trim())) return
    setOptimizing(ei)
    setError('')
    setBulletLimitReached(prev => { const u = { ...prev }; delete u[ei]; return u })
    try {
      const res = await fetch('/api/cv/bullets/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets: exp.bullets, role: exp.role, company: exp.company }),
      })
      if (res.status === 402) {
        const body = await res.json().catch(() => ({}))
        setBulletLimitReached(prev => ({ ...prev, [ei]: { balance: body.balance ?? 0, required: body.required ?? 19 } }))
        return
      }
      if (!res.ok) throw new Error('Optimization failed')
      const result = await res.json()
      setOptimizeResults(prev => ({ ...prev, [ei]: result.bullets }))
    } catch {
      setError('Failed to optimize bullets. Please try again.')
    } finally {
      setOptimizing(null)
    }
  }

  function applyOptimizedBullet(ei: number, bulletIndex: number, optimizedText: string) {
    setBullet(ei, bulletIndex, optimizedText)
    setOptimizeResults(prev => {
      const updated = { ...prev }
      if (updated[ei]) updated[ei] = updated[ei].filter((_, i) => i !== bulletIndex)
      if (updated[ei]?.length === 0) delete updated[ei]
      return updated
    })
  }

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

  function addPub() {
    set('publications', [...(data.publications ?? []), { title: '', venue: '', year: '', authors: '' }])
  }
  function setPub(i: number, k: string, v: string) {
    const arr = (data.publications ?? []).map((p, j) => j === i ? { ...p, [k]: v } : p)
    set('publications', arr)
  }
  function removePub(i: number) {
    set('publications', (data.publications ?? []).filter((_, j) => j !== i))
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

    const printBodyFont = template === 'classic'
      ? 'Georgia, serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.name || 'Resume'} — EarnGro</title>
        <style>
          :root {
            --teal: #0e7a5a;
            --teal-d: #095c43;
            --teal-l: #f0faf5;
            --teal-xl: #f7fdfb;
            --teal-mid: #c8e9db;
            --border: #e5e2da;
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

      <div className="cvb-template-strip">
        {TEMPLATE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setTemplate(opt.id)}
            className={`cvb-template-chip${template === opt.id ? ' active' : ''}`}
          >
            {/* Simplified shape swatch — single-column templates show a
                stacked-lines shape, Sidebar shows a genuine two-column
                split, since that's the one structurally different
                template worth communicating visually. Accent color hints
                at each template's actual look without needing to render
                the real thing. */}
            <div className="cvb-swatch">
              {opt.swatchLayout === 'sidebar' ? (
                <div style={{ display: 'flex', gap: 3, height: '100%' }}>
                  <div style={{ width: '38%', background: opt.accent, borderRadius: 2 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 2 }}>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, width: '90%' }} />
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, width: '75%' }} />
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, width: '85%' }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '3px 4px', height: '100%' }}>
                  <div style={{ height: 4, background: opt.accent, borderRadius: 2, width: '55%', marginBottom: 2 }} />
                  <div style={{ height: 2.5, background: 'var(--border)', borderRadius: 2, width: '90%' }} />
                  <div style={{ height: 2.5, background: 'var(--border)', borderRadius: 2, width: '80%' }} />
                  <div style={{ height: 2.5, background: 'var(--border)', borderRadius: 2, width: '85%' }} />
                </div>
              )}
            </div>
            <span className="cvb-chip-label">{opt.label}</span>
            <span className={`cvb-chip-badge${opt.atsRisk === 'moderate' ? ' visual' : ''}`}>
              {opt.atsRisk === 'safe' ? 'ATS-safe' : 'Visual'}
            </span>
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>
        "ATS-safe" templates use a single column, the format automated hiring systems parse most reliably. "Visual" templates look more distinctive but carry a higher chance of being misread by some ATS software.
      </div>

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

      <div className="cvb-length-note" style={{ color: estimatedPages > 1.15 ? 'var(--amber)' : 'var(--muted)' }}>
        <span aria-hidden>📄</span> Estimated length: {estimatedPages.toFixed(1)} page{estimatedPages >= 1.5 ? 's' : ''}
        {estimatedPages > 1.15 && (
          <span> — most recruiters expect 1 page for this experience level. Consider trimming, unless you're targeting a senior/academic role.</span>
        )}
      </div>

      {error && <div className="cvb-error">{error}</div>}

      <div className="cvb-grid" data-tab={activeTab}>

        {activeTab === 'edit' && (
          <div className="cvb-edit-col">

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

            <div className="cvb-card">
              <div style={sectionHead}>Professional Summary</div>
              <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} value={data.summary ?? ''} onChange={e => set('summary', e.target.value)} placeholder="A compelling 2-3 sentence summary of your professional background and career goals." />
            </div>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <button onClick={() => addBullet(i)} style={{ fontSize: 11, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontWeight: 600 }}>+ Add bullet</button>
                      <button
                        onClick={() => optimizeBullets(i)}
                        disabled={optimizing === i || !exp.bullets?.some(b => b.trim())}
                        style={{ fontSize: 11, color: '#fff', background: 'var(--teal)', border: 'none', borderRadius: 99, padding: '4px 12px', cursor: optimizing === i ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', fontWeight: 600, opacity: optimizing === i ? 0.7 : 1 }}
                      >
                        {optimizing === i ? 'Optimizing…' : '✨ Optimize bullets'}
                      </button>
                    </div>
                    <button onClick={() => removeExp(i)} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }}>Remove role</button>
                  </div>

                  {/* NEW: skeleton placeholder shown WHILE the bullet-optimize
                      request is in flight, shaped like the actual result
                      card that will replace it — real use of the
                      previously-unused .skeleton/shimmer pattern, giving
                      visual feedback beyond just the button's text change. */}
                  {optimizing === i && (
                    <div style={{ marginTop: 10, padding: 12, background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-md)' }}>
                      <div className="skeleton" style={{ width: '85%', height: 12, marginBottom: 8 }} />
                      <div className="skeleton" style={{ width: '95%', height: 14, marginBottom: 8 }} />
                      <div className="skeleton" style={{ width: '60%', height: 11, marginBottom: 10 }} />
                      <div className="skeleton" style={{ width: 120, height: 24, borderRadius: 99 }} />
                    </div>
                  )}

                  {optimizeResults[i]?.map((opt, bi) => (
                    <div key={bi} style={{ marginTop: 10, padding: 12, background: 'var(--teal-xl)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)', textDecoration: 'line-through', marginBottom: 6 }}>{opt.original}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.5 }}>{opt.optimized}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--teal-d)', fontStyle: 'italic', marginBottom: 8 }}>{opt.explanation}</div>
                      <button
                        onClick={() => applyOptimizedBullet(i, bi, opt.optimized)}
                        style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'var(--teal)', border: 'none', borderRadius: 99, padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--sans)' }}
                      >
                        Apply this rewrite →
                      </button>
                    </div>
                  ))}

                  {bulletLimitReached[i] && (
                    <div style={{ marginTop: 10 }}>
                      <LimitReachedCard
                        reason="INSUFFICIENT_CREDITS"
                        feature="bullet_optimize"
                        balance={bulletLimitReached[i].balance}
                        required={bulletLimitReached[i].required}
                        plan={plan}
                      />
                    </div>
                  )}
                </div>
              ))}
              {(data.experience ?? []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>No experience added yet</div>
              )}
            </div>

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

            <div className="cvb-card">
              <div className="cvb-card-head">
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Education</div>
                <button onClick={addEdu} className="cvb-add-btn">+ Add</button>
              </div>
              {(data.education ?? []).map((edu, i) => (
                <div key={i} className="cvb-edu-row">
                  <div><label style={lbl}>Degree</label><input style={inp} value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} placeholder="B.Tech Computer Science" /></div>
                  <div><label style={lbl}>Institution</label><input style={inp} value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder="IIT Delhi" /></div>
                  <div className="cvb-edu-year-group">
                    <div style={{ flex: 1 }}><label style={lbl}>Year</label><input style={inp} value={edu.year ?? ''} onChange={e => setEdu(i, 'year', e.target.value)} placeholder="2019" /></div>
                    <button onClick={() => removeEdu(i)} className="cvb-remove-x" style={{ alignSelf: 'end' }}>×</button>
                  </div>
                </div>
              ))}
              {(data.education ?? []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>No education added yet</div>
              )}
            </div>

            <div className="cvb-card">
              <div className="cvb-card-head">
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Certifications</div>
                <button onClick={addCert} className="cvb-add-btn">+ Add</button>
              </div>
              {(data.certifications ?? []).map((cert, i) => (
                <div key={i} className="cvb-edu-row">
                  <div><label style={lbl}>Certification</label><input style={inp} value={cert.name} onChange={e => setCert(i, 'name', e.target.value)} placeholder="AWS Solutions Architect" /></div>
                  <div><label style={lbl}>Issuer</label><input style={inp} value={cert.issuer ?? ''} onChange={e => setCert(i, 'issuer', e.target.value)} placeholder="Amazon Web Services" /></div>
                  <div className="cvb-edu-year-group">
                    <div style={{ flex: 1 }}><label style={lbl}>Year</label><input style={inp} value={cert.year ?? ''} onChange={e => setCert(i, 'year', e.target.value)} placeholder="2023" /></div>
                    <button onClick={() => removeCert(i)} className="cvb-remove-x" style={{ alignSelf: 'end' }}>×</button>
                  </div>
                </div>
              ))}
              {(data.certifications ?? []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>No certifications added yet</div>
              )}
            </div>

            <div className="cvb-card">
              <div className="cvb-card-head">
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Publications</div>
                <button onClick={addPub} className="cvb-add-btn">+ Add</button>
              </div>
              {(data.publications ?? []).map((pub, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 12, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-l)' }}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={lbl}>Title</label>
                    <input style={inp} value={pub.title} onChange={e => setPub(i, 'title', e.target.value)} placeholder="Predictive Maintenance in IoT Networks" />
                  </div>
                  <div className="cvb-2col" style={{ marginBottom: 10 }}>
                    <div><label style={lbl}>Venue / Journal</label><input style={inp} value={pub.venue ?? ''} onChange={e => setPub(i, 'venue', e.target.value)} placeholder="IEEE Transactions on X" /></div>
                    <div><label style={lbl}>Year</label><input style={inp} value={pub.year ?? ''} onChange={e => setPub(i, 'year', e.target.value)} placeholder="2024" /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}><label style={lbl}>Authors</label><input style={inp} value={pub.authors ?? ''} onChange={e => setPub(i, 'authors', e.target.value)} placeholder="Kumar, R., Sharma, P." /></div>
                    <button onClick={() => removePub(i)} className="cvb-remove-x">×</button>
                  </div>
                </div>
              ))}
              {(data.publications ?? []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>No publications added yet</div>
              )}
            </div>

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

        <div className={`cvb-preview-col${activeTab === 'edit' ? ' cvb-preview-mobile-hidden' : ''}`}>
          <div className="cvb-preview-sticky">
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Live Preview
            </div>
            <ZoomablePreview>
              <CVPreview data={data} template={template} />
            </ZoomablePreview>
          </div>
        </div>

      </div>

      <style>{`
        .cvb-template-strip { display: flex; gap: 8px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
        .cvb-template-chip {
          flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 5px;
          width: 92px; padding: 8px; border-radius: var(--r-md); border: 1.5px solid var(--border);
          background: var(--paper); cursor: pointer; font-family: var(--sans); transition: all 0.15s;
        }
        .cvb-template-chip.active { border-color: var(--teal); background: var(--teal-l); box-shadow: 0 0 0 1px var(--teal); }
        .cvb-swatch { width: 100%; height: 46px; background: #fff; border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
        .cvb-chip-label { font-size: 11px; font-weight: 600; color: var(--ink); text-align: center; line-height: 1.2; }
        .cvb-chip-badge { font-size: 8.5px; font-weight: 700; padding: 1px 6px; border-radius: 99px; background: var(--teal-l); color: var(--teal-d); }
        .cvb-chip-badge.visual { background: var(--amber-l, #FEF3C7); color: var(--amber); }
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
        .cvb-length-note { font-size: 12px; margin-bottom: 14px; }
        .cvb-error { font-size: 13px; color: var(--red); background: var(--red-l); border: 1px solid #F5CCCC; border-radius: var(--r-md); padding: 10px 14px; margin-bottom: 14px; }

        .cvb-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(320px,1fr)); gap: 16px; }
        .cvb-grid[data-tab="preview"] { grid-template-columns: 1fr; }
        .cvb-edit-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        /* FIX: previously no shadow at all — every other card in the app
           (Dashboard, GrowPath, Billing) now has consistent depth via
           --shadow-sm. This was the one place still flat. */
        .cvb-card { background: var(--paper); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px; box-shadow: var(--shadow-sm); }
        .cvb-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .cvb-add-btn { font-size: 12px; font-weight: 600; color: var(--teal); background: var(--teal-l); border: 1px solid var(--teal-mid); border-radius: 99px; padding: 5px 14px; cursor: pointer; font-family: var(--sans); }
        .cvb-remove-x { padding: 8px 10px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: var(--red); cursor: pointer; font-size: 14px; flex-shrink: 0; }

        .cvb-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cvb-exp-row { margin-bottom: 16px; padding: 14px; background: var(--paper-2); border-radius: var(--r-md); border: 1px solid var(--border-l); }
        .cvb-edu-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-bottom: 8px; align-items: end; }
        .cvb-edu-year-group { display: flex; gap: 8px; align-items: end; min-width: 140px; }

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