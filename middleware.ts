import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware for auth callback
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    console.log('Skipping middleware for auth callback')
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('Middleware check:', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    userEmail: session?.user?.email
  })

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // TEMPORARILY DISABLED FOR DEBUGGING
    console.log('⚠️ Admin route accessed - AUTH TEMPORARILY DISABLED FOR DEBUGGING')
    console.log('Session status:', {
      hasSession: !!session,
      userEmail: session?.user?.email
    })
    
    // TODO: Re-enable after fixing session persistence
    // if (!session) {
    //   console.log('No session, redirecting to login')
    //   return NextResponse.redirect(new URL('/login', req.url))
    // }
    
    return res // Allow access for now
  }

  // Protect /my routes (user dashboard)
  if (req.nextUrl.pathname.startsWith('/my')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/my/:path*', '/auth/:path*'],
}
