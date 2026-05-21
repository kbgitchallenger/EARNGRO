'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TopbarProps {
  name: string
  email: string
  plan: string
}

export default function Topbar({ name, email, plan }: TopbarProps) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Page title injected by children via context — kept simple for now */}
      </div>
      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-av">{initials}</div>
          <div className="topbar-info">
            <div className="topbar-name">{name}</div>
            <div className="topbar-email">{email}</div>
          </div>
          <button className="topbar-signout" onClick={signOut} title="Sign out">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}