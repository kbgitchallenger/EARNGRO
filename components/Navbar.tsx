'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px',
      height: 60,
      background: scrolled ? 'rgba(253,252,248,0.97)' : 'rgba(253,252,248,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
      boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
      transition: 'all 0.2s ease',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, var(--teal), #1AA574)',
          borderRadius: 'var(--r-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          boxShadow: '0 2px 8px rgba(14,122,90,0.25)',
        }}>EG</div>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
          Earn<em style={{ fontStyle: 'normal', color: 'var(--teal)' }}>Gro</em>
        </span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-hide-mobile">
        <Link href="/#how-it-works" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 400 }}>How it works</Link>
        <Link href="/#calculator" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 400 }}>Free calculator</Link>
        <Link href="/login" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
      </div>

      {/* CTA */}
      <Link href="/signup" style={{
        background: 'var(--teal)', color: '#fff',
        fontSize: 13, fontWeight: 600, padding: '9px 20px',
        borderRadius: 99, textDecoration: 'none',
        boxShadow: '0 2px 8px rgba(14,122,90,0.2)',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        Get started free
      </Link>
    </nav>
  )
}