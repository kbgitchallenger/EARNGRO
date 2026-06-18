'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CVPreview from './CVPreview'
import type { ParsedResume } from '@/lib/ai/validators/resume.validator'

const EMPTY: ParsedResume = {
  name: '', email: '', phone: '', location: '', summary: '',
  experience: [], education: [], skills: [], certifications: [],
  total_experience_years: 0,
  seniority_level: 'junior',   // ← add
  primary_role: '',              // ← add
  languages: [],                 // ← add
  industry_signals: [],          // ← add
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

export default function CVBuilder({ initialData }: { initialData?: ParsedResume }) {
  const [data, setData] = useState<ParsedResume>(initialData ?? EMPTY)
  const [name, setName] = useState('My Resume')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const router = useRouter()

  const set = (k: keyof ParsedResume, v: unknown) =>
    setData(p => ({ ...p, [k]: v }))

  // Experience helpers
  function addExp() {
    set('experience', [...(data.experience ?? []), { company: '', role: '', start_date: '', end_date: '', is_current: false, bullets: [''] }])
  }
  function setExp(i: number, k: string, v: unknown) {
    const arr = [...(data.experience ?? [])]
    arr[i] = { ...arr[i], [k]: v }
    set('experience', arr)
  }
  function removeExp(i: number) {
    set('experience', (data.experience ?? []).filter((_, j) => j !== i))
  }
  function addBullet(ei: number) {
    const arr = [...(data.experience ?? [])]
    arr[ei].bullets = [...(arr[ei].bullets ?? []), '']
    set('experience', arr)
  }
  function setBullet(ei: number, bi: number, v: string) {
    const arr = [...(data.experience ?? [])]
    arr[ei].bullets[bi] = v
    set('experience', arr)
  }
  function removeBullet(ei: number, bi: number) {
    const arr = [...(data.experience ?? [])]
    arr[ei].bullets = arr[ei].bullets.filter((_, j) => j !== bi)
    set('experience', arr)
  }

  // Education helpers
  function addEdu() {
    set('education', [...(data.education ?? []), { institution: '', degree: '', year: '' }])
  }
  function setEdu(i: number, k: string, v: string) {
    const arr = [...(data.education ?? [])]
    arr[i] = { ...arr[i], [k]: v }
    set('education', arr)
  }
  function removeEdu(i: number) {
    set('education', (data.education ?? []).filter((_, j) => j !== i))
  }

  async function save() {
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
    } catch (err) {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'edit', label: '✏️ Edit' },
    { id: 'preview', label: '👁️ Preview' },
  ] as const

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 0, background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '9px 20px', background: activeTab === tab.id ? 'var(--teal)' : 'transparent', color: activeTab === tab.id ? '#fff' : 'var(--muted)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--sans)' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Resume name" style={{ ...inp, width: 160 }} />
          <button
            onClick={() => window.print()}
            style={{ background: 'var(--paper)', color: 'var(--ink)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save PDF
          </button>
          <button onClick={save} disabled={saving} style={{ background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'var(--sans)', whiteSpace: 'nowrap' }}>
            {saving ? 'Saving…' : '💾 Save & Analyse'}
          </button>
        </div>
      </div>
      

      {/* Two-column layout on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'preview' ? '1fr' : 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>

        {/* Edit panel */}
        {activeTab === 'edit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Personal Info */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={sectionHead}>Personal Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Full Name *</label><input style={inp} value={data.name} onChange={e => set('name', e.target.value)} placeholder="Ravi Kumar" /></div>
                <div><label style={lbl}>Email</label><input style={inp} type="email" value={data.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="ravi@company.com" /></div>
                <div><label style={lbl}>Phone</label><input style={inp} value={data.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" /></div>
                <div><label style={lbl}>Location</label><input style={inp} value={data.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="Bengaluru, India" /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Total Experience (years)</label><input style={inp} type="number" min="0" value={data.total_experience_years} onChange={e => set('total_experience_years', +e.target.value)} /></div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={sectionHead}>Professional Summary</div>
              <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} value={data.summary ?? ''} onChange={e => set('summary', e.target.value)} placeholder="A compelling 2-3 sentence summary of your professional background and career goals." />
            </div>

            {/* Experience */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Experience</div>
                <button onClick={addExp} style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', borderRadius: 99, padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>+ Add role</button>
              </div>
              {(data.experience ?? []).map((exp, i) => (
                <div key={i} style={{ marginBottom: 16, padding: 14, background: 'var(--paper-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-l)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
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
                    <div key={bi} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input style={{ ...inp, flex: 1 }} value={b} onChange={e => setBullet(i, bi, e.target.value)} placeholder="Achieved X by doing Y resulting in Z" />
                      <button onClick={() => removeBullet(i, bi)} style={{ padding: '0 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: 'var(--red)', cursor: 'pointer', fontSize: 14 }}>×</button>
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
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
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
            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Education</div>
                <button onClick={addEdu} style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', borderRadius: 99, padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>+ Add</button>
              </div>
              {(data.education ?? []).map((edu, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                  <div><label style={lbl}>Degree</label><input style={inp} value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} placeholder="B.Tech Computer Science" /></div>
                  <div><label style={lbl}>Institution</label><input style={inp} value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder="IIT Delhi" /></div>
                  <div><label style={lbl}>Year</label><input style={inp} value={edu.year ?? ''} onChange={e => setEdu(i, 'year', e.target.value)} placeholder="2019" /></div>
                  <button onClick={() => removeEdu(i)} style={{ padding: '9px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', color: 'var(--red)', cursor: 'pointer', fontSize: 14 }}>×</button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Preview panel — always visible on desktop, tab on mobile */}
        <div style={{ display: activeTab === 'edit' ? 'block' : 'block' }}>
          <div style={{ position: 'sticky', top: 70 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Live Preview
            </div>
            <CVPreview data={data} />
          </div>
        </div>

      </div>
    </div>
  )
}