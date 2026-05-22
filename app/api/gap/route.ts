export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: attempts, error } = await supabase
      .from('grow_dna')
      .select(`
        id, attempt_number, created_at,
        industry, experience, role, city,
        current_salary, target_salary, earning_gap,
        hrs_score, months_to_close, career_archetype,
        salary_range_min, salary_range_max,
        dimension_scores, gap_reasons, close_actions,
        raw_ai_response
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ attempts: attempts ?? [] })
  } catch (err) {
    console.error('Gap API error:', err)
    return NextResponse.json({ error: 'Failed to load gap data' }, { status: 500 })
  }
}