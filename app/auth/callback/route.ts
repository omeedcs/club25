import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get('next') || '/admin'
  
  console.log('Auth callback hit:', {
    url: requestUrl.toString(),
    next,
    searchParams: Object.fromEntries(requestUrl.searchParams)
  })

  // Supabase has already set the session via cookies
  // Just redirect to the destination
  const response = NextResponse.redirect(`${requestUrl.origin}${next}`)
  
  // Log for debugging
  console.log('Redirecting to:', `${requestUrl.origin}${next}`)
  
  return response
}
