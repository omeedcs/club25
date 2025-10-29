'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import RSVPModal from './RSVPModal'
import InviteCodeModal from './InviteCodeModal'

export default function CurrentChapter() {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showRSVPModal, setShowRSVPModal] = useState(false)
  const [validatedCode, setValidatedCode] = useState('')
  const [drop, setDrop] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCurrentDrop() {
      try {
        const res = await fetch('/api/drops/current', { cache: 'no-store' })
        const data = await res.json()
        setDrop(data.drop)
      } catch (error) {
        console.error('Error fetching drop:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCurrentDrop()
  }, [])

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 border-2 border-club-gold border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-club-cream/50 text-sm tracking-widest">LOADING</div>
        </motion.div>
      </section>
    )
  }

  if (!drop) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-4xl w-full text-center">
          <div className="text-club-gold text-sm tracking-widest mb-6">NO CURRENT DROP</div>
          <h2 className="text-6xl md:text-7xl font-serif mb-6">Coming Soon</h2>
          <p className="text-xl md:text-2xl leading-relaxed text-club-cream/90">
            The next chapter is being designed. Check back soon.
          </p>
        </div>
      </section>
    )
  }

  const handleRequestAccess = () => {
    // Check if user already validated a code in this session
    const storedCode = localStorage.getItem('club25_invite_code')
    
    if (storedCode) {
      // Code already validated, go straight to RSVP
      setValidatedCode(storedCode)
      setShowRSVPModal(true)
    } else {
      // No code yet, show invite modal
      setShowInviteModal(true)
    }
  }

  const handleCodeValidated = (code: string) => {
    setValidatedCode(code)
    setShowInviteModal(false)
    setShowRSVPModal(true)
  }

  const currentChapter = {
    slug: drop.slug,
    title: drop.title,
    date: new Date(drop.date_time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
    description: drop.description,
    seatsRemaining: drop.seatsRemaining,
    totalSeats: drop.totalSeats,
    status: drop.status
  }

  return (
    <>
      <section id="current-chapter" className="relative min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Label */}
            <div className="text-club-gold text-sm tracking-widest mb-6">
              CURRENT DROP
            </div>

            {/* Title */}
            <h2 className="text-6xl md:text-7xl font-serif mb-6">
              {currentChapter.title}
            </h2>

            {/* Date */}
            <div className="text-2xl text-club-cream/70 mb-8">
              {currentChapter.date}
            </div>

            {/* Description */}
            <p className="text-xl md:text-2xl leading-relaxed mb-12 text-club-cream/90 max-w-3xl">
              {currentChapter.description}
            </p>

            {/* Seats info */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex gap-1">
                {Array.from({ length: currentChapter.totalSeats }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 ${
                      i < currentChapter.totalSeats - currentChapter.seatsRemaining
                        ? 'bg-club-lilac'
                        : 'bg-club-cream/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-club-cream/70">
                {currentChapter.seatsRemaining} seats remaining
              </span>
            </div>

            {/* RSVP Button */}
            <motion.button
              onClick={handleRequestAccess}
              className={`px-12 py-4 relative overflow-hidden group ${
                currentChapter.status === 'sold_out' 
                  ? 'bg-club-charcoal/50 text-club-cream/50 border border-club-cream/20' 
                  : 'bg-club-cream text-club-blue border-2 border-club-cream'
              } transition-all duration-300 text-lg font-semibold tracking-wider`}
              whileHover={currentChapter.status !== 'sold_out' ? { scale: 1.02, backgroundColor: '#C7A977', color: '#1E1E1E' } : {}}
              whileTap={currentChapter.status !== 'sold_out' ? { scale: 0.98 } : {}}
            >
              <span className="relative z-10">
                {currentChapter.status === 'sold_out' ? 'JOIN WAITLIST' : 'RESERVE YOUR SEAT'}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <InviteCodeModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        onCodeValidated={handleCodeValidated}
      />

      <RSVPModal 
        isOpen={showRSVPModal} 
        onClose={() => setShowRSVPModal(false)} 
        dropSlug={currentChapter.slug}
        chapterTitle={currentChapter.title}
        inviteCode={validatedCode}
      />
    </>
  )
}
