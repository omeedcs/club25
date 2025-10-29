'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface IntroProps {
  setAudioStarted: (started: boolean) => void
}

export default function Intro({ setAudioStarted }: IntroProps) {
  const [showFirst, setShowFirst] = useState(false)
  const [showSecond, setShowSecond] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [started, setStarted] = useState(false)

  const handleEnter = () => {
    setStarted(true)
    setAudioStarted(true)
    // Smooth scroll to next section
    setTimeout(() => {
      document.getElementById('current-chapter')?.scrollIntoView({ behavior: 'smooth' })
    }, 500)
  }

  useEffect(() => {
    const timer1 = setTimeout(() => setShowFirst(true), 500)
    const timer2 = setTimeout(() => setShowSecond(true), 2000)
    const timer3 = setTimeout(() => setShowButton(true), 3500)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-club-blue via-club-lilac to-club-blue opacity-90" />
      
      {/* Animated background shapes */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-club-lilac rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-club-blue rounded-full blur-3xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Main title */}
        <motion.h1
          className="text-8xl md:text-9xl font-serif mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: showFirst ? 1 : 0 }}
          transition={{ duration: 1.5 }}
        >
          club25
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl md:text-2xl font-light mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: showSecond ? 1 : 0 }}
          transition={{ duration: 1.5 }}
        >
          every two weeks, a new story unfolds behind one door.
        </motion.p>

        {/* Enter button */}
        <motion.button
          onClick={handleEnter}
          className="px-12 py-4 border border-club-cream text-club-cream hover:bg-club-cream hover:text-club-blue transition-all duration-300 text-lg tracking-wider"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 20 }}
          transition={{ duration: 0.8 }}
        >
          ENTER
        </motion.button>
      </div>

      {/* Scroll indicator */}
      {started && (
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="w-6 h-10 border-2 border-club-cream rounded-full flex justify-center">
            <motion.div
              className="w-1 h-2 bg-club-cream rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </section>
  )
}
