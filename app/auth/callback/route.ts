import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/admin'

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })

      if (error) {
        console.error('Error verifying OTP:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
      }

      // Success - redirect to destination
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
    }
  }

  // No token, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
