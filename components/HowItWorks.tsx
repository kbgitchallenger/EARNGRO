'use client'

import { useEffect, useRef } from 'react'

const STEPS = [
  {
    n: '01', ico: '🧬', title: 'GrowDNA profile',
    desc: 'Deep assessment that validates your real skills, discovers hidden earning assets, and benchmarks you against verified peers in your city and industry.',
  },
  {
    n: '02', ico: '📊', title: 'Earning Gap revealed',
    desc: 'Your exact gap in rupees per year — calculated by AI against live market intelligence, not generic salary tables or guesswork.',
  },
  {
    n: '03', ico: '🗺️', title: 'GrowPath built',
    desc: 'A month-by-month financial plan for your career. Exact skill targets, salary milestones, timelines, and specific companies to target.',
  },
  {
    n: '04', ico: '🎯', title: 'Daily GrowReady',
    desc: 'AI interview practice, living CV builder, skill sprints, salary negotiation coach — every feature connects to closing your gap faster.',
  },
  {
    n: '05', ico: '💰', title: 'GrowMore income',
    desc: 'Beyond salary. Freelance launcher, promotion accelerator, side income tools — all tracked in one total earning growth dashboard.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.1 }
    )
    const els = sectionRef.current?.querySelectorAll('.reveal')
    els?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section" id="how-it-works" ref={sectionRef}>
      <div className="reveal r1">
        <div className="sec-tag">How EarnGro works</div>
        <h2>From gap discovered<br />to gap <em>closed</em></h2>
        <p className="sec-body">
          Not a job board. Not a course platform. A personalised AI system that treats your career
          like a financial portfolio — actively managed, optimised, and grown every day.
        </p>
      </div>

      <div className="hiw-grid reveal r2">
        {STEPS.map(step => (
          <div className="hiw-card" key={step.n}>
            <div className="hiw-n">{step.n}</div>
            <span className="hiw-ico">{step.ico}</span>
            <div className="hiw-t">{step.title}</div>
            <div className="hiw-d">{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}