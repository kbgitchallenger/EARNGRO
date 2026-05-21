'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 48px',
      background: 'rgba(253,252,248,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 var(--border-l)',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, var(--teal), #1AA574)',
          borderRadius: 'var(--r-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(14,122,90,0.25)',
        }}>EG</div>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
          Earn<em style={{ fontStyle: 'normal', color: 'var(--teal)' }}>Gro</em>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/#how-it-works" className="nav-hide-mobile" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 400 }}>
          How it works
        </Link>
        <Link href="/#calculator" className="nav-hide-mobile" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 400 }}>
          Calculator
        </Link>
        <Link href="/signup" style={{
          background: 'var(--teal)', color: '#fff',
          fontSize: 13, fontWeight: 600, padding: '9px 20px',
          borderRadius: 99, textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(14,122,90,0.2)',
        }}>
          Get started
        </Link>
      </div>
    </nav>
  )
}