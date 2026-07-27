// Real streak display — matches the approved premium mockup exactly, but
// every number here comes from the actual user_streaks table via
// getStreak(), not hardcoded example data. The 7 day-dots reflect real
// current streak length (capped visually at 7, since that's the natural
// weekly rhythm), not a fixed "always show 7 filled" placeholder.

interface StreakCardProps {
  currentStreak: number
}

export default function StreakCard({ currentStreak }: StreakCardProps) {
  const hasStreak = currentStreak > 0
  const dotsToShow = Math.min(currentStreak, 7)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 16,
      padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {hasStreak ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--teal)',
            color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 99,
          }}>
            🔥 {currentStreak}-day streak
          </span>
        ) : (
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
            No active streak yet
          </span>
        )}
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          {hasStreak
            ? 'Take one real action today to keep it alive'
            : 'Complete a GrowDNA, CV analysis, or interview session to start one'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{
            width: 9, height: 9, borderRadius: '50%',
            background: i < dotsToShow ? 'var(--teal)' : 'var(--border)',
          }} />
        ))}
      </div>
    </div>
  )
}