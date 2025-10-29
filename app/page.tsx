'use client'

import { useState } from 'react'
import CardCascadeIntro from '@/components/CardCascadeIntro'
import CurrentChapter from '@/components/CurrentChapter'
import Concept from '@/components/Concept'
import Archive from '@/components/Archive'
import Footer from '@/components/Footer'
import AudioPlayer from '@/components/AudioPlayer'
import { motion } from 'framer-motion'

export default function Home() {
  const [audioStarted, setAudioStarted] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <main className="relative min-h-screen bg-club-blue text-club-cream overflow-hidden">
      <AudioPlayer audioStarted={audioStarted} setAudioStarted={setAudioStarted} />
      
      {/* Subtle radial gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(74, 62, 142, 0.15), transparent 60%), radial-gradient(circle at 0% 100%, rgba(0, 71, 187, 0.3), transparent 50%)',
          }}
        />
      </div>

      {/* Subtle film grain texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'2\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundSize: '150px 150px',
        }}
      />

      {/* Card cascade entrance animation */}
      {!introComplete && (
        <CardCascadeIntro 
          setAudioStarted={setAudioStarted}
          onComplete={() => setIntroComplete(true)}
        />
      )}
      
      {/* Main content */}
      <CurrentChapter />
      <Concept />
      <Archive />
      <Footer />
    </main>
  )
}
