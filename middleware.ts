import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Canonical-domain redirect — checked first, before any Supabase/auth work.
// Razorpay's checkout blocks payments from any origin not registered on
// the business account (confirmed cause of the "Business – Website
// mismatch" failure) — only 'earngro.app' is registered there. Without
// this, anyone reaching the raw Vercel deployment URL (a bookmark, an old
// shared link, Vercel's default domain being indexed) would hit the same
// payment-blocking failure again.
const VERCEL_DOMAIN = 'earngro.vercel.app'
const CANONICAL_DOMAIN = 'earngro.app'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''

  if (host === VERCEL_DOMAIN) {
    const url = request.nextUrl.clone()
    url.host = CANONICAL_DOMAIN
    url.protocol = 'https'
    // 308 = permanent redirect, preserves the request method — important
    // since this matcher also covers non-GET requests, not just page loads
    return NextResponse.redirect(url, 308)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/growdna', '/interview', '/cv', '/growpath', '/settings']
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Already logged in — redirect away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}