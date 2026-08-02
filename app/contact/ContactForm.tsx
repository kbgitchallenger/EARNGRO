// app/contact/ContactForm.tsx
'use client'

import { useState } from 'react'

// Deliberately built as a real, working mailto: flow rather than a form
// that appears to submit to a backend — there's no confirmed email-
// sending infrastructure (Resend, SendGrid, etc.) wired up yet, and a
// form that silently does nothing on submit would be exactly the kind
// of fake functionality avoided everywhere else in this build. This
// genuinely works today, with zero backend required: it opens the
// user's own email client, pre-addressed and pre-filled.
export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = `${message}\n\n—\n${name}${email ? ` (${email})` : ''}`
    const mailtoUrl = `mailto:info@earngro.app?subject=${encodeURIComponent(subject || 'Message from EarnGro contact page')}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Send us a message</div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16 }}>
        This opens your own email app, pre-addressed to us — nothing is sent from this page directly.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }} className="contact-2col">
          <div>
            <label htmlFor="name" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Your name
            </label>
            <input id="name" value={name} onChange={e => setName(e.target.value)} required className="contact-input" placeholder="Jane Doe" />
          </div>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Your email (optional)
            </label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="contact-input" placeholder="you@example.com" />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="subject" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Subject
          </label>
          <input id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="contact-input" placeholder="What's this about?" />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="message" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Message
          </label>
          <textarea
            id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={6}
            className="contact-input" style={{ resize: 'vertical', fontFamily: 'var(--sans)' }}
            placeholder="Tell us what's going on…"
          />
        </div>

        <button type="submit" className="contact-submit-btn">
          Open in your email app →
        </button>
      </form>

      <style jsx>{`
        .contact-input {
          width: 100%; padding: 10px 13px; border: 1.5px solid var(--border);
          border-radius: var(--r-md); font-size: 14px; outline: none;
          font-family: var(--sans); background: #fff; color: var(--ink);
          transition: border-color 0.15s ease;
        }
        .contact-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(14,122,90,0.12); }
        .contact-submit-btn {
          background: var(--teal); color: #fff; border: none; border-radius: var(--r-md);
          padding: 12px 24px; font-size: 14.5px; font-weight: 600; cursor: pointer;
          font-family: var(--sans); box-shadow: 0 4px 16px rgba(14,122,90,0.2);
        }
        .contact-submit-btn:hover { box-shadow: 0 6px 20px rgba(14,122,90,0.3); }
        @media (max-width: 480px) {
          .contact-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}