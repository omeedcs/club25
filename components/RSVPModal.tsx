'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { X, Check } from 'lucide-react'
import Modal from './Modal'

interface RSVPModalProps {
  isOpen: boolean
  onClose: () => void
  dropSlug: string
  chapterTitle: string
  inviteCode: string
}

export default function RSVPModal({ isOpen, onClose, dropSlug, chapterTitle, inviteCode }: RSVPModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dietary: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'confirmed' | 'waitlist' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dropSlug,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dietaryNotes: formData.dietary,
          inviteCode
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit RSVP')
      }

      setStatus(data.status)
      setSubmitted(true)
      
      // Redirect to confirmation page after 3 seconds
      setTimeout(() => {
        window.location.href = `/confirmation/${data.confirmationCode}`
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">

      {!submitted ? (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-serif mb-2 text-club-cream">Reserve Your Seat</h3>
            <p className="text-club-cream/60 text-sm">{chapterTitle}</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs mb-2 tracking-wider text-club-cream/70 uppercase">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-club-charcoal/30 border border-club-cream/20 px-4 py-2.5 text-club-cream focus:border-club-gold outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs mb-2 tracking-wider text-club-cream/70 uppercase">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                inputMode="email"
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-4 text-club-cream focus:border-club-gold outline-none transition-colors rounded-lg text-base touch-manipulation"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs mb-2 tracking-wider text-club-cream/70 uppercase">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-club-charcoal/30 border border-club-cream/20 px-4 py-2.5 text-club-cream focus:border-club-gold outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs mb-2 tracking-wider text-club-cream/70 uppercase">
                Dietary Restrictions <span className="text-club-cream/40">(Optional)</span>
              </label>
              <textarea
                name="dietary"
                value={formData.dietary}
                onChange={handleChange}
                rows={3}
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-4 text-club-cream focus:border-club-gold outline-none transition-colors resize-none rounded-lg text-base touch-manipulation"
                placeholder="Any allergies or dietary restrictions?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border border-club-cream text-club-cream hover:bg-club-cream hover:text-club-blue transition-all duration-300 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'SUBMITTING...' : 'CONFIRM RESERVATION'}
            </button>
          </form>

          <p className="text-xs text-club-cream/40 mt-6 text-center">
            You&apos;ll receive a confirmation email with details.
          </p>
        </>
      ) : (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-4">{status === 'confirmed' ? '✓' : '⏱'}</div>
          <h3 className="text-3xl font-serif mb-3 text-club-cream">
            {status === 'confirmed' ? 'You&apos;re Confirmed!' : 'You&apos;re on the Waitlist'}
          </h3>
          <p className="text-club-cream/60 mb-4 text-sm">
            {status === 'confirmed' 
              ? 'Check your email for your confirmation code.' 
              : 'We&apos;ll notify you if a spot opens.'}
          </p>
          <p className="text-xs text-club-cream/40 mb-6">
            Redirecting...
          </p>
        </motion.div>
      )}
    </Modal>
  )
}
