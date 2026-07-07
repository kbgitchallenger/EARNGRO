'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TopbarProps {
  name: string
  email: string
  plan: string
}

export default function Topbar({ name, email, plan }: TopbarProps) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header style={{
      height: 56,
      background: '#fff',
      borderBottom: '1px solid var(--border-l)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxShadow: '0 1px 0 rgba(26,26,20,0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>

      {/* Mobile logo — hidden on desktop where sidebar shows it */}
      <Link
        href="/dashboard"
        className="topbar-logo-mobile"
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          textDecoration: 'none',
        }}
      >
        <div style={{
          width: 28, height: 28,
          background: 'var(--teal)',
          borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.5px',
          boxShadow: '0 2px 6px rgba(14,122,90,0.28)',
          flexShrink: 0,
        }}>EG</div>
        <span style={{
          fontSize: 16, fontWeight: 700,
          color: 'var(--ink)', letterSpacing: '-0.3px',
        }}>
          Earn<em style={{ fontStyle: 'normal', color: 'var(--teal)' }}>Gro</em>
        </span>
      </Link>

      {/* Right — user info + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Plan badge */}
        {plan === 'free' && (
          <Link href="/pricing" style={{
            fontSize: 11, fontWeight: 700,
            background: 'var(--ink)', color: '#fff',
            padding: '4px 10px', borderRadius: 99,
            textDecoration: 'none', letterSpacing: '0.03em',
            display: 'none', /* shown via CSS on desktop */
          }} className="topbar-upgrade-badge">
            Upgrade ⚡
          </Link>
        )}

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--teal-l), var(--teal-mid))',
            border: '1.5px solid var(--teal-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--teal-d)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div className="topbar-name-block" style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{email}</div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          title="Sign out"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 8px',
            cursor: 'pointer', color: 'var(--muted)',
            display: 'flex', alignItems: 'center',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--red-mid)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}