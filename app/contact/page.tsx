// app/contact/page.tsx
export const metadata = { title: 'Contact — EarnGro' }

import ContactForm from './ContactForm'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 100px' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--teal)', textDecoration: 'none', marginBottom: 32, fontWeight: 600 }}>
          ← Back to EarnGro
        </Link>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
          Contact us
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--muted)', marginBottom: 40, lineHeight: 1.6, maxWidth: 480 }}>
          Have a question, found a bug, or want to talk about your account? We read every message.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 40 }}>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>✉️</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email</div>
            <a href="mailto:info@earngro.app" style={{ fontSize: 14.5, color: 'var(--teal-d)', fontWeight: 600, textDecoration: 'none' }}>
              info@earngro.app
            </a>
          </div>

          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>📍</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Registered office</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6 }}>
              1108-10, Tower-1,Assotech Business Cresterra, Sector 135<br />Noida 201304, India
            </div>
          </div>

          <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>🌐</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Website</div>
            <a href="https://www.earngro.app" style={{ fontSize: 14.5, color: 'var(--teal-d)', fontWeight: 600, textDecoration: 'none' }}>
              www.earngro.app
            </a>
          </div>
        </div>

        <ContactForm />

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: 12.5, color: 'var(--muted)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}