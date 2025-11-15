'use client'

import { useState } from 'react'
import Modal from './Modal'
import { motion } from 'framer-motion'

interface InviteCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onCodeValidated: (code: string) => void
}

export default function InviteCodeModal({ isOpen, onClose, onCodeValidated }: InviteCodeModalProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid code')
      }

      // Store validated code in localStorage for session
      localStorage.setItem('club25_invite_code', code.trim().toUpperCase())
      
      // Check if there's a special redirect (like for CLUB-ALISHBA)
      if (data.redirectTo) {
        window.location.href = data.redirectTo
      } else {
        onCodeValidated(code.trim().toUpperCase())
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-club-gold/30 bg-club-gold/5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-club-gold animate-pulse" />
          <span className="text-xs tracking-[0.2em] text-club-gold uppercase">Invitation Only</span>
        </motion.div>

        <h2 className="text-3xl font-serif mb-3 text-club-cream">Enter Invite Code</h2>
        <p className="text-club-cream/60 mb-8 text-sm">
          Club25 is exclusive. Enter your invite code to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CLUB-XXXX"
              required
              maxLength={20}
              className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-3 text-club-cream text-center text-lg tracking-widest focus:border-club-gold outline-none transition-colors font-mono"
            />
          </div>

          {error && (
            <motion.div
              className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full py-3 border border-club-cream text-club-cream hover:bg-club-cream hover:text-club-blue transition-all duration-300 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'VALIDATING...' : 'CONTINUE'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-club-cream/10">
          <p className="text-xs text-club-cream/40 mb-3">Don't have a code?</p>
          <button
            onClick={() => {
              // TODO: Open waitlist modal
              alert('Waitlist coming soon')
            }}
            className="text-sm text-club-gold hover:text-club-cream transition-colors underline"
          >
            Join the waitlist
          </button>
        </div>
      </div>
    </Modal>
  )
}
