import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware for auth callback
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', session.user.id)
      .single()

    const adminEmail = process.env.ADMIN_EMAIL
    if (profile?.email !== adminEmail) {
      return NextResponse.redirect(new URL('/', req.url))
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
