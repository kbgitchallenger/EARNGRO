export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const PLAN_LABEL: Record<string, string> = { free: 'Free', grow: 'Grow', accelerate: 'Accelerate' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan, credits_balance')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there'
  const plan = profile?.plan ?? 'free'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const sections = [
    {
      href: '/settings/billing',
      icon: '💳',
      title: 'Billing & Usage',
      desc: 'Your plan, credit balance, and full usage history',
    },
    {
      href: '/pricing',
      icon: '⚡',
      title: 'Plans & Pricing',
      desc: 'Compare Free, Grow, and Accelerate plans',
    },
  ]

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
        Settings
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
        Manage your account, billing, and preferences
      </p>

      {/* Account summary card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 20px', marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--teal-l), var(--teal-mid))',
          border: '1.5px solid var(--teal-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: 'var(--teal-d)', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{displayName}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email}</div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--teal-d)',
          background: 'var(--teal-l)', border: '1px solid var(--teal-mid)',
          padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {PLAN_LABEL[plan] ?? plan}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--paper)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '16px 18px',
              textDecoration: 'none', transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.desc}</div>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 16 }}>→</span>
          </Link>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 24 }}>
        More account settings — profile editing, notifications, security — coming soon.
      </p>
    </div>
  )
}