'use client'

import { useEffect, useRef, useState } from 'react'

const PROFILES = [
  { av:'RK', name:'Ravi Kumar',  role:'Software Engineer · Bengaluru', curr:'₹13.4L', target:'₹23L',  gap:'₹9.6L / yr', months:11, uplift:'72% growth', bars:[62,71,48] },
  { av:'PS', name:'Priya Sharma', role:'Marketing Manager · Mumbai',   curr:'₹8.2L',  target:'₹13.5L',gap:'₹5.3L / yr', months:8,  uplift:'64% growth', bars:[55,80,42] },
  { av:'AJ', name:'Arjun Joshi',  role:'Data Scientist · Hyderabad',   curr:'₹16L',   target:'₹28L',  gap:'₹12L / yr',  months:14, uplift:'75% growth', bars:[70,65,55] },
  { av:'DR', name:'Divya Rao',    role:'Product Manager · Delhi NCR',  curr:'₹22L',   target:'₹34L',  gap:'₹12L / yr',  months:12, uplift:'54% growth', bars:[78,74,60] },
  { av:'SN', name:'Siti Nadia',   role:'Finance Analyst · Jakarta',    curr:'₹9L',    target:'₹14.5L',gap:'₹5.5L / yr', months:9,  uplift:'61% growth', bars:[60,68,50] },
]

export default function JourneyCard() {
  const [idx,    setIdx]    = useState(0)
  const [prof,   setProf]   = useState(PROFILES[0])
  const [arcGo,  setArcGo]  = useState(false)
  const [bars,   setBars]   = useState([0,0,0])
  const [vis,    setVis]    = useState(true)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  /* arc + bars fire on mount */
  useEffect(() => {
    const t = setTimeout(() => { setArcGo(true); setBars(PROFILES[0].bars) }, 700)
    return () => clearTimeout(t)
  }, [])

  /* cycle profiles — pauses on hover/focus, same accessibility pattern
     already applied to the ticker (WCAG 2.2.2: continuously-changing
     content needs a way to pause it). This card auto-rotates a name,
     role, and set of numbers every 4.5s with no prior way to stop it. */
  useEffect(() => {
    if (paused) return
    timer.current = setInterval(() => {
      setVis(false)
      setTimeout(() => {
        const next = (idx + 1) % PROFILES.length
        setIdx(next); setProf(PROFILES[next]); setBars(PROFILES[next].bars); setVis(true)
      }, 280)
    }, 4500)
    return () => {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }
  }, [idx, paused])

  const amberOff = arcGo ? 160 : 251
  const tealOff  = arcGo ? 60  : 251
  const fade     = { opacity: vis ? 1 : 0, transition: 'opacity 0.25s' } as React.CSSProperties

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
      aria-label="Example career journey — cycles through sample profiles, pauses on hover or focus"
      style={{
        // FIX: background was var(--paper) (cream) with
        // boxShadow: 'var(--sh-lg)' — a token that doesn't exist anywhere
        // in the design system (only --shadow-lg does), so this, the
        // very first card a visitor sees on the homepage, was rendering
        // with zero shadow. Now white (per the new "more white, clean"
        // direction) with the real token.
        background: '#ffffff', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: '26px 26px 22px',
        maxWidth: 500, margin: '0 auto 40px',
        boxShadow: 'var(--shadow-lg)', position: 'relative',
        overflow: 'hidden', textAlign: 'left',
      }}>
      {/* top accent line — amber → teal */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--amber),var(--teal),#1AA574)', borderRadius:'var(--r-xl) var(--r-xl) 0 0' }} />

      {/* live badge */}
      <div style={{ position:'absolute', top:14, right:18, display:'flex', alignItems:'center', gap:5, background:'var(--teal-l)', border:'1px solid var(--teal-mid)', color:'var(--teal-d)', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:99, letterSpacing:'0.04em', textTransform:'uppercase' }}>
        <span style={{ width:5, height:5, background:'var(--teal)', borderRadius:'50%', animation:'pulse 1.8s infinite', display:'inline-block' }} />
        Live preview
      </div>

      {/* user row */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22, ...fade }}>
        <div style={{ width:38, height:38, background:'linear-gradient(135deg,var(--teal-l),var(--teal-mid))', borderRadius:'50%', border:'2px solid var(--teal-mid)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color:'var(--teal-d)', flexShrink:0 }}>
          {prof.av}
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)' }}>{prof.name}</div>
          <div style={{ fontSize:11, color:'var(--muted)' }}>{prof.role}</div>
        </div>
      </div>

      {/* sunrise arc */}
      <div style={{ position:'relative', width:200, height:108, margin:'0 auto 20px' }}>
        <svg width="200" height="108" viewBox="0 0 200 108" style={{ display:'block' }}>
          <path fill="none" stroke="var(--border)" strokeWidth="9" strokeLinecap="round" d="M18 100 A82 82 0 0 1 182 100" />
          <path fill="none" stroke="var(--amber-mid)" strokeWidth="9" strokeLinecap="round"
            strokeDasharray="251"
            style={{ strokeDashoffset: amberOff, transition:'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            d="M18 100 A82 82 0 0 1 182 100" />
          <path fill="none" stroke="var(--teal)" strokeWidth="9" strokeLinecap="round" opacity="0.85"
            strokeDasharray="251"
            style={{ strokeDashoffset: tealOff, transition:'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1) 0.4s' }}
            d="M18 100 A82 82 0 0 1 182 100" />
        </svg>
        {/* FIX: removed a stray empty <br /> that served no purpose —
            leftover markup from an earlier edit. */}
        {/* FIX: top:'52%' centered this text block too close to the
            arc's peak — the arc's highest stroke point sits right at
            the top-center of the semicircle, and 52% didn't leave
            enough clearance below it, so "Projected CTC" visually
            overlapped the teal stroke. Nudged down to clear it. */}
        <div style={{ position:'absolute', top:'62%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
          <div
            style={{
              fontSize: 9, color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
              whiteSpace: 'nowrap',
            }}
          >
            Projected CTC
          </div>

          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 28,
              fontWeight: 600,
              color: 'var(--teal-d)',
              lineHeight: 1,
              letterSpacing: '-0.5px',
              ...fade,
            }}
          >
            {prof.target}
          </div>

          <div
            style={{
              fontSize: 11,
              color: 'var(--teal)',
              fontWeight: 500,
              marginTop: 4,
              ...fade,
            }}
          >
            ↑ {prof.uplift}
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16, ...fade }}>
        <div style={{ background:'var(--paper-2)', border:'1px solid var(--border-l)', borderRadius:'var(--r-md)', padding:'12px 14px' }}>
          <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Current CTC</div>
          <div style={{ fontSize:16, fontWeight:600, color:'var(--ink)' }}>{prof.curr}</div>
        </div>
        <div style={{ background:'var(--paper-2)', border:'1px solid var(--border-l)', borderRadius:'var(--r-md)', padding:'12px 14px' }}>
          <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Earning Gap</div>
          <div style={{ fontSize:16, fontWeight:600, color:'var(--red)' }}>{prof.gap}</div>
        </div>
      </div>

      {/* bars */}
      <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:18 }}>
        {[
          { lbl:'Interview ready', col:'var(--amber)',    pct:bars[0] },
          { lbl:'CV strength',     col:'var(--teal)',     pct:bars[1] },
          { lbl:'Skill match',     col:'#1AA574',         pct:bars[2] },
        ].map((b,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:11, color:'var(--muted)', width:88, flexShrink:0 }}>{b.lbl}</div>
            <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:99, background:b.col, width:`${b.pct}%`, transition:'width 1.8s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div style={{ fontSize:11, fontWeight:600, width:32, textAlign:'right', color:b.col, flexShrink:0 }}>{b.pct}%</div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, paddingTop:14, borderTop:'1px solid var(--border-l)' }}>
        <div style={{ fontSize:12, color:'var(--muted)', ...fade }}>
          Closes in {' '}<strong style={{ color:'var(--teal-d)' }}>{prof.months} months</strong>
        </div>
        <a href="#calculator" style={{ background:'var(--teal)', color:'#fff', fontSize:12, fontWeight:600, padding:'8px 18px', borderRadius:99, textDecoration:'none', boxShadow:'var(--shadow-teal)', whiteSpace:'nowrap' }}>
          Find my gap →
        </a>
      </div>
    </div>
  )
}