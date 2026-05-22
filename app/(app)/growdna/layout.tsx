// Full-screen layout for GrowDNA — overrides (app)/layout.tsx
// No sidebar, no topbar — clean onboarding experience like Typeform/Linear
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GrowDNALayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="growdna-shell">
      {/* Minimal header — just logo + exit */}
      <header className="growdna-header">
        <div className="growdna-logo">
          <div className="logo-mark" style={{ width: 28, height: 28, fontSize: 11 }}>EG</div>
          <span className="logo-name">Earn<em>Gro</em></span>
        </div>
        <a href="/dashboard" className="growdna-exit">
          ✕ Exit
        </a>
      </header>
      <main className="growdna-main">
        {children}
      </main>
    </div>
  )
}