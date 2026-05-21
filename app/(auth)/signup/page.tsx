export const dynamic = 'force-dynamic'
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
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

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off)', padding: '24px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: 'var(--sh-lg)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: '700', color: 'var(--ink)', marginBottom: '10px' }}>Check your email</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.7' }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start discovering your Earning Gap.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off)', padding: '24px' }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: 'var(--sh-lg)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '34px', height: '34px', background: 'var(--indigo)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700' }}>EG</div>
          <span style={{ fontSize: '17px', fontWeight: '700', color: 'var(--ink)' }}>Earn<span style={{ color: 'var(--indigo)' }}>Gro</span></span>
        </div>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '26px', fontWeight: '700', color: 'var(--ink)', marginBottom: '6px' }}>
          Discover your gap
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '28px' }}>
          Free forever. No credit card. Takes 2 minutes.
        </p>

        {/* Google */}
        <button onClick={handleGoogle} style={{ width: '100%', padding: '12px', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: 'var(--ink)', cursor: 'pointer', marginBottom: '20px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}/>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>or email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}/>
        </div>

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ravi Kumar" required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'var(--sans)' }}/>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'var(--sans)' }}/>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'var(--sans)' }}/>
          </div>

          {error && (
            <div style={{ background: 'var(--red-l)', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--red)', marginBottom: '14px' }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'var(--sans)' }}>
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted)', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--indigo)', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--muted-l)', marginTop: '16px', lineHeight: '1.5' }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}