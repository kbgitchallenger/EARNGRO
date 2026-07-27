'use client'

import { useEffect, useRef, useState } from 'react'

// Small, reusable count-up — the "numbers feel alive" detail from the
// approved premium mockups (HRS on Dashboard, composite score on CV
// Analysis, etc). Client component because it needs
// requestAnimationFrame, which server components can't run.
export default function CountUpNumber({
  value,
  duration = 900,
  style,
}: {
  value: number
  duration?: number
  style?: React.CSSProperties
}) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    // FIX: previously animated unconditionally regardless of the user's
    // OS-level motion preference. matchMedia check is read once per
    // mount rather than subscribed to changes — acceptable here since a
    // user changing this OS setting mid-session and expecting an
    // already-mounted number to instantly change behavior is a very
    // unlikely edge case, not worth the added complexity of a listener.
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    startRef.current = null
    let raf: number

    function frame(now: number) {
      if (startRef.current === null) startRef.current = now
      const p = Math.min((now - startRef.current) / duration, 1)
      setDisplay(Math.round(value * p))
      if (p < 1) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <span style={style}>{display}</span>
}