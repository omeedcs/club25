'use client'

import { useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  audioStarted: boolean
  setAudioStarted: (started: boolean) => void
}

export default function AudioPlayer({ audioStarted, setAudioStarted }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioStarted && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('Audio autoplay prevented:', err)
      })
    }
  }, [audioStarted])

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play()
        setAudioStarted(true)
      } else {
        audioRef.current.pause()
        setAudioStarted(false)
      }
    }
  }

  return (
    <>
      {/* Audio element - Club25 ambient track */}
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        className="hidden"
      >
        <source src="/audio/ambient.mp3" type="audio/mpeg" />
      </audio>

      {/* Audio control button */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-8 right-8 z-50 bg-club-lilac/20 backdrop-blur-sm p-4 rounded-full border border-club-lilac/30 hover:bg-club-lilac/30 transition-all duration-300"
        aria-label="Toggle audio"
      >
        {audioStarted ? (
          <Volume2 className="w-5 h-5 text-club-cream" />
        ) : (
          <VolumeX className="w-5 h-5 text-club-cream" />
        )}
      </button>
    </>
  )
}
