'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on outside click
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('nav')) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  const NAV_LINKS = [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Pricing',      href: '/pricing'        },
  ]

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled || open ? 'rgba(253,252,248,0.97)' : 'rgba(253,252,248,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled || open ? 'var(--border)' : 'var(--border-l)'}`,
        boxShadow: scrolled ? '0 2px 12px rgba(26,26,20,0.07)' : '0 1px 0 rgba(26,26,20,0.04)',
        transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '0 24px', height: 60,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
        }}>

          {/* Logo */}
          <Link href="/" title="EarnGro" style={{
            display: 'flex', alignItems: 'center',
            gap: 10, textDecoration: 'none', flexShrink: 0,
          }}>
            <Image
              src="/earngro.png" alt="EarnGro"
              width={38} height={38} priority
              style={{ objectFit: 'contain', display: 'block' }}
            />
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px', lineHeight: 1 }}>
              Earn<em style={{ fontStyle: 'normal', color: 'var(--teal)' }}>Gro</em>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop">
            {NAV_LINKS.map(item => (
              <Link key={item.href} href={item.href} style={{
                fontSize: 13, fontWeight: 500, color: 'var(--muted)',
                textDecoration: 'none', padding: '7px 14px', borderRadius: 99,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--ink)'; (e.target as HTMLElement).style.background = 'var(--paper-3)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--muted)'; (e.target as HTMLElement).style.background = 'transparent' }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="nav-desktop">
            <Link href="/login" style={{
              fontSize: 13, fontWeight: 600, color: 'var(--muted)',
              textDecoration: 'none', padding: '8px 16px', borderRadius: 99,
            }}>
              Log in
            </Link>
            <Link href="/signup" style={{
              fontSize: 13, fontWeight: 700, color: '#fff',
              background: 'var(--teal)', textDecoration: 'none',
              padding: '9px 20px', borderRadius: 99,
              boxShadow: '0 2px 8px rgba(14,122,90,0.25)',
              display: 'inline-block',
            }}>
              Get started free
            </Link>
          </div>

          {/* Mobile right — CTA + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="nav-mobile">
            <Link href="/signup" style={{
              fontSize: 12, fontWeight: 700, color: '#fff',
              background: 'var(--teal)', textDecoration: 'none',
              padding: '8px 14px', borderRadius: 99, whiteSpace: 'nowrap',
            }}>
              Get started
            </Link>
            <button
              onClick={() => setOpen(o => !o)}
              style={{
                background: 'transparent', border: '1.5px solid var(--border)',
                borderRadius: 8, padding: '7px 9px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block', width: 18, height: 2,
                  background: 'var(--ink)', borderRadius: 99,
                  transition: 'transform 0.25s, opacity 0.25s',
                  transform: open
                    ? i === 0 ? 'translateY(6px) rotate(45deg)'
                    : i === 2 ? 'translateY(-6px) rotate(-45deg)'
                    : 'scaleX(0)'
                    : 'none',
                  opacity: open && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: 'fixed', inset: '60px 0 0 0', zIndex: 99,
          background: 'rgba(253,252,248,0.98)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-l)',
          display: 'flex', flexDirection: 'column',
          padding: '24px 24px 40px',
          animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {[...NAV_LINKS, { label: 'Log in', href: '/login' }].map(item => (
            <Link key={item.href} href={item.href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: 18, fontWeight: 600, color: 'var(--ink)',
                textDecoration: 'none', padding: '16px 0',
                borderBottom: '1px solid var(--border-l)',
                display: 'block',
              }}
            >
              {item.label}
            </Link>
          ))}

          <Link href="/signup" onClick={() => setOpen(false)} style={{
            marginTop: 24, display: 'block', textAlign: 'center',
            background: 'var(--teal)', color: '#fff',
            fontSize: 16, fontWeight: 700, padding: '15px',
            borderRadius: 99, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(14,122,90,0.25)',
          }}>
            Get started free →
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 680px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
        }
        @media (min-width: 681px) {
          .nav-mobile  { display: none !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}