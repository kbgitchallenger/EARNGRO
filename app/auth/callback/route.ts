import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth/email errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription ?? error)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Ensure profile exists (first-time Google OAuth users won't have one yet)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          plan: 'free',
          credits_balance: 300,
        }, { onConflict: 'id', ignoreDuplicates: true })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Code exchange error:', exchangeError)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}