// Full-screen layout for GrowDNA — overrides (app)/layout.tsx
// No sidebar, no topbar — clean onboarding experience like Typeform/Linear
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
export default async function GrowDNALayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="growdna-shell">
      {/* Minimal header — just logo + exit */}
      <header className="growdna-header">
        <div className="growdna-logo">
         <Image
    src="/logo.png"
    alt="EarnGro"
    width={140}
    height={36}
    priority
    style={{
      width: 'auto',
      height: 30,
      display: 'block',
      flexShrink: 0,
    }}      />      
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