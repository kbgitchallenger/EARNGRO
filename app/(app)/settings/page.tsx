import Link from 'next/link'

export default function SettingsPage() {
  const sections = [
    {
      href: '/settings/billing',
      icon: '💳',
      title: 'Billing & Usage',
      desc: 'Your plan, credit usage, and upgrade options',
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
        More account settings — profile, notifications, security — coming soon.
      </p>
    </div>
  )
}