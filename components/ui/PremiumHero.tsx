// Shared hero shell — replaces the identical gradient+DNA-helix+shadow
// block that was copy-pasted verbatim across Dashboard, CV Analysis,
// Interview Report, and GrowPath. Content is fully flexible (children +
// optional rightSlot), so each page's actual "big moment" stays genuinely
// different — only the outer treatment (which SHOULD be a consistent
// brand signature) is shared. Uses real tokens from globals.css
// (--r-xl, --shadow-teal) instead of ad-hoc values invented per-file.
//
// Server-renderable — no client state needed for the shell itself.

interface PremiumHeroProps {
  children: React.ReactNode
  rightSlot?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function PremiumHero({ children, rightSlot, style, className }: PremiumHeroProps) {
  return (
    <div
      className={className}
      style={{
        background: 'radial-gradient(circle at 15% 15%, #0f8a66, #083d2e 75%)',
        borderRadius: 'var(--r-xl)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-teal-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: rightSlot ? 'space-between' : 'flex-start',
        gap: 20,
        flexWrap: 'wrap',
        color: '#fff',
        ...style,
      }}
    >
      {/* DNA helix motif — the one deliberate signature visual, used
          consistently wherever this shell appears, tying every "big
          moment" in the app back to the GrowDNA brand concept. */}
      <svg
        viewBox="0 0 100 100"
        style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, opacity: 0.2, pointerEvents: 'none' }}
        aria-hidden
      >
        <path d="M20 10 Q50 30 20 50 Q50 70 20 90" stroke="#fff" strokeWidth="2" fill="none" />
        <path d="M80 10 Q50 30 80 50 Q50 70 80 90" stroke="#fff" strokeWidth="2" fill="none" />
      </svg>

      <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>{children}</div>
      {rightSlot && <div style={{ position: 'relative', flexShrink: 0 }}>{rightSlot}</div>}
    </div>
  )
}