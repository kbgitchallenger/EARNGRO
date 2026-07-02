import { adminSupabase } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()

  const { data, error } = await adminSupabase.auth.admin.listUsers()

  if (error) {
    console.error('Admin listUsers error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const exists = data.users.some(
    (user) => user.email?.toLowerCase() === email.toLowerCase()
  )

  return NextResponse.json({ exists })
}