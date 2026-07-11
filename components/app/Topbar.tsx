'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface TopbarProps {
  name: string
  email: string
  plan: string
  creditsBalance?: number
}

const PLAN_CREDIT_POOL: Record<string, number> = {
  free: 300,
  grow: 1500,
  accelerate: 5000,
}

export default function Topbar({ name, email, plan, creditsBalance = 0 }: TopbarProps) {
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

  const pool = PLAN_CREDIT_POOL[plan] ?? 300
  const pct = pool > 0 ? creditsBalance / pool : 0
  const creditColor = pct <= 0.05 ? 'var(--red)' : pct <= 0.2 ? 'var(--amber)' : 'var(--teal-d)'
  const creditBg = pct <= 0.05 ? 'var(--red-l)' : pct <= 0.2 ? 'var(--amber-l)' : 'var(--teal-l)'
  const creditBorder = pct <= 0.05 ? '#F5CCCC' : pct <= 0.2 ? 'var(--amber-mid)' : 'var(--teal-mid)'
  const isLow = pct <= 0.2

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
        <Image
  src="/earngro.png"
  alt="EarnGro"
  width={140}
  height={36}
  priority
  style={{
    width: 'auto',
    height: 30,
    display: 'block',
    flexShrink: 0,
  }}
/>
      </Link>

      {/* Right — credit balance + plan badge + user info + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Credit balance — always visible here, on every screen size,
            so a low/zero balance is discoverable before an action fails,
            not just something the user finds out about mid-flow. */}
        <Link
          href="/settings/billing"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: creditBg, border: `1px solid ${creditBorder}`,
            borderRadius: 99, padding: '5px 12px', textDecoration: 'none',
            flexShrink: 0,
          }}
          title={`${creditsBalance} of ${pool} credits remaining this cycle`}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: creditColor }}>
            {creditsBalance.toLocaleString('en-IN')}
          </span>
          <span className="topbar-credits-label" style={{ fontSize: 11, color: 'var(--muted)' }}>credits</span>
          {isLow && (
            <span style={{ fontSize: 10.5, fontWeight: 600, color: creditColor, whiteSpace: 'nowrap' }}>
              {plan === 'free' ? '· Upgrade →' : '· Add →'}
            </span>
          )}
        </Link>

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