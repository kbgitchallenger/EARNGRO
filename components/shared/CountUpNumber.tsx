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
  locale,
}: {
  value: number
  duration?: number
  style?: React.CSSProperties
  // FIX: previously took `format?: (n: number) => string` — a raw
  // function prop. That's invalid whenever this component is rendered
  // from a Server Component (the Billing page, an async function with
  // no 'use client'): functions can't be serialized across the server→
  // client boundary in Next.js App Router, only plain data can. `locale`
  // is a plain string, safe to pass from anywhere, and the formatting
  // now happens internally via .toLocaleString() instead of an
  // externally-supplied function.
  locale?: string
}) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
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

  return <span style={style}>{locale ? display.toLocaleString(locale) : display}</span>
}