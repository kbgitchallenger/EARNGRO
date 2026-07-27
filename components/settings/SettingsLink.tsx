'use client'

import { useState } from 'react'
import Link from 'next/link'

// Extracted into its own client component — needed real onMouseEnter/
// onMouseLeave state to drive the hover effect, which can't live in the
// same file as SettingsPage (an async server component using
// createClient()/redirect(), incompatible with 'use client').
interface SettingsLinkProps {
  href: string
  icon: string
  title: string
  desc: string
}

export default function SettingsLink({ href, icon, title, desc }: SettingsLinkProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'var(--paper)',
        border: `1px solid ${hovered ? 'var(--teal-mid)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)', padding: '16px 18px',
        textDecoration: 'none',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      }}
    >
      <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
      <span style={{ color: hovered ? 'var(--teal)' : 'var(--muted)', fontSize: 16 }}>→</span>
    </Link>
  )
}