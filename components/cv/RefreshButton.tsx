'use client'

export default function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      style={{
        background: 'var(--teal)', color: '#fff', border: 'none',
        borderRadius: 99, padding: '11px 28px', fontSize: 14,
        fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)',
      }}
    >
      Refresh
    </button>
  )
}