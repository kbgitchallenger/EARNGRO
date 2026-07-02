//app/api/auth/check-email/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const exists = data.users.some(
    user => user.email?.toLowerCase() === email.toLowerCase()
  )

  return NextResponse.json({ exists })
}