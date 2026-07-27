'use client'

import { useState } from 'react'

// Generic collapse-then-expand list — reduces forced scrolling on
// variable-length AI-generated lists (strengths, issues, improvements,
// etc.) without hiding content permanently. Works the same on desktop and
// mobile deliberately — this is a genuinely better reading pattern
// everywhere, not just a mobile-only workaround.
interface ShowMoreListProps<T> {
  items: T[]
  defaultCount?: number
  renderItem: (item: T, index: number) => React.ReactNode
  itemLabel?: string // e.g. "item", "improvement" — used in the button text
}

export default function ShowMoreList<T>({
  items,
  defaultCount = 3,
  renderItem,
  itemLabel = 'more',
}: ShowMoreListProps<T>) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, defaultCount)
  const hiddenCount = items.length - defaultCount

  return (
    <>
      {visible.map((item, i) => renderItem(item, i))}
      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            width: '100%', marginTop: 8, padding: '8px 0', fontSize: 12, fontWeight: 600,
            color: 'var(--teal-d)', background: 'var(--teal-l)', border: '1px solid var(--teal-mid)',
            borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--sans)',
          }}
        >
          Show {hiddenCount} more {itemLabel}{hiddenCount === 1 ? '' : 's'} ↓
        </button>
      )}
    </>
  )
}