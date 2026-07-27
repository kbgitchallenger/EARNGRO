
import { createClient } from '@/lib/supabase/server'

export interface StreakResult {
  currentStreak: number
  longestStreak: number
}

// Call this after any real, credit-consuming action succeeds (GrowDNA,
// CV analysis, interview turn, bullet optimize). Deliberately NOT called
// on login/page-view — a streak here means real progress, not passive
// presence, which is what keeps the mechanic honest rather than hollow.
export async function recordStreakActivity(userId: string): Promise<StreakResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('record_streak_activity', { p_user_id: userId })

  if (error) {
    console.error('Streak recording failed (non-fatal):', error)
    return { currentStreak: 0, longestStreak: 0 }
  }

  const result = data?.[0]
  return {
    currentStreak: result?.current_streak ?? 0,
    longestStreak: result?.longest_streak ?? 0,
  }
}

export async function getStreak(userId: string): Promise<StreakResult> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak, last_active_date')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) return { currentStreak: 0, longestStreak: 0 }

  // If last active date is older than yesterday, the streak is
  // effectively broken even though we haven't written a 0 yet — the row
  // only updates on next activity. Reflect that honestly when just reading.
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const isStillAlive = data.last_active_date === today || data.last_active_date === yesterday

  return {
    currentStreak: isStillAlive ? data.current_streak : 0,
    longestStreak: data.longest_streak,
  }
}