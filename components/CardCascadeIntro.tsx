'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'

interface CardCascadeIntroProps {
  setAudioStarted: (started: boolean) => void
  onComplete: () => void
}

export default function CardCascadeIntro({ setAudioStarted, onComplete }: CardCascadeIntroProps) {
  const [started, setStarted] = useState(false)

  const handleEnter = () => {
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
      
      {/* Animated glow */}
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

            {/* Tagline */}
            <motion.p
              className="text-base sm:text-lg md:text-2xl text-club-cream/80 mb-12 leading-relaxed px-4 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              every two weeks, a new story unfolds behind one door.
            </motion.p>

            {/* Enter button */}
            <motion.button
              onClick={handleEnter}
              className="px-10 sm:px-12 py-3 sm:py-4 min-h-[56px] border-2 border-club-cream text-club-cream hover:bg-club-cream hover:text-club-blue transition-all duration-300 text-base md:text-lg tracking-wider active:scale-95 touch-manipulation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              whileTap={{ scale: 0.95 }}
            >
              ENTER
            </motion.button>
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
          onClick={handleEnter}
          className="absolute bottom-8 right-8 text-club-cream/50 hover:text-club-cream text-sm tracking-wider transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          SKIP →
        </motion.button>
      )}
    </motion.section>
  )
}
