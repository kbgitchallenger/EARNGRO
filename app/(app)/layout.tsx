//app/(app)/layout.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/app/AppShell'
import { getStreak } from '@/services/streaks.service'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, plan, avatar_url, credits_balance')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const plan = profile?.plan || 'free'
  const creditsBalance = profile?.credits_balance ?? 0

  // Real streak, fetched once here and passed down — same pattern as
  // credits_balance above.
  const { currentStreak } = await getStreak(user.id)

  return (
    <AppShell
      name={displayName}
      email={user.email || ''}
      plan={plan}
      creditsBalance={creditsBalance}
      currentStreak={currentStreak}
    >
      {children}
    </AppShell>
  )
}