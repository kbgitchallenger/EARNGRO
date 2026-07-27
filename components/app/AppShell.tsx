'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Single source of truth for navigation ──────────────────────────
// Previously Sidebar.tsx and MobileNav.tsx each maintained their OWN copy
// of nav items and lock logic — exactly the kind of duplication that
// caused real bugs earlier (the AI-Interview lock existing correctly in
// one file but behaving differently in the other). One array now drives
// desktop, iPad, and mobile.
const NAV = [
  {
    href: '/dashboard', label: 'Dashboard', mobileLabel: 'Home',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    href: '/growdna', label: 'GrowDNA', mobileLabel: 'DNA',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  },
  {
    href: '/gap', label: 'Earning Gap', mobileLabel: 'Gap',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    href: '/cv', label: 'CV Builder', mobileLabel: 'CV',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  },
  {
    href: '/growpath', label: 'GrowPath', mobileLabel: 'Path',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
    locked: false, showOnMobile: false, // preserves existing behavior: GrowPath was already omitted from the mobile bar
  },
  {
    href: '/interview', label: 'AI Interview', mobileLabel: 'Interview',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
    locked: true,
  },
  {
    href: '/pricing', label: 'Pricing', mobileLabel: 'Pricing',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
    showOnMobile: false, // matches existing MobileNav, which never included Pricing
  },
]

const SETTINGS_ICON = (
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
)

const PLAN_CREDIT_POOL: Record<string, number> = { free: 300, grow: 1500, accelerate: 5000 }

interface AppShellProps {
  name: string
  email: string
  plan: string
  creditsBalance: number
  currentStreak: number
  children: React.ReactNode
}

function Icon({ children, size = 18 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {children}
    </svg>
  )
}

export default function AppShell({ name, email, plan, creditsBalance, currentStreak, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isPaid = plan !== 'free'
  const isAccelerate = plan === 'accelerate'
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  const pool = PLAN_CREDIT_POOL[plan] ?? 300
  const pct = pool > 0 ? creditsBalance / pool : 0
  const creditColor = pct <= 0.05 ? 'var(--red)' : pct <= 0.2 ? 'var(--amber)' : 'var(--teal-d)'
  const creditBg = pct <= 0.05 ? 'var(--red-l)' : pct <= 0.2 ? 'var(--amber-l)' : 'var(--teal-l)'
  const creditBorder = pct <= 0.05 ? '#F5CCCC' : pct <= 0.2 ? 'var(--amber-mid)' : 'var(--teal-mid)'
  const isLow = pct <= 0.2

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isLocked = (item: typeof NAV[number]) => item.locked && !isAccelerate

  return (
    <div className="eg-shell">

      {/* ── Rail — desktop (full labels) and iPad (icon-only) share this
          one markup block; the width/label visibility difference is
          handled purely by CSS media queries below, not two components. */}
      <aside className="eg-rail">
        <div className="eg-rail-logo">
          <Image src="/logo.png" alt="EarnGro" width={30} height={30} priority />
          <span className="eg-rail-logo-text">Earn<em>Gro</em></span>
        </div>

        <div className="eg-rail-plan">
          <span className={`eg-plan-badge eg-plan-${plan}`}>
            {plan === 'free' ? 'Free plan' : plan === 'grow' ? '⚡ Grow' : '🚀 Accelerate'}
          </span>
          {!isPaid && <Link href="/settings" className="eg-upgrade-link">Upgrade →</Link>}
        </div>

        {/* Streak — visible in the rail specifically, since "don't break
            your streak" is exactly the kind of thing that benefits from
            being persistently visible, not something you have to open a
            page to check. */}
        {currentStreak > 0 && (
          <div className="eg-streak-pill" title={`${currentStreak}-day streak — take a real action today to keep it`}>
            🔥 <span>{currentStreak}-day streak</span>
          </div>
        )}

        <nav className="eg-nav">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const locked = isLocked(item)
            return (
              <Link key={item.href} href={item.href} className={`eg-nav-link${active ? ' active' : ''}${locked ? ' locked' : ''}`}>
                <span className="eg-nav-icon"><Icon>{item.icon}</Icon></span>
                <span className="eg-nav-label">{item.label}</span>
                {locked && (
                  <span className="eg-nav-lock">
                    <Icon size={11}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></Icon>
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="eg-rail-bottom">
          <Link href="/settings" className={`eg-nav-link${pathname === '/settings' ? ' active' : ''}`}>
            <span className="eg-nav-icon"><Icon>{SETTINGS_ICON}</Icon></span>
            <span className="eg-nav-label">Settings</span>
          </Link>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="eg-main">
        <header className="eg-topbar">
          <Link href="/dashboard" className="eg-topbar-logo">
            <Image src="/earngro.png" alt="EarnGro" width={140} height={36} priority style={{ width: 'auto', height: 28 }} />
          </Link>

          <div className="eg-topbar-right">
            <Link
              href="/settings/billing"
              className="eg-credit-pill"
              style={{ background: creditBg, borderColor: creditBorder }}
              title={`${creditsBalance} of ${pool} credits remaining this cycle`}
            >
              <span style={{ color: creditColor, fontWeight: 700 }}>{creditsBalance.toLocaleString('en-IN')}</span>
              <span className="eg-credit-label">credits</span>
              {isLow && <span style={{ color: creditColor, fontWeight: 600 }}>{plan === 'free' ? '· Upgrade →' : '· Add →'}</span>}
            </Link>

            <div className="eg-avatar-block">
              <div className="eg-avatar">{initials}</div>
              <div className="eg-name-block">
                <div className="eg-name">{name}</div>
                <div className="eg-email">{email}</div>
              </div>
            </div>

            <button onClick={signOut} title="Sign out" className="eg-signout">
              <Icon size={14}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></Icon>
            </button>
          </div>
        </header>

        <main className="eg-content">{children}</main>
      </div>

      {/* ── Bottom tab bar — mobile only, CSS-hidden elsewhere. Same NAV
          array, filtered to showOnMobile !== false, matching the existing
          reduced 6-item mobile set exactly rather than cramming all 8. */}
      <nav className="eg-bottom-bar">
        {NAV.filter(i => i.showOnMobile !== false).map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const locked = isLocked(item)
          return (
            <Link key={item.href} href={item.href} className={`eg-bottom-item${active ? ' active' : ''}${locked ? ' locked' : ''}`}>
              <Icon size={20}>{item.icon}</Icon>
              <span>{item.mobileLabel}</span>
              {locked && <span className="eg-bottom-lock" aria-hidden>🔒</span>}
            </Link>
          )
        })}
        <Link href="/settings" className={`eg-bottom-item${pathname === '/settings' ? ' active' : ''}`}>
          <Icon size={20}>{SETTINGS_ICON}</Icon>
          <span>Settings</span>
        </Link>
      </nav>

      <style>{`
        .eg-shell { display: flex; min-height: 100vh; }
        .eg-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .eg-content { flex: 1; padding: 20px; }

        /* Rail — desktop default: full 220px with labels */
        .eg-rail {
          width: 220px; flex-shrink: 0; background: #0f1613; color: #fff;
          display: flex; flex-direction: column; padding: 20px 14px;
        }
        .eg-rail-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; padding: 0 6px; }
        .eg-rail-logo-text { font-size: 15px; font-weight: 700; }
        .eg-rail-logo-text em { font-style: normal; color: var(--teal); }
        .eg-rail-plan { padding: 0 6px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .eg-plan-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75); }
        .eg-plan-grow { color: #7fd9bd; }
        .eg-plan-accelerate { color: #ffd27f; }
        .eg-upgrade-link { font-size: 11px; color: var(--teal); text-decoration: none; font-weight: 600; }
        .eg-streak-pill { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; background: rgba(14,122,90,0.2); border: 1px solid rgba(14,122,90,0.4); color: #7fd9bd; padding: 6px 10px; border-radius: 8px; margin: 0 6px 14px; }
        .eg-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .eg-nav-link { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; position: relative; }
        .eg-nav-link.active { background: rgba(14,122,90,0.25); color: #7fd9bd; font-weight: 600; }
        .eg-nav-link.locked { color: rgba(255,255,255,0.3); }
        .eg-nav-lock { margin-left: auto; }
        .eg-rail-bottom { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); }

        /* Topbar */
        .eg-topbar { height: 56px; background: #fff; border-bottom: 1px solid var(--border-l); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 40; box-shadow: 0 1px 0 rgba(26,26,20,0.04); }
        .eg-topbar-logo { display: none; } /* shown on mobile only, see below */
        .eg-topbar-right { display: flex; align-items: center; gap: 10px; }
        .eg-credit-pill { display: flex; align-items: center; gap: 6px; border: 1px solid; border-radius: 99px; padding: 5px 12px; text-decoration: none; font-size: 12px; flex-shrink: 0; }
        .eg-credit-label { color: var(--muted); }
        .eg-avatar-block { display: flex; align-items: center; gap: 8px; }
        .eg-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--teal-l), var(--teal-mid)); border: 1.5px solid var(--teal-mid); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--teal-d); flex-shrink: 0; }
        .eg-name { font-size: 13px; font-weight: 600; color: var(--ink); }
        .eg-email { font-size: 10px; color: var(--muted); }
        .eg-signout { background: transparent; border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; cursor: pointer; color: var(--muted); display: flex; align-items: center; }
        .eg-signout:hover { color: var(--red); border-color: var(--red-mid, #f5cccc); }

        /* Bottom bar — hidden by default (desktop/iPad) */
        .eg-bottom-bar { display: none; }

        /* ── iPad range: 768–1023px — icon-only rail, no hover dependency,
            same nav items as desktop just without labels, since iPad has
            no real hover state for a "hover to reveal label" pattern. ── */
        @media (max-width: 1023px) and (min-width: 768px) {
          .eg-rail { width: 72px; align-items: center; }
          .eg-rail-logo-text, .eg-nav-label, .eg-rail-plan, .eg-streak-pill { display: none; }
          .eg-nav-link { justify-content: center; padding: 10px; }
          .eg-nav-lock { position: absolute; top: 4px; right: 4px; margin-left: 0; }
        }

        /* ── Mobile: under 768px — rail replaced by bottom tab bar,
            slim logo + credit/avatar stay in the topbar. ── */
        @media (max-width: 767px) {
          .eg-rail { display: none; }
          .eg-topbar-logo { display: flex; align-items: center; }
          .eg-name-block, .eg-credit-label { display: none; }
          .eg-content { padding-bottom: 76px; } /* clears the fixed bottom bar */
          .eg-bottom-bar {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
            background: #fff; border-top: 1px solid var(--border-l); padding: 6px 4px;
          }
          .eg-bottom-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 2px; color: var(--muted); text-decoration: none; font-size: 10px; position: relative; }
          .eg-bottom-item.active { color: var(--teal-d); font-weight: 600; }
          .eg-bottom-item.locked { color: var(--muted-l, #b0afa5); }
          .eg-bottom-lock { position: absolute; top: 0; right: 26%; font-size: 9px; }
        }
      `}</style>
    </div>
  )
}