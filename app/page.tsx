import Link from 'next/link'
import Navbar from '@/components/Navbar'
import JourneyCard from '@/components/JourneyCard'
import CalculatorPreview from '@/components/CalculatorPreview'
import ScrollReveal from '@/components/ScrollReveal'

const TICKER = [
  { amt:'₹6.2L',  name:'Priya S.',  role:'Marketing Manager · Mumbai',      time:'2h ago' },
  { amt:'₹11.4L', name:'Arjun M.',  role:'Data Scientist · Bengaluru',       time:'3h ago' },
  { amt:'₹4.8L',  name:'Divya R.',  role:'HR Manager · Delhi',               time:'4h ago' },
  { amt:'₹8.9L',  name:'Carlos T.', role:'Product Manager · Manila',         time:'5h ago' },
  { amt:'₹3.6L',  name:'Ananya K.', role:'Fresh Graduate · Hyderabad',       time:'6h ago' },
  { amt:'₹14.2L', name:'Rahul P.',  role:'Engineering Lead · Singapore',     time:'7h ago' },
  { amt:'₹5.5L',  name:'Siti N.',   role:'Finance Analyst · Jakarta',        time:'8h ago' },
  { amt:'₹7.3L',  name:'Vikram S.', role:'Consultant · Pune',                time:'9h ago' },
]

const HOW = [
  { n:'01', ico:'🧬', t:'GrowDNA profile',    d:'Deep assessment that validates your real skills, finds hidden earning assets, and benchmarks you against verified peers in your city.' },
  { n:'02', ico:'📊', t:'Earning Gap revealed',d:'Your exact gap in rupees per year — calculated by AI against live market intelligence, not generic salary tables.', hi:true },
  { n:'03', ico:'🗺️', t:'GrowPath built',      d:'Month-by-month financial plan for your career. Exact skill targets, salary milestones, timelines, and specific companies to target.' },
  { n:'04', ico:'🎯', t:'Daily GrowReady',     d:'AI interview practice, living CV, skill sprints, salary negotiation coaching — every feature connects to closing your gap.' },
  { n:'05', ico:'💰', t:'GrowMore income',     d:'Beyond salary — freelance launcher, promotion accelerator, side income tools tracked in one total earning growth dashboard.' },
]

const TESTS = [
  { badge:'Gap closed: ₹5.4L / yr', av:'RK', name:'Ravi Kumar',  role:'Software Engineer · Pune → Bengaluru', quote:'I had no idea I was being underpaid by this much. EarnGro showed me exactly what skill I was missing. Got an offer in 9 weeks.' },
  { badge:'Gap found: ₹3.2L / yr',  av:'PS', name:'Priya Sharma', role:'Fresh Graduate · Mumbai',             quote:'As a fresher I didn\'t know what I was worth. EarnGro showed me market rate before my first interview. I negotiated ₹2L more.' },
  { badge:'Gap closed: ₹8.1L / yr', av:'AJ', name:'Arjun Joshi',  role:'Mid-career Professional · Delhi NCR', quote:'Seven years same company. My gap was ₹8L. Used GrowPath to switch industries. Best decision of my career.' },
]

export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <Navbar />

      {/* ── HERO ── */}
      <section
        style={{
         
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '108px 24px 64px',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(900px, 200vw)',
            height: 600,
            background:
              'radial-gradient(ellipse at center,rgba(14,122,90,0.07) 0%,rgba(232,146,42,0.04) 45%,transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 980,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            className="fade d1"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--teal-l)',
              border: '1px solid var(--teal-mid)',
              color: 'var(--teal-d)',
              fontSize: 12,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 99,
              marginBottom: 32,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                background: 'var(--teal)',
                borderRadius: '50%',
                animation: 'pulse 2.2s ease-in-out infinite',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            AI-powered career intelligence platform
          </div>

          <h1
            className="fade d2"
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(36px,9vw,76px)',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-2px',
              color: 'var(--ink)',
              marginBottom: 28,
              maxWidth: '1000px',
              marginInline: 'auto',
              textAlign: 'center',
            }}
          >
            <span style={{ display: 'block', color: 'var(--muted-l)', fontWeight: 400 }}>
              Someone with your skills
            </span>
            <span style={{ display: 'block' }}>is already earning</span>
            <em style={{ display: 'block', fontStyle: 'italic', color: 'var(--teal)', whiteSpace: 'nowrap', fontSize: '1.08em' }}>
              2X more.
            </em>
          </h1>

          <p
            className="fade d3"
            style={{
              fontSize: 'clamp(16px,2vw,19px)',
              fontWeight: 300,
              color: 'var(--muted)',
              maxWidth: 'min(680px, 92vw)',
              margin: '0 auto 44px',
              lineHeight: 1.8,
            }}
          >
            EarnGro reveals your hidden{' '}
            <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>Earning Gap</strong>{' '}
            — then builds a personalized AI roadmap to increase your salary, strengthen your
            career profile, and maximize your{' '}
            <strong style={{ color: 'var(--teal)', fontWeight: 600 }}>market value.</strong>
          </p>

          <div className="fade d4"><JourneyCard /></div>

          <div
            className="fade d5"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, flexWrap:'wrap', marginBottom:52 }}
          >
            <a
              href="#calculator"
              style={{ background:'var(--teal)', color:'#fff', fontFamily:'var(--sans)', fontSize:15, fontWeight:600, padding:'14px 30px', borderRadius:99, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 4px 20px rgba(14,122,90,0.22)', transition:'all 0.22s' }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Calculate my Earning Gap — free
            </a>
            <a href="#how-it-works" style={{ fontSize:14, color:'var(--muted)', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
              See how it works →
            </a>
          </div>
        </div>
      </section>

      {/* ── PROOF STRIP ── */}
      <div className="proof" style={{ position:'relative', zIndex:1 }}>
        {[
          ['₹6.8L','average gap found'],
          ['14 months','average to close'],
          ['AI-powered','— not formulas'],
          ['2,400+','gaps analysed in beta'],
          ['India & SEA','market data'],
        ].map(([v,l],i) => (
          <div key={i} className="proof-item">
            <strong>{v}</strong>{l}
          </div>
        ))}
      </div>

      {/* ── TICKER ── */}
      <div
        style={{ background:'var(--teal-xl)', overflow:'hidden', borderTop:'1px solid var(--teal-mid)', borderBottom:'1px solid var(--teal-mid)', padding:'10px 0', position:'relative', zIndex:1 }}
      >
        <div style={{ display:'flex', animation:'ticker 30s linear infinite', width:'max-content' }}>
          {[...TICKER, ...TICKER].map((item,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'0 28px', fontSize:12, color:'var(--muted)', whiteSpace:'nowrap', borderRight:'1px solid var(--teal-mid)' }}>
              <span style={{ color:'var(--teal-d)', fontWeight:700, fontFamily:'var(--serif)', fontSize:14 }}>{item.amt}</span>
              <span style={{ color:'var(--teal)', fontWeight:700 }}>↑</span>
              {item.name} · {item.role} · {item.time}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:'96px 24px', maxWidth:1120, margin:'0 auto', position:'relative', zIndex:1 }}>
        <div className="reveal r1" style={{ textAlign:'center', maxWidth:600, margin:'0 auto 52px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:11, fontWeight:600, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>
            <span style={{ width:18, height:2, background:'var(--teal)', opacity:0.5, display:'inline-block', borderRadius:1 }} />
            How EarnGro works
          </div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(30px,4vw,50px)', fontWeight:600, lineHeight:1.1, color:'var(--ink)', marginBottom:14 }}>
            From gap discovered<br/>to gap <em style={{ fontStyle:'italic', color:'var(--teal)' }}>closed</em>
          </h2>
          <p style={{ fontSize:16, fontWeight:300, color:'var(--muted)', lineHeight:1.75 }}>
            Not a job board. Not a course platform. An AI system that treats your career like a financial portfolio — actively managed and grown every day.
          </p>
        </div>

        <div className="reveal r2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:2, background:'var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--sh-sm)' }}>
          {HOW.map(card => (
            <div key={card.n} style={{ background: card.hi ? 'var(--teal-xl)' : 'var(--paper)', padding:'32px 22px', borderTop: card.hi ? `2px solid var(--teal)` : 'none', transition:'background 0.18s' }}>
              <div style={{ fontFamily:'var(--serif)', fontSize:12, fontStyle:'italic', color:'var(--amber)', marginBottom:16 }}>{card.n}</div>
              <div style={{ width:48, height:48, background: card.hi ? 'var(--teal)' : 'var(--teal-l)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:14 }}>{card.ico}</div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)', marginBottom:8 }}>{card.t}</div>
              <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.65 }}>{card.d}</div>
            </div>
          ))}
        </div>

        <div className="reveal r3" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:24, flexWrap:'wrap' }}>
          {['Daily interview practice','Living CV builder','Salary negotiation coach','Freelance income launcher'].map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--teal-l)', border:'1px solid var(--teal-mid)', borderRadius:99, padding:'8px 16px', fontSize:12, fontWeight:600, color:'var(--teal-d)' }}>
                <span style={{ width:8, height:8, background:'var(--teal)', borderRadius:'50%', display:'inline-block' }} />{s}
              </div>
              <span style={{ color:'var(--teal-mid)', fontSize:18 }}>→</span>
            </div>
          ))}
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--teal)', borderRadius:99, padding:'8px 16px', fontSize:12, fontWeight:600, color:'#fff' }}>
            <span style={{ width:8, height:8, background:'#fff', borderRadius:'50%', display:'inline-block' }} />
            Gap closed ✓
          </div>
        </div>
      </section>

      {/* ── CALCULATOR PREVIEW ── static, non-interactive, routes to signup ── */}
      <div id="calculator" style={{ background:'var(--paper-2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', position:'relative', zIndex:1, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'min(800px, 200vw)', height:500, background:'radial-gradient(ellipse,rgba(14,122,90,0.06) 0%,rgba(232,146,42,0.03) 40%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:700, margin:'0 auto', padding:'88px 24px', position:'relative', zIndex:1 }}>
          <div className="reveal r1" style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:11, fontWeight:600, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>
              <span style={{ width:18, height:2, background:'var(--teal)', opacity:0.5, display:'inline-block', borderRadius:1 }} />
              Earning gap calculator
            </div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(30px,4vw,50px)', fontWeight:600, lineHeight:1.1, color:'var(--ink)', marginBottom:14 }}>
              What is your gap<br/><em style={{ fontStyle:'italic', color:'var(--teal)' }}>worth to you?</em>
            </h2>
            <p style={{ fontSize:16, fontWeight:300, color:'var(--muted)', lineHeight:1.75 }}>
              AI market intelligence, personalised to your profile. Free account · 2 minutes.
            </p>
          </div>
          <div className="reveal r2"><CalculatorPreview /></div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ background:'var(--paper-3)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1120, margin:'0 auto', padding:'96px 24px' }}>
          <div className="reveal r1">
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:11, fontWeight:600, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>
              <span style={{ width:18, height:2, background:'var(--teal)', opacity:0.5, display:'inline-block', borderRadius:1 }} />
              Early user stories
            </div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(30px,4vw,50px)', fontWeight:600, lineHeight:1.1, color:'var(--ink)' }}>
              Real gaps.<br/><em style={{ fontStyle:'italic', color:'var(--teal)' }}>Real growth.</em>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:16, marginTop:52 }}>
            {TESTS.map((t,i) => (
              <div key={i} className={`reveal r${i+1}`} style={{ background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:26, transition:'all 0.22s', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--amber),var(--teal))', opacity:0.6 }} />
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--teal-l)', border:'1px solid var(--teal-mid)', color:'var(--teal-d)', fontSize:12, fontWeight:600, padding:'5px 12px', borderRadius:99, marginBottom:16 }}>{t.badge}</div>
                <p style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', color:'var(--ink)', lineHeight:1.65, marginBottom:20, opacity:0.85 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, background:'linear-gradient(135deg,var(--teal-l),var(--teal-mid))', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--teal-d)', border:'1.5px solid var(--teal-mid)', flexShrink:0 }}>{t.av}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)' }}>{t.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WAITLIST → SIGNUP ── */}
      <section id="waitlist" style={{ padding:'100px 24px', textAlign:'center', position:'relative', zIndex:1, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'min(800px, 200vw)', height:500, background:'radial-gradient(ellipse,rgba(14,122,90,0.06) 0%,rgba(232,146,42,0.03) 40%,transparent 70%)', pointerEvents:'none' }} />
        <div className="reveal r1" style={{ maxWidth:540, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-block', background:'var(--teal-l)', border:'1px solid var(--teal-mid)', color:'var(--teal-d)', fontSize:10, fontWeight:700, padding:'5px 16px', borderRadius:99, marginBottom:22, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            Free forever · India & Southeast Asia
          </div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(30px,5vw,52px)', fontWeight:600, color:'var(--ink)', marginBottom:14, letterSpacing:'-0.5px', lineHeight:1.1 }}>
            Ready to close your <em style={{ fontStyle:'italic', color:'var(--teal)' }}>gap?</em>
          </h2>
          <p style={{ fontSize:15, color:'var(--muted)', fontWeight:300, marginBottom:36, lineHeight:1.7 }}>
            Create your free account and get your personalised GrowPath — a month-by-month AI roadmap to your target salary.
          </p>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <Link href="/signup" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--teal)', color:'#fff', fontSize:15, fontWeight:600, padding:'14px 32px', borderRadius:99, textDecoration:'none', boxShadow:'0 4px 20px rgba(14,122,90,0.22)' }}>
              Create free account →
            </Link>
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
              <p style={{ fontSize:12, color:'var(--muted-l)' }}>No credit card. Free forever.</p>
              <span style={{ color:'var(--border)', fontSize:12 }}>·</span>
              <Link href="/login" style={{ fontSize:12, color:'var(--teal)', textDecoration:'none', fontWeight:500 }}>Already have an account? Log in →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--ink)', padding:'24px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.4)' }}>
          <div style={{ width:26, height:26, background:'linear-gradient(135deg,var(--teal),#1AA574)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>EG</div>
          EarnGro
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>
          © 2026 EarnGro · India & Southeast Asia · Every working person deserves to earn their true worth.
        </div>
      </footer>
    </>
  )
}
