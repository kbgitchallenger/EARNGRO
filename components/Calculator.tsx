//app/components/Calculator.tsx
'use client'

import { useState, useRef } from 'react'
import { saveCalcPrefill } from '@/lib/growdna/calcPrefill'
interface Result {
  target_salary: number; salary_range_min: number; salary_range_max: number
  gap_amount: number; gap_percentage: number; months_to_close: number
  hiring_readiness_score: number; gap_percentile: string; market_context: string
  data_source_note: string; gap_reasons: string[]; close_actions: string[]
}

const fmt = (n: number) => {
  if (!n || isNaN(n)) return '—'
  const v = Math.round(n)
  if (v >= 10000000) return '₹' + (v/10000000).toFixed(1) + 'Cr'
  if (v >= 100000)   return '₹' + (v/100000).toFixed(1) + 'L'
  return '₹' + v.toLocaleString('en-IN')
}

const OPTS = {
  industry:   ['Technology / Software','Banking & Finance','Marketing & Advertising','Healthcare & Pharma','Education & EdTech','Manufacturing & Engineering','Management Consulting','E-commerce & Retail','Media & Content','Real Estate','Logistics & Supply Chain','Government / PSU','Other'],
  experience: ['0–1 years (fresher)','2–3 years','4–6 years','7–10 years','11–15 years','16+ years'],
  role:       ['Software / Data Engineer','Engineering Manager / Tech Lead','Data Scientist / ML Engineer','Product Manager','Business / Data Analyst','UX / UI Designer','Sales / Business Development','Marketing Manager','HR / Talent Acquisition','Finance / Accounts Manager','Operations Manager','Management Consultant','Content / Copywriter','Other professional role'],
  city:       ['Bengaluru, India','Mumbai, India','Delhi NCR, India','Hyderabad, India','Pune, India','Chennai, India','Kolkata, India','Ahmedabad, India','Tier 2 city, India','Singapore','Kuala Lumpur, Malaysia','Manila, Philippines','Jakarta, Indonesia','Bangkok, Thailand','Ho Chi Minh City, Vietnam'],
  education:  ["High School / 12th","Diploma / ITI","Bachelor's degree","B.Tech from IIT/NIT/premium college","MBA / Master's degree","MBA from IIM/ISB/top school","PhD / Doctorate"],
  company:    ['Early-stage startup (under 50)','Growth-stage startup (50–500)','Mid-size Indian company','Large Indian conglomerate','Indian MNC / listed company','Global MNC','Government / PSU','Freelance / Self-employed'],
}

// ── Field subtitles — same voice as GrowDNA questions ────────────
const FIELD_SUBTITLES: Record<string, string> = {
  industry:   'The single biggest factor in your market rate — same role can pay 2× across industries',
  experience: 'Career stage determines which benchmarks we compare you against',
  role:       'Pick the closest match — affects your skill benchmarks and gap calculation',
  city:       'Location adds or removes up to 35% from your number',
  education:  'College brand affects earning ceiling, especially in early and mid career',
  company:    'Employer brand is a top salary multiplier — same role pays differently by company type',
}

const STEPS = ['Pulling salary benchmarks for your role & city','Benchmarking against verified profiles in your industry','Identifying your skill gaps and market opportunities','Calculating your personalised Earning Gap']

const inp: React.CSSProperties = {
  width:'100%', padding:'11px 14px', fontFamily:'var(--sans)', fontSize:13,
  color:'var(--ink)', background:'var(--paper)', border:'1.5px solid var(--border)',
  borderRadius:'var(--r-md)', outline:'none', appearance:'none', WebkitAppearance:'none', cursor:'pointer',
}
const lbl: React.CSSProperties = {
  display:'block', fontSize:11, fontWeight:600, color:'var(--muted)',
  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3,
}
const sub: React.CSSProperties = {
  display:'block', fontSize:11, color:'var(--teal-d)', marginBottom:7, lineHeight:1.4,
}

export default function Calculator() {
  const [f, setF] = useState({ industry:'', experience:'', role:'', city:'', salary:'', education:'', company:'', skills:'' })
  const [state,  setState]  = useState<'form'|'loading'|'result'>('form')
  const [step,   setStep]   = useState(0)
  const [result, setResult] = useState<Result|null>(null)
  const [error,  setError]  = useState('')
  const [open,   setOpen]   = useState<string|null>('reasons')
  const gapEl = useRef<HTMLDivElement>(null)

  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }))

  function validate() {
    for (const k of ['industry','experience','role','city','salary','education','company']) {
      if (!f[k as keyof typeof f]) {
        setError('Please complete all fields — each one helps EarnGro give you an accurate personalised result.')
        return false
      }
    }
    if (parseFloat(f.salary) < 10000) { setError('Please enter a valid annual salary (minimum ₹10,000).'); return false }
    setError(''); return true
  }

  function countUp(el: HTMLElement, end: string) {
    const m = end.match(/([\d.]+)/)
    if (!m) { el.textContent = end; return }
    const num = parseFloat(m[1])
    const pre = end.slice(0, end.indexOf(m[1]))
    const suf = end.slice(end.indexOf(m[1]) + m[1].length)
    const t0 = performance.now(), dur = 1500
    const tick = (t: number) => {
      const p = Math.min((t-t0)/dur, 1), e = 1-Math.pow(1-p,4)
      el.textContent = pre + (Number.isInteger(num) ? Math.round(num*e) : parseFloat((num*e).toFixed(1))) + suf
      if (p < 1) requestAnimationFrame(tick); else el.textContent = end
    }
    requestAnimationFrame(tick)
  }

  async function run() {
    if (!validate()) return
    setState('loading'); setStep(0)
    for (let i = 0; i < 4; i++) setTimeout(() => setStep(i), i * 950)
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, salary: parseFloat(f.salary) }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setState('form')
        setError(data.message ?? "You've reached today's free limit — create an account for unlimited access.")
        return
      }

      if (!res.ok) throw new Error('API ' + res.status)
      const data: Result = await res.json()
      setResult(data); setState('result')
      setTimeout(() => { if (gapEl.current) countUp(gapEl.current, fmt(data.gap_amount)) }, 300)
    } catch (e) {
      setState('form')
      setError('Analysis failed. Please check your connection and try again.')
    }
  }

  function share() {
    if (!result) return
    const t = `My Earning Gap is ${fmt(result.gap_amount)}/year.\n\nI discovered this using EarnGro's free AI calculator.\n\nFind yours → earngro.com\n\n#EarnGro #EarningGap #CareerGrowth #India`
    navigator.share ? navigator.share({ text:t, url:'https://earngro.com' }).catch(() => navigator.clipboard.writeText(t))
                    : navigator.clipboard.writeText(t).then(() => alert('Copied! Paste on LinkedIn.'))
  }

  const bp = result
    ? Math.min(90, Math.max(8, Math.round(((parseFloat(f.salary) - result.salary_range_min) / (result.salary_range_max - result.salary_range_min)) * 100)))
    : 50

  return (
    <div style={{ background:'var(--paper)', border:'1px solid var(--teal-mid)', borderRadius:'var(--r-xl)', overflow:'hidden', boxShadow:'var(--sh-lg)' }}>

      {/* ── HEAD — Change 1: framing as Step 1 of GrowPath ── */}
      <div style={{ padding:'28px 32px 22px', borderBottom:'1px solid var(--border)', background:'linear-gradient(180deg,var(--teal-xl),var(--paper))' }}>
        <div style={{ fontSize:11, color:'var(--teal-d)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
          Step 1 of your GrowPath · 2 minutes
        </div>
        <div style={{ fontFamily:'var(--serif)', fontSize:24, fontWeight:600, color:'var(--ink)', marginBottom:5 }}>Earning Gap Calculator</div>
        <div style={{ fontSize:13, color:'var(--muted)', marginBottom:10 }}>
          Fill your profile · get a market-backed personalised result
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'var(--teal-l)', border:'1px solid var(--teal-mid)', color:'var(--teal-d)', fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:99 }}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          AI market intelligence · not hardcoded multipliers
        </div>
      </div>

      {/* ── FORM — Change 2: field subtitles matching GrowDNA voice ── */}
      {state === 'form' && (
        <div style={{ padding:'28px 32px' }}>
          {[
            [['industry','Industry'],['experience','Years of experience']],
            [['role','Current role'],['city','City / Market']],
          ].map((row,ri) => (
            <div key={ri} style={{ marginBottom:16 }}>
              <div className="field-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {row.map(([key,label]) => (
                  <div key={key}>
                    <label style={lbl}>{label}</label>
                    {FIELD_SUBTITLES[key] && (
                      <span style={sub}>{FIELD_SUBTITLES[key]}</span>
                    )}
                    <select style={inp} value={f[key as keyof typeof f]} onChange={e => set(key, e.target.value)}>
                      <option value="">Select {label.toLowerCase()}</option>
                      {OPTS[key as keyof typeof OPTS].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Current annual salary / CTC</label>
            <span style={sub}>Include base salary only — no variable or ESOPs. This is the gap calculation baseline.</span>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--muted)', pointerEvents:'none', fontWeight:500 }}>₹</span>
              <input type="number" style={{ ...inp, paddingLeft:26 }} placeholder="e.g. 800000 for ₹8 Lakhs" value={f.salary} onChange={e => set('salary',e.target.value)} onKeyDown={e => e.key==='Enter' && run()} />
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div className="field-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['education','Highest education'],['company','Employer type']].map(([key,label]) => (
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  {FIELD_SUBTITLES[key] && (
                    <span style={sub}>{FIELD_SUBTITLES[key]}</span>
                  )}
                  <select style={inp} value={f[key as keyof typeof f]} onChange={e => set(key,e.target.value)}>
                    <option value="">Select {label.toLowerCase()}</option>
                    {OPTS[key as keyof typeof OPTS].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Key skills</label>
            <span style={sub}>2+ premium skills puts you in the top 20% of earners for your role — include your strongest ones</span>
            <input type="text" style={inp} placeholder="e.g. Python, AWS, Salesforce, financial modelling" value={f.skills} onChange={e => set('skills',e.target.value)} />
          </div>

          {error && (
            error.includes("today's free limit") ? (
              <div style={{ background:'var(--teal-xl)', border:'1px solid var(--teal-mid)', borderRadius:'var(--r-md)', padding:'14px 16px', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                <div style={{ fontSize:13, color:'var(--teal-d)', lineHeight:1.5 }}>{error}</div>
               <button
  onClick={() => {
    saveCalcPrefill({
      industry: f.industry,
      experience: f.experience,
      role: f.role,
      city: f.city,
      salary: f.salary,
    })
    window.location.href = '/signup'
  }}
  style={{ background:'#fff', color:'var(--teal-d)', fontSize:13, fontWeight:700, padding:'11px 22px', borderRadius:99, border:'none', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.12)', whiteSpace:'nowrap', fontFamily:'var(--sans)' }}
>
  Get your full GrowDNA report — free →
</button>
              </div>
            ) : (
              <div style={{ background:'var(--red-l)', border:'1px solid #F5CCCC', borderRadius:'var(--r-md)', padding:'10px 14px', fontSize:13, color:'var(--red)', marginBottom:14 }}>{error}</div>
            )
          )}

          <button onClick={run} style={{ width:'100%', padding:14, background:'var(--teal)', color:'#fff', fontFamily:'var(--sans)', fontSize:15, fontWeight:600, border:'none', borderRadius:'var(--r-md)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(14,122,90,0.22)' }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Analyse my Earning Gap
          </button>
        </div>
      )}

      {/* ── LOADING ── unchanged ── */}
      {state === 'loading' && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'44px 24px', textAlign:'center' }}>
          <div style={{ width:44, height:44, border:'3px solid var(--teal-l)', borderTop:'3px solid var(--teal)', borderRadius:'50%', animation:'spin 0.85s linear infinite', marginBottom:18 }} />
          <div style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)', marginBottom:5 }}>Analysing your profile…</div>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:18 }}>AI checking live market intelligence for your role</div>
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:6 }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderRadius:'var(--r-md)', fontSize:12, background: i===step ? 'var(--teal-l)' : 'var(--paper-2)', color: i===step ? 'var(--teal-d)' : 'var(--muted)', border:`1px solid ${i===step ? 'var(--teal-mid)' : 'transparent'}`, opacity: i>step ? 0.4 : 1, transition:'all 0.3s' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'currentColor', flexShrink:0, display:'inline-block' }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULT ── Change 3: upgraded GrowDNA bridge CTA ── */}
      {state === 'result' && result && (
        <div style={{ padding:'24px 32px 28px', animation:'up 0.5s cubic-bezier(0.16,1,0.3,1)' }}>

          {/* gap hero */}
          <div style={{ background:'linear-gradient(135deg,var(--teal-d),var(--teal))', borderRadius:'var(--r-lg)', padding:28, textAlign:'center', marginBottom:16, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-50, right:-50, width:150, height:150, background:'rgba(255,255,255,0.06)', borderRadius:'50%' }} />
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10, position:'relative', zIndex:1 }}>Your annual earning gap</div>
            <div ref={gapEl} style={{ fontFamily:'var(--serif)', fontSize:'clamp(44px,8vw,64px)', fontWeight:700, color:'#fff', lineHeight:1, letterSpacing:'-1.5px', position:'relative', zIndex:1 }}>{fmt(result.gap_amount)}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', marginTop:7, position:'relative', zIndex:1 }}>{result.gap_percentage}% more than your current salary · every year</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:99, marginTop:14, position:'relative', zIndex:1 }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              EarnGro closes this in {result.months_to_close} months
            </div>
          </div>

          {/* confidence band */}
          <div style={{ background:'var(--teal-xl)', border:'1px solid var(--teal-mid)', borderRadius:'var(--r-md)', padding:16, marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--teal-d)', marginBottom:4 }}>Market salary range for your profile</div>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:12 }}>{result.market_context}</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--teal-d)', whiteSpace:'nowrap' }}>{fmt(result.salary_range_min)}</span>
              <div style={{ flex:1, height:7, background:'var(--teal-mid)', borderRadius:99, position:'relative' }}>
                <div style={{ height:'100%', background:'linear-gradient(90deg,var(--amber-mid),var(--teal))', borderRadius:99, width:`${bp}%` }} />
                <div style={{ position:'absolute', top:-3, width:13, height:13, borderRadius:'50%', background:'var(--paper)', border:'2.5px solid var(--teal-d)', left:`calc(${bp}% - 6px)` }} />
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--teal-d)', whiteSpace:'nowrap' }}>{fmt(result.salary_range_max)}</span>
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:8 }}>
              Your current salary · <span style={{ color:'var(--teal-d)', fontWeight:600 }}>{bp<30 ? 'Below market median' : bp<55 ? 'Near market median' : 'At or above median'} ({bp}th percentile)</span>
            </div>
          </div>

          {/* source */}
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11, color:'var(--muted)', marginBottom:14 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', flexShrink:0, display:'inline-block' }} />
            {result.data_source_note}
          </div>

          {/* stat grid */}
          <div className="res-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[
              { l:'Current CTC',      v:fmt(parseFloat(f.salary))+'/yr', c:'var(--ink)' },
              { l:'Your market value',v:fmt(result.target_salary)+'/yr',  c:'var(--teal)' },
              { l:'Hiring Readiness', v:result.hiring_readiness_score+' / 1000', c:'var(--amber)' },
              { l:'Gap insight',      v:result.gap_percentile, c:'var(--ink)', sm:true },
            ].map((item,i) => (
              <div key={i} style={{ background:'var(--paper-2)', border:'1px solid var(--border-l)', borderRadius:'var(--r-md)', padding:13 }}>
                <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{item.l}</div>
                <div style={{ fontSize:item.sm?12:15, fontWeight:600, color:item.c }}>{item.v}</div>
              </div>
            ))}
          </div>

          {/* intel accordions */}
          {[
            { id:'reasons', icon:'?', label:'Why this gap exists — AI analysis',  items:result.gap_reasons  },
            { id:'actions', icon:'+', label:'How to close it — your top actions', items:result.close_actions },
          ].map(({ id, icon, label, items }) => (
            <div key={id} style={{ border:'1px solid var(--border)', borderRadius:'var(--r-md)', overflow:'hidden', marginBottom:10, background:'var(--paper)' }}>
              <div onClick={() => setOpen(open===id ? null : id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', cursor:'pointer', transition:'background 0.15s' }}>
                <svg style={{ color:'var(--teal)', flexShrink:0 }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={id==='reasons'
                    ? "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M13 10V3L4 14h7v7l9-11h-7z"} />
                </svg>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--ink)', flex:1 }}>{label}</span>
                <svg style={{ color:'var(--muted)', transition:'transform 0.25s', transform: open===id ? 'rotate(180deg)' : 'none', flexShrink:0 }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              {open === id && (
                <div style={{ padding:'14px 16px' }}>
                  {items.map((item,i) => (
                    <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom: i<items.length-1 ? '1px solid var(--border-l)' : 'none', fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>
                      <div style={{ width:22, height:22, minWidth:22, borderRadius:'50%', background:'var(--teal-l)', border:'1px solid var(--teal-mid)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'var(--teal-d)', marginTop:2 }}>
                        {id==='reasons' ? '!' : i+1}
                      </div>
                      <div>{item}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* ── GrowDNA bridge — the key coherence fix ── */}
          <div style={{ background:'linear-gradient(135deg, var(--teal-d), var(--teal))', borderRadius:'var(--r-lg)', padding:'22px 20px', marginBottom:10, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
                This was a preview
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:8, lineHeight:1.4 }}>
                Your full GrowDNA report goes 5× deeper
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', lineHeight:1.65, marginBottom:16 }}>
                The calculator uses 7 inputs. GrowDNA uses your negotiation history, employer brand, premium skills, and career velocity — then gives you your career archetype, a 5-dimension breakdown, and a month-by-month roadmap to close {fmt(result.gap_amount)}.
              </div>
              {/* What you unlock */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:18 }}>
                {[
                  { ico:'🧬', t:'Career archetype' },
                  { ico:'📊', t:'5 earning dimensions' },
                  { ico:'🗺️', t:'GrowPath roadmap' },
                  { ico:'🎯', t:'AI interview practice' },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'rgba(255,255,255,0.85)' }}>
                    <span>{item.ico}</span>
                    <span>{item.t}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <a href="/signup" style={{ background:'#fff', color:'var(--teal-d)', fontSize:13, fontWeight:700, padding:'11px 22px', borderRadius:99, textDecoration:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.12)', whiteSpace:'nowrap' }}>
                  Get your full GrowDNA report — free →
                </a>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>No credit card · 4 minutes</span>
              </div>
            </div>
          </div>

          {/* secondary actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button onClick={share} style={{ width:'100%', padding:12, background:'var(--paper)', color:'var(--teal-d)', fontFamily:'var(--sans)', fontSize:13, fontWeight:500, border:'1.5px solid var(--teal-mid)', borderRadius:'var(--r-md)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              Share my Earning Gap on LinkedIn
            </button>
            <button onClick={() => { setState('form'); setResult(null) }} style={{ width:'100%', padding:10, background:'transparent', color:'var(--muted)', fontFamily:'var(--sans)', fontSize:12, border:'none', cursor:'pointer' }}>
              ← Recalculate with different inputs
            </button>
          </div>
        </div>
      )}
    </div>
  )
}