// Shared shell recreating the REAL EarnGro sidebar + topbar — same nav
// items as the actual Sidebar/Topbar components, same teal branding — so
// every feature screenshot on the landing page looks consistently like
// the actual product, not five different invented styles.

const NAV = [
  { label: 'Dashboard', icon: '⌂' },
  { label: 'GrowDNA', icon: '🧬' },
  { label: 'Earning Gap', icon: '📊' },
  { label: 'CV Builder', icon: '📄' },
  { label: 'GrowPath', icon: '🗺️' },
  { label: 'AI Interview', icon: '🎤' },
  { label: 'Pricing', icon: '⚡' },
]

export default function AppScreenshotFrame({
  active,
  credits,
  children,
}: {
  active: string
  credits: number
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--sh-lg)', fontSize: 10 }}>

      {/* Sidebar */}
      <div style={{ width: 108, background: '#0f1613', flexShrink: 0, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16, padding: '0 4px' }}>
          <div style={{ width: 16, height: 16, background: 'linear-gradient(135deg,var(--teal),#1AA574)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff' }}>EG</div>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff' }}>Earn<span style={{ color: 'var(--teal)' }}>Gro</span></span>
        </div>
        {NAV.map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 7px', borderRadius: 5,
            background: item.label === active ? 'rgba(14,122,90,0.25)' : 'transparent',
            color: item.label === active ? '#7fd9bd' : 'rgba(255,255,255,0.55)',
            fontSize: 8, fontWeight: item.label === active ? 700 : 500,
          }}>
            <span style={{ fontSize: 9 }}>{item.icon}</span>{item.label}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ height: 30, borderBottom: '1px solid var(--border-l)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', flexShrink: 0 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ink)' }}>{active}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--teal-d)', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)', padding: '2px 7px', borderRadius: 99 }}>
              {credits.toLocaleString('en-IN')} credits
            </span>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal-l),var(--teal-mid))', border: '1px solid var(--teal-mid)' }} />
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: 12, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  )
}