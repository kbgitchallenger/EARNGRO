// Small, honest illustrative card for feature spotlight visuals — labeled
// content, not fabricated user data, since real screenshots/numbers aren't
// available pre-launch and presenting fake specifics as real would repeat
// the trust issue already flagged in the ticker/testimonials section.
export default function FeatureVisualCard({
  icon,
  title,
  rows,
  accent = 'var(--teal)',
}: {
  icon: string
  title: string
  rows: { label: string; value: string; color?: string }[]
  accent?: string
}) {
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24, boxShadow: 'var(--sh-md)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: `${accent}0d`, borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, position: 'relative' }}>
        <div style={{ width: 36, height: 36, background: `${accent}14`, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--border-l)' : 'none' }}>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: r.color ?? accent }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}