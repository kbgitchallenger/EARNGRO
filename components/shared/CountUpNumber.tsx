'use client'

import { useEffect, useRef, useState } from 'react'

// Small, reusable count-up — the "numbers feel alive" detail from the
// approved premium mockups (HRS on Dashboard, composite score here).
// Client component because it needs requestAnimationFrame, which server
// components can't run — everything else about the pages using it stays
// server-rendered.
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