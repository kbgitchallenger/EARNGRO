export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InterviewSetup from '@/components/interview/InterviewSetup'
import CheckoutButton from '@/components/billing/CheckoutButton'

export const metadata = { title: 'AI Interview Practice — EarnGro' }

export default async function InterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'

  // ── Plan gate — AI Interview is Accelerate-only ──────────────────
  // Same hard block pattern as GrowPath and CV Analyze: checked server-side
  // before any data fetch, not just hidden client-side. Previously this
  // page had no gate at all — any free or Grow-plan user could reach the
  // setup form and even start a real, billable session.
  if (plan !== 'accelerate') {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto 0', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🎤</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
          AI Interview is an Accelerate feature
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.7 }}>
          Practice with a real-feeling AI interviewer, get scored per answer, and leave with a concrete improved example — available on the Accelerate plan.
        </p>
        <CheckoutButton
          type="plan_upgrade"
          planKey="accelerate"
          label="Upgrade to Accelerate →"
          style={{ maxWidth: 260, margin: '0 auto' }}
        />
      </div>
    )
  }

  // Pre-fill from latest GrowDNA
  const { data: dna } = await supabase
    .from('grow_dna')
    .select('role, industry, experience, hrs_score, dimension_scores, career_archetype')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Find weakest dimension
  let weakestDimension = 'negotiation'
  if (dna?.dimension_scores) {
    const ds = dna.dimension_scores as Record<string, number>
    const dims = ['market_alignment', 'skill_premium', 'visibility', 'mobility', 'negotiation']
    weakestDimension = dims.reduce((worst, d) => (ds[d] ?? 100) < (ds[worst] ?? 100) ? d : worst, dims[0])
  }

  // Fetch recent sessions
  const { data: recentSessions } = await supabase
    .from('interview_sessions')
    .select('id, mode, role, overall_score, created_at, status, persona')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <InterviewSetup
      prefill={{
        role:             dna?.role ?? '',
        industry:         dna?.industry ?? '',
        experienceBand:   dna?.experience ?? '',
        weakestDimension,
        hrsScore:         dna?.hrs_score ?? null,
        careerArchetype:  dna?.career_archetype ?? null,
      }}
      recentSessions={recentSessions ?? []}
    />
  )
}