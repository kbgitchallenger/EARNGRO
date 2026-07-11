'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Auto-polls instead of requiring a manual "Refresh" click — the user
// shouldn't have to guess when parsing finished. Polls every 3s via
// router.refresh(), which re-runs the server component and picks up
// version.raw_text once the parse pipeline completes. Stops polling and
// shows a real "taking longer than expected" state after ~60s (20 polls),
// rather than silently spinning forever if something actually failed.

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 20

export default function ParsingStatus() {
  const router = useRouter()
  const [pollCount, setPollCount] = useState(0)
  const [dots, setDots] = useState(1)

  const timedOut = pollCount >= MAX_POLLS

  useEffect(() => {
    if (timedOut) return

    const interval = setInterval(() => {
      router.refresh()
      setPollCount(c => c + 1)
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [router, timedOut])

  // Lightweight "..." breathing animation on the status text, separate
  // from the actual poll timer so it feels alive between refreshes.
  useEffect(() => {
    const dotInterval = setInterval(() => setDots(d => (d % 3) + 1), 500)
    return () => clearInterval(dotInterval)
  }, [])

  if (timedOut) {
    return (
      <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
          This is taking longer than expected
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.7 }}>
          Parsing usually finishes in a few seconds. If it's been over a minute, the file may be an unusual format — try uploading again, or reach out if this keeps happening.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setPollCount(0); router.refresh() }}
            style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: 'var(--teal)', border: 'none', borderRadius: 99, padding: '11px 22px', cursor: 'pointer' }}
          >
            Check again
          </button>
          <Link href="/cv/upload" style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 99, padding: '11px 22px', textDecoration: 'none' }}>
            Upload again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 20px' }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          border: '3px solid var(--teal-l)', borderTop: '3px solid var(--teal)',
          animation: 'parsingSpin 0.9s linear infinite',
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          🔍
        </div>
      </div>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
        Reading your resume{'.'.repeat(dots)}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 360, margin: '0 auto', lineHeight: 1.7 }}>
        Extracting your experience, skills, and education — this page will update automatically, no need to refresh.
      </p>

      <style>{`
        @keyframes parsingSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}