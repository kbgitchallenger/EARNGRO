//app/(app)/layout.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/app/Sidebar'
import Topbar from '@/components/app/Topbar'
import MobileNav from '@/components/app/MobileNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile — added credits_balance so the nav can show a live,
  // always-visible balance instead of users only discovering they're low
  // when an action fails mid-flow.
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, plan, avatar_url, credits_balance')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const plan = profile?.plan || 'free'
  const creditsBalance = profile?.credits_balance ?? 0

  return (
    <div className="app-shell">
      <Sidebar plan={plan} />
      <div className="app-main">
        <Topbar name={displayName} plan={plan} email={user.email || ''} creditsBalance={creditsBalance} />
        <main className="app-content">
          {children}
        </main>
      </div>
      <MobileNav plan={plan} />
    </div>
  )
}