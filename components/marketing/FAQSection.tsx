'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'What is EarnGro?',
    a: 'EarnGro is an AI-powered career growth platform designed to help professionals maximize their earning potential. It combines salary intelligence, career planning, resume optimization, interview preparation, and personalized learning recommendations into one platform, giving you a clear roadmap to grow faster in your career.'
  },
  {
    q: 'Is EarnGro free to use?',
    a: 'Yes. Every new account receives free AI credits to explore key features like GrowDNA, resume analysis, AI resume optimization, and interview practice. You can upgrade anytime if you need additional credits or access to premium features.'
  },
  {
    q: 'What is GrowDNA?',
    a: 'GrowDNA is EarnGro’s proprietary AI career assessment that analyzes your professional profile, strengths, experience, skills, achievements, industry trends, and market demand. It identifies your earning potential, highlights growth opportunities, and creates a personalized roadmap to help you achieve your next career milestone.'
  },
  {
    q: 'What is the Earning Gap?',
    a: 'Your Earning Gap is the estimated difference between your current compensation and what professionals with similar experience, skills, location, and performance are earning in the market. It helps you understand your untapped earning potential and provides actionable recommendations to bridge that gap.'
  },
  {
    q: 'How is my Earning Gap calculated?',
    a: 'Our AI analyzes your role, industry, experience, location, technical skills, leadership capabilities, certifications, career progression, and market demand using multiple data sources. Rather than relying on static salary tables, EarnGro generates a personalized estimate based on your unique profile.'
  },
  {
    q: 'How accurate are the salary estimates?',
    a: 'Salary estimates are generated using AI models trained on market compensation trends, job data, industry benchmarks, and your individual profile. While no estimate can guarantee a future salary, EarnGro provides realistic market-based guidance that is continuously refined as market conditions change.'
  },
  {
    q: 'What is the Career Roadmap?',
    a: 'Your Career Roadmap is a personalized action plan generated after your GrowDNA assessment. It outlines the skills to learn, certifications to pursue, projects to complete, interview preparation, networking activities, and career milestones required to reach your target salary.'
  },
  {
    q: 'Can EarnGro improve my resume?',
    a: 'Yes. EarnGro analyzes your resume for ATS compatibility, impact, readability, keyword optimization, measurable achievements, formatting, and recruiter expectations. It provides AI-powered suggestions and can rewrite bullet points to significantly improve your resume.'
  },
  {
    q: 'What is ATS Resume Analysis?',
    a: 'ATS Resume Analysis checks how well your resume performs against Applicant Tracking Systems used by recruiters. It evaluates formatting, keywords, structure, readability, missing sections, and job relevance, helping increase your chances of getting shortlisted.'
  },
  {
    q: 'Does EarnGro build resumes from scratch?',
    a: 'Yes. You can create a professional ATS-friendly resume using AI. Simply provide your experience and career details, and EarnGro generates a recruiter-friendly resume that can be customized and downloaded.'
  },
  {
    q: 'How does AI Interview Practice work?',
    a: 'EarnGro conducts realistic AI-powered mock interviews tailored to your target role, experience level, and industry. After each interview, you receive detailed feedback on technical knowledge, communication, confidence, problem-solving, and areas for improvement.'
  },
  {
    q: 'Which interview types are supported?',
    a: 'EarnGro supports HR interviews, technical interviews, behavioral interviews, managerial interviews, leadership interviews, and role-specific interview simulations across multiple industries.'
  },
  {
    q: 'Can EarnGro recommend skills to learn?',
    a: 'Yes. Based on your career goals and market demand, EarnGro identifies high-impact technical and soft skills that can significantly improve your employability and earning potential.'
  },
  
  {
    q: 'Who should use EarnGro?',
    a: 'EarnGro is designed for working professionals, managers, senior leaders, career switchers, freelancers, and anyone looking to accelerate career growth and increase their income.'
  },
  {
    q: 'What are AI Credits?',
    a: 'Credits measure AI usage across the platform. Features like GrowDNA assessments, resume analysis, interview sessions, resume optimization, and AI career coaching consume credits. Every action clearly displays its credit cost before you begin.'
  },
  {
    q: 'Do unused credits roll over?',
    a: 'Monthly subscription credits refresh every billing cycle. Depending on your subscription plan, unused credits may expire at the end of the cycle. Lifetime or purchased credit packs remain available according to their validity period.'
  },
  {
    q: 'Can I buy additional credits?',
    a: 'Yes. If you run out of credits, you can purchase additional credit packs without changing your subscription plan, allowing you to continue using AI features immediately.'
  },
  {
    q: 'Is my personal data secure?',
    a: 'Yes. Protecting your privacy is a top priority. Your resume, salary information, interview recordings, and career data are encrypted and used only to provide your personalized insights. We never sell your personal information to advertisers or third parties.'
  },
  {
    q: 'Will recruiters see my profile?',
    a: 'No. Your profile remains private unless you explicitly choose to share your resume or career profile with recruiters or potential employers.'
  },
    {
    q: 'Does EarnGro guarantee a salary increase or job offer?',
    a: 'No. EarnGro provides AI-powered guidance, recommendations, and career insights to maximize your chances of career growth. Final hiring decisions and salary outcomes depend on employers, your performance, and market conditions.'
  },
  
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section style={{ padding: '72px 24px', maxWidth: 760, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,3.5vw,36px)', fontWeight: 600, color: 'var(--ink)', textAlign: 'center', marginBottom: 36 }}>
        Frequently asked questions
      </h2>
      <div>
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 4px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: isOpen ? 'var(--teal-d)' : 'var(--ink)' }}>{item.q}</span>
                <span style={{ fontSize: 18, color: 'var(--muted)', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>+</span>
              </button>
              {isOpen && (
                <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, padding: '0 4px 18px', margin: 0 }}>{item.a}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}