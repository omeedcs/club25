'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'

interface RSVPModalProps {
  isOpen: boolean
  onClose: () => void
  dropSlug: string
  chapterTitle: string
}

export default function RSVPModal({ isOpen, onClose, dropSlug, chapterTitle }: RSVPModalProps) {
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
          dietaryNotes: formData.dietary
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-club-charcoal border border-club-lilac/30 p-6 md:p-12 max-w-2xl w-full shadow-2xl rounded-lg overflow-hidden my-8"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-club-blue/5 to-transparent pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-club-cream/70 hover:text-club-cream hover:bg-club-cream/10 p-2 rounded-full transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h3 className="text-4xl font-serif mb-2">Reserve Your Seat</h3>
                  <p className="text-club-cream/70">{chapterTitle}</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2 tracking-wide">NAME</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 tracking-wide">EMAIL</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 tracking-wide">PHONE</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 tracking-wide">
                      DIETARY RESTRICTIONS (OPTIONAL)
                    </label>
                    <textarea
                      name="dietary"
                      value={formData.dietary}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-club-blue text-club-cream hover:bg-club-lilac transition-all duration-300 text-lg tracking-wider mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'SUBMITTING...' : 'SUBMIT RESERVATION'}
                  </button>
                </form>

                <p className="text-sm text-club-cream/50 mt-6 text-center">
                  You'll receive a confirmation email with the address and details.
                </p>
              </>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-4xl font-serif mb-4">
                  {status === 'confirmed' ? 'You\'re Confirmed!' : 'You\'re on the Waitlist'}
                </h3>
                <p className="text-xl text-club-cream/70 mb-4">
                  {status === 'confirmed' 
                    ? 'Check your email for your confirmation code and QR code.' 
                    : 'We\'ll notify you immediately if a spot opens up.'}
                </p>
                <p className="text-sm text-club-cream/50 mb-8">
                  Redirecting to your confirmation page...
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({ name: '', email: '', phone: '', dietary: '' })
                    onClose()
                  }}
                  className="px-8 py-3 border border-club-cream text-club-cream hover:bg-club-cream hover:text-club-blue transition-all duration-300"
                >
                  CLOSE
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
