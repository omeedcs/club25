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
    if (!session) {
      console.log('No session, redirecting to login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const userEmail = session.user.email
    
    console.log('Admin check:', {
      userEmail,
      adminEmail,
      isAdmin: userEmail === adminEmail
    })

    if (adminEmail && userEmail !== adminEmail) {
      console.log('User is not admin, redirecting to home')
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    // If no admin email is set, allow anyone authenticated (dev mode)
    if (!adminEmail) {
      console.warn('⚠️ WARNING: ADMIN_EMAIL not set - allowing all authenticated users to access admin!')
    }
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
