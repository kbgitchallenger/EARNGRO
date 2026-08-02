//app/(auth)/reset-password/ResetPasswordForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords don\'t match.')
      return
    }

    setLoading(true)

    // The recovery link Supabase emailed already established a temporary
    // authenticated session for this browser — updateUser works directly
    // off that, no separate token handling needed here.
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
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

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
          Set a new password
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
          Choose something you haven't used before.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
              New password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"
                required autoComplete="new-password" className="eg-input"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button" onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="eg-toggle-visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
              Confirm new password
            </label>
            <input
              id="confirmPassword" type={showPassword ? 'text' : 'password'} value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
              required autoComplete="new-password" className="eg-input"
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
                <span className="eg-spinner" /> Updating…
              </span>
            ) : 'Update password'}
          </button>
        </form>
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
        .eg-toggle-visibility {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 15px;
          padding: 4px; line-height: 1; border-radius: 4px;
        }
        .eg-toggle-visibility:focus-visible {
          outline: 2px solid var(--teal); outline-offset: 2px;
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