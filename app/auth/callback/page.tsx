'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash from URL (Supabase puts auth tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')
        
        console.log('Auth callback page loaded:', {
          hash: window.location.hash,
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token
        })

        if (access_token && refresh_token) {
          // Set the session
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })

          if (error) {
            console.error('Error setting session:', error)
            router.push('/login?error=auth_failed')
            return
          }

          console.log('Session set successfully:', {
            userId: data.user?.id,
            email: data.user?.email
          })

          // Get redirect destination
          const next = searchParams.get('next') || '/admin'
          router.push(next)
        } else {
          console.log('No tokens in hash, checking for existing session')
          
          // Check if session already exists
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            const next = searchParams.get('next') || '/admin'
            router.push(next)
          } else {
            console.log('No session found, redirecting to login')
            router.push('/login?error=no_session')
          }
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/login?error=auth_failed')
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
