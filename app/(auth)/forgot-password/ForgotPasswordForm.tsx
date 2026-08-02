//app/(auth)/forgot-password/ForgotPasswordForm.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      // Deliberately generic — never confirm/deny whether an email
      // exists in the system, same account-enumeration discipline any
      // auth flow should follow.
      setError('Something went wrong. Please try again in a moment.')
      return
    }

    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: 24 }}>
      <div className="eg-card eg-fade-in" style={{ padding: 40, width: '100%', maxWidth: 420 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/earngro.png" alt="EarnGro" width={42} height={42} priority style={{ objectFit: 'contain', display: 'block' }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px', lineHeight: 1 }}>
              Earn<em style={{ fontStyle: 'normal', color: 'var(--teal)' }}>Gro</em>
            </span>
          </Link>
        </div>

        {sent ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
              Check your email
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. It'll expire in 1 hour.
            </p>
            <Link href="/login" className="eg-btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              Forgot your password?
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Enter the email on your account and we'll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                  Email address
                </label>
                <input
                  id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required autoComplete="email" className="eg-input"
                />
              </div>

              {error && (
                <div className="eg-error">
                  <span aria-hidden>⚠</span> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="eg-btn-primary">
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span className="eg-spinner" /> Sending…
                  </span>
                ) : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
          <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to sign in
          </Link>
        </p>
      </div>

      <style jsx>{`
        .eg-card {
          background: var(--paper);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          box-shadow: var(--sh-lg);
        }
        .eg-fade-in { animation: fadeInUp 0.4s ease both; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .eg-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--border);
          border-radius: var(--r-md);
          font-size: 14px;
          outline: none;
          font-family: var(--sans);
          background: var(--paper);
          color: var(--ink);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .eg-input:hover { border-color: var(--muted); }
        .eg-input:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(14,122,90,0.12);
        }
        .eg-btn-primary {
          width: 100%; padding: 13px; background: var(--teal); color: #fff;
          border: none; border-radius: var(--r-md); font-size: 15px; font-weight: 600;
          font-family: var(--sans); box-shadow: 0 4px 16px rgba(14,122,90,0.2);
          cursor: pointer; transition: transform 0.1s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .eg-btn-primary:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(14,122,90,0.3);
          transform: translateY(-1px);
        }
        .eg-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .eg-btn-primary:disabled { cursor: not-allowed; opacity: 0.7; }
        .eg-btn-primary:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
        .eg-error {
          background: var(--red-l); border: 1px solid #F5CCCC; border-radius: var(--r-md);
          padding: 10px 14px; font-size: 13px; color: var(--red); margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .eg-spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}