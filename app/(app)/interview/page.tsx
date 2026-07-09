export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InterviewSession from '@/components/interview/InterviewSession'
import InterviewReport from '@/components/interview/InterviewReport'

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) redirect('/interview')

  const { data: turns } = await supabase
    .from('interview_turns')
    .select('*')
    .eq('session_id', id)
    .order('turn_index', { ascending: true })

  if (session.status === 'completed') {
    return <InterviewReport session={session} turns={turns ?? []} />
  }

  return <InterviewSession session={session} turns={turns ?? []} />
}