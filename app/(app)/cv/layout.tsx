import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const CV_TABS = [
  { href: '/cv/upload',   label: 'Upload',   icon: '📤' },
  { href: '/cv/builder',  label: 'Builder',  icon: '🛠️' },
  { href: '/cv/history',  label: 'History',  icon: '📋' },
]

export default async function CVLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 0 80px' }}>
      {/* CV Module Header */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ marginBottom: 4 }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 600,
            color: 'var(--ink)',
          }}>
            Resume Intelligence
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            AI-powered ATS scoring, optimization, and career positioning
          </p>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--paper-2)',
        borderBottom: '1px solid var(--border)',
        borderTop: '1px solid var(--border)',
        marginTop: 16,
        padding: '0 20px',
      }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {CV_TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 18px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--muted)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderBottom: '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.icon} {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: '20px 20px 0' }}>
        {children}
      </div>
    </div>
  )
}