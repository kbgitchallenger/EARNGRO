'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MOBILE_NAV = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/gap',
    label: 'Gap',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    href: '/cv',
    label: 'CV',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/interview',
    label: 'Interview',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'More',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64, background: '#fff',
      borderTop: '1px solid var(--border-l)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 4px',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(26,26,20,0.07)',
    }}>
      {MOBILE_NAV.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              padding: '8px 12px', borderRadius: 12,
              textDecoration: 'none', minWidth: 52,
              color: isActive ? 'var(--teal)' : 'var(--muted)',
              transition: 'color 0.15s',
            }}
          >
            <span style={{ display: 'flex', color: isActive ? 'var(--teal)' : 'var(--muted-l)' }}>
              {item.icon}
            </span>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.02em',
              color: isActive ? 'var(--teal)' : 'var(--muted)',
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}