'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`
        }
      })

      if (error) throw error

      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue px-6">
      <motion.div
        className="max-w-md w-full bg-club-charcoal border border-club-lilac/30 p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Club25"
            width={80}
            height={80}
          />
        </div>

        {sent ? (
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-4 text-club-cream">Check Your Email</h2>
            <p className="text-club-cream/70">
              We sent you a magic link. Click it to sign in.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-serif mb-2 text-club-cream text-center">Sign In</h2>
            <p className="text-club-cream/70 mb-8 text-center">
              Enter your email to receive a magic link
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-club-cream tracking-wide">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-club-blue text-club-cream hover:bg-club-lilac transition-all duration-300 text-lg tracking-wider disabled:opacity-50"
              >
                {loading ? 'SENDING...' : 'SEND MAGIC LINK'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <a href="/" className="text-club-cream/50 hover:text-club-cream text-sm transition-colors">
                ← Back to Home
              </a>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
