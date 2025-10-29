'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import QRCode from 'qrcode'
import { Ticket, Check, Calendar, MapPin, Clock } from 'lucide-react'

export default function MyTicketPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState<any>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Check if code is in URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlCode = params.get('code')
    const storedCode = localStorage.getItem('club25_confirmation_code')
    
    if (urlCode) {
      setCode(urlCode)
      lookupTicket(urlCode)
    } else if (storedCode) {
      setCode(storedCode)
      lookupTicket(storedCode)
    }
  }, [])

  const lookupTicket = async (confirmationCode: string) => {
    if (!confirmationCode || confirmationCode.length < 6) return

    setLoading(true)
    setError('')

    try {
      // Fetch RSVP with confirmation code
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select(`
          *,
          drops (*),
          profiles (*)
        `)
        .eq('confirmation_code', confirmationCode.toUpperCase())
        .single()

      if (rsvpError || !rsvpData) {
        setError('Invalid confirmation code. Please check and try again.')
        setTicket(null)
        return
      }

      setTicket(rsvpData)
      localStorage.setItem('club25_confirmation_code', confirmationCode.toUpperCase())

      // Generate QR code
      const qrData = JSON.stringify({
        code: confirmationCode.toUpperCase(),
        id: rsvpData.id,
        name: rsvpData.profiles?.name,
        drop: rsvpData.drops?.slug
      })

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 512,
        margin: 2,
        color: {
          dark: '#004aad',
          light: '#fffcf7'
        }
      })
      
      setQrCodeUrl(qrUrl)
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
      console.error('Lookup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    lookupTicket(code)
  }

  return (
    <div className="min-h-screen bg-club-blue text-club-cream">
      {/* Mobile-optimized header */}
      <div className="safe-top bg-club-charcoal/50 backdrop-blur-lg border-b border-club-cream/10 sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-club-gold font-serif text-xl">Club25</a>
          <Ticket className="w-6 h-6 text-club-gold" />
        </div>
      </div>

      <div className="px-4 py-8 pb-safe">
        <AnimatePresence mode="wait">
          {!ticket ? (
            // Confirmation Code Input
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 bg-club-gold/20 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Ticket className="w-10 h-10 text-club-gold" />
                </motion.div>
                <h1 className="text-3xl font-serif mb-2">My Ticket</h1>
                <p className="text-club-cream/70">Enter your confirmation code</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    className="w-full bg-club-charcoal/50 border border-club-cream/20 px-6 py-4 text-club-cream text-center text-2xl tracking-[0.5em] font-mono focus:border-club-gold outline-none transition-all rounded-lg"
                    maxLength={8}
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full py-4 bg-club-gold text-club-blue font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
                >
                  {loading ? 'LOADING...' : 'VIEW TICKET'}
                </button>
              </form>

              <p className="text-center text-xs text-club-cream/50 mt-8">
                Check your email for your confirmation code
              </p>
            </motion.div>
          ) : (
            // Ticket Display with QR Code
            <motion.div
              key="ticket"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                  ticket.status === 'confirmed' 
                    ? 'bg-club-gold/20 text-club-gold border border-club-gold/30'
                    : 'bg-club-lilac/20 text-club-lilac border border-club-lilac/30'
                }`}>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {ticket.status}
                  </span>
                </div>
              </div>

              {/* Ticket Card */}
              <motion.div
                className="bg-gradient-to-br from-club-charcoal to-club-blue border-2 border-club-gold/30 rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* QR Code */}
                <div className="bg-club-cream p-8 flex items-center justify-center">
                  {qrCodeUrl && (
                    <motion.img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-64 h-64"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    />
                  )}
                </div>

                {/* Ticket Details */}
                <div className="p-6 space-y-4">
                  <div className="text-center border-b border-club-cream/10 pb-4">
                    <h2 className="text-2xl font-serif text-club-gold mb-1">
                      {ticket.drops?.title}
                    </h2>
                    <p className="text-club-cream/70 text-sm">
                      {ticket.profiles?.name}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-club-gold flex-shrink-0" />
                      <span>{new Date(ticket.drops?.date_time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-5 h-5 text-club-gold flex-shrink-0" />
                      <span>{new Date(ticket.drops?.date_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-club-gold flex-shrink-0" />
                      <span>{ticket.drops?.location || 'Location TBA'}</span>
                    </div>
                  </div>

                  {/* Confirmation Code */}
                  <div className="bg-club-blue/30 rounded-lg p-4 mt-6">
                    <div className="text-xs text-club-cream/50 mb-1 text-center">Confirmation Code</div>
                    <div className="text-2xl font-mono text-center tracking-[0.3em] text-club-gold">
                      {ticket.confirmation_code}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    if (navigator.share && qrCodeUrl) {
                      // Convert data URL to blob
                      fetch(qrCodeUrl)
                        .then(res => res.blob())
                        .then(blob => {
                          const file = new File([blob], 'ticket.png', { type: 'image/png' })
                          navigator.share({
                            title: 'My Club25 Ticket',
                            text: `My ticket for ${ticket.drops?.title}`,
                            files: [file]
                          })
                        })
                    }
                  }}
                  className="w-full py-3 border border-club-cream/30 rounded-lg font-medium active:scale-95 transition-all touch-manipulation"
                >
                  Share Ticket
                </button>

                <button
                  onClick={() => {
                    setTicket(null)
                    setCode('')
                    localStorage.removeItem('club25_confirmation_code')
                  }}
                  className="w-full py-3 text-club-cream/70 text-sm"
                >
                  View Different Ticket
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-8 p-4 bg-club-gold/10 rounded-lg border border-club-gold/20">
                <p className="text-sm text-club-cream/70 text-center">
                  <strong className="text-club-gold">At the door:</strong> Show this QR code to staff for entry
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
