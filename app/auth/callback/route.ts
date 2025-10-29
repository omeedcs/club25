import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get('next') || '/admin'
  
  console.log('Auth callback hit:', {
    url: requestUrl.toString(),
    next,
    allParams: Object.fromEntries(requestUrl.searchParams),
    cookies: request.cookies.getAll().map(c => c.name)
  })

  // Create Supabase client to check session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get the session (Supabase already set it via cookies when they redirected here)
  const { data: { session }, error } = await supabase.auth.getSession()

  console.log('Session check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    error: error?.message
  })

  if (session) {
    // Success! Redirect to destination
    console.log('Redirecting to:', `${requestUrl.origin}${next}`)
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  // No session found, redirect back to login
  console.log('No session found after auth callback, redirecting to login')
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_session`)
}
