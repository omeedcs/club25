'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback - waiting for session...')
        
        // Supabase magic links set cookies directly via HTTP redirect
        // We need to wait a moment for the cookies to be set, then check
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Now check for session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('Session check result:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          error: error?.message
        })

        if (session) {
          console.log('✅ Session found! Redirecting to admin...')
          const next = searchParams.get('next') || '/admin'
          
          // Use window.location for a hard redirect to ensure cookies are sent
          window.location.href = next
        } else {
          console.error('❌ No session found after callback')
          
          // Try one more time with refresh
          const { data: { session: retrySession } } = await supabase.auth.refreshSession()
          
          if (retrySession) {
            console.log('✅ Session found on retry!')
            const next = searchParams.get('next') || '/admin'
            window.location.href = next
          } else {
            console.error('❌ Still no session, redirecting to login')
            router.push('/login?error=no_session')
          }
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/login?error=auth_failed')
      } finally {
        setChecking(false)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-club-blue">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-club-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-club-cream">Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-club-blue">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-club-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-club-cream">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
