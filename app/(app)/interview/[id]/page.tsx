export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InterviewSession from '@/components/interview/InterviewSession'

function InterviewReport({
  session,
  turns,
}: {
  session: any
  turns: any[]
}) {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Interview Report</h1>
      <p className="text-sm text-muted-foreground">
        Report view is currently unavailable.
      </p>
      <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
        {JSON.stringify({ session, turns }, null, 2)}
      </pre>
    </div>
  )
}

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