'use client'

import { useEffect, useState } from 'react'

export default function HRSBar({ score }: { score: number }) {
  const [width, setWidth] = useState(0)
  const pct = Math.min(100, (score / 1000) * 100)
  const color = score >= 700 ? 'var(--teal)' : score >= 400 ? 'var(--amber)' : 'var(--red)'

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="hrs-bar-wrap">
      <div className="hrs-bar-track">
        <div
          className="hrs-bar-fill"
          style={{
            width: `${width}%`,
            background: color,
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  )
}