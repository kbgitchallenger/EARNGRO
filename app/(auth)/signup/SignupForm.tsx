'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Image from "next/image";   

function getStrength(pw: string) {
  if (!pw) return { label: '', score: 0 }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Weak', score: 1 }
  if (score <= 3) return { label: 'Fair', score: 2 }
  return { label: 'Strong', score: 3 }
}

export default function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const strength = useMemo(() => getStrength(password), [password])
  const strengthColor = ['var(--border)', 'var(--red)', '#E0A400', 'var(--teal)'][strength.score]

async function handleSignup(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')

  if (password.length < 8) {
    setError('Password must be at least 8 characters.')
    setLoading(false)
    return
  }

  const check = await fetch('/api/auth/check-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
})

const { exists } = await check.json()

if (exists) {
  setError('This email is already registered. Please sign in.')
  setLoading(false)
  return
}

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

  setSuccess(true)
  setLoading(false)
}

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--muted)', textTransform: 'uppercase',
    letterSpacing: '0.07em', marginBottom: 7
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: 24 }}>
        <div className="eg-card eg-fade-in" style={{ padding: 40, width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
            Check your email
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
            We sent a confirmation link to <strong style={{ color: 'var(--ink)' }}>{email}</strong>.<br />
            Click it to activate your account and start discovering your Earning Gap.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="eg-link-btn"
            style={{ marginTop: 20 }}
          >
            Wrong email? Go back
          </button>
        </div>
        <style jsx>{`
          .eg-card {
            background: var(--paper);
            border: 1px solid var(--border);
            border-radius: var(--r-xl);
            box-shadow: var(--sh-lg);
          }
          .eg-fade-in { animation: fadeInUp 0.4s ease both; }
          .eg-link-btn {
            background: none; border: none; color: var(--teal);
            font-size: 13px; font-weight: 600; cursor: pointer;
            font-family: var(--sans); text-decoration: underline;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: 24 }}>
      <div className="eg-card eg-fade-in" style={{ padding: 40, width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
         <Link
  href="/"
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  }}
>
  <Image
    src="/earngro.png"
    alt="EarnGro"
    width={42}
    height={42}
    priority
    style={{
      objectFit: 'contain',
      display: 'block',
    }}
  />

  <span
    style={{
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--ink)',
      letterSpacing: '-0.3px',
      lineHeight: 1,
    }}
  >
    Earn<em style={{ fontStyle: 'normal', color: 'var(--teal)' }}>Gro</em>
  </span>
</Link>
        </div>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
          Discover your gap
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
          Free forever. No credit card. Takes 2 minutes.
        </p>

        {/* Google */}
        <button onClick={handleGoogle} className="eg-btn-google" style={{ marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>or email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSignup} noValidate>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle} htmlFor="fullName">Full name</label>
            <input
              id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Ravi Kumar" required autoComplete="name" className="eg-input"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle} htmlFor="email">Email address</label>
            <input
              id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" required autoComplete="email" className="eg-input"
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle} htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                required autoComplete="new-password" minLength={8} className="eg-input"
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

          {password && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    height: 3, flex: 1, borderRadius: 2,
                    background: i <= strength.score ? strengthColor : 'var(--border)',
                    transition: 'background 0.2s ease'
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strength.label}</span>
            </div>
          )}
          {!password && <div style={{ marginBottom: 20 }} />}

          {error && (
            <div className="eg-error">
              <span aria-hidden>⚠</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="eg-btn-primary">
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="eg-spinner" /> Creating account…
              </span>
            ) : 'Create free account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-l)', marginTop: 16, lineHeight: 1.5 }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
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
        .eg-toggle-visibility {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 15px;
          padding: 4px; line-height: 1; border-radius: 4px;
        }
        .eg-toggle-visibility:focus-visible {
          outline: 2px solid var(--teal); outline-offset: 2px;
        }
        .eg-btn-google {
          width: 100%; padding: 12px; background: var(--paper);
          border: 1.5px solid var(--border); border-radius: var(--r-md);
          display: flex; align-items: center; justify-content: center;
          gap: 10px; font-size: 14px; font-weight: 500; color: var(--ink);
          cursor: pointer; font-family: var(--sans);
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .eg-btn-google:hover { border-color: var(--muted); background: rgba(0,0,0,0.015); }
        .eg-btn-google:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
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
          animation: shake 0.3s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
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