'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import InviteCodeModal from './InviteCodeModal'

interface CardCascadeIntroProps {
  setAudioStarted: (started: boolean) => void
  onComplete: () => void
}

export default function CardCascadeIntro({ setAudioStarted, onComplete }: CardCascadeIntroProps) {
  const [started, setStarted] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const handleRequestAccess = () => {
    setShowInviteModal(true)
  }

  const handleCodeValidated = (code: string) => {
    setShowInviteModal(false)
    setStarted(true)
    setAudioStarted(true)
    
    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12)
    }
    
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: started ? 0 : 1 }}
      transition={{ duration: 1, delay: started ? 1 : 0 }}
      style={{ pointerEvents: started ? 'none' : 'auto' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue" />
      
      {/* Animated glows */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-club-lilac/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 md:w-72 md:h-72 bg-club-gold/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Floating particles */}
      {!started && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-club-gold/40 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          ))}
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl">
        {!started ? (
          <>
            {/* Logo */}
            <motion.div
              className="flex justify-center mb-8 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <Image
                src="/logo.png"
                alt="Club25"
                width={300}
                height={300}
                className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 relative z-10"
                priority
              />
            </motion.div>

            {/* Exclusive badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-club-gold/30 bg-club-gold/5 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-club-gold animate-pulse" />
              <span className="text-xs tracking-[0.2em] text-club-gold uppercase">Invitation Only</span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-base sm:text-lg md:text-2xl text-club-cream/90 mb-3 leading-relaxed px-4 max-w-2xl mx-auto font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              You&apos;ve discovered something rare.
            </motion.p>
            
            <motion.p
              className="text-sm sm:text-base md:text-lg text-club-cream/60 mb-12 leading-relaxed px-4 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              An intimate supper club. 25 seats. One secret location.
              <br className="hidden sm:block" />
              Every two weeks, a new chapter unfolds.
            </motion.p>

            {/* Enter button */}
            <motion.button
              onClick={handleRequestAccess}
              className="group relative px-10 sm:px-12 py-3 sm:py-4 min-h-[56px] border-2 border-club-cream text-club-cream hover:bg-club-cream hover:text-club-blue transition-all duration-300 text-base md:text-lg tracking-[0.15em] active:scale-95 touch-manipulation overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">REQUEST ACCESS</span>
              <motion.div
                className="absolute inset-0 bg-club-gold/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            {/* Subtle hint */}
            <motion.p
              className="text-xs text-club-cream/40 mt-6 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              Dallas, TX
            </motion.p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Sound wave visualization */}
            <div className="flex justify-center gap-1.5 mb-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-club-gold rounded-full"
                  animate={{
                    height: [16, 32, 16, 24, 16],
                    opacity: [0.5, 1, 0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  style={{ height: 16 }}
                />
              ))}
            </div>
            
            <div className="text-xs sm:text-sm tracking-widest text-club-gold mb-4">CURRENT DROP</div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-club-cream">
              Tokyo Midnight
            </h2>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator after enter */}
      {started && (
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-6 h-10 border-2 border-club-cream/50 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-2 bg-club-cream rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}

      {/* Skip button */}
      {!started && (
        <motion.button
          onClick={handleRequestAccess}
          className="absolute bottom-8 right-8 text-club-cream/50 hover:text-club-cream text-sm tracking-wider transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          SKIP →
        </motion.button>
      )}

      {/* Invite Code Modal */}
      <InviteCodeModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        onCodeValidated={handleCodeValidated}
      />
    </motion.section>
  )
}
