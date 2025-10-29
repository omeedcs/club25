'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { Camera, CheckCircle, XCircle, User } from 'lucide-react'
import Image from 'next/image'
import jsQR from 'jsqr'

export default function CheckInPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  async function startScanning() {
    setScanning(true)
    setResult(null)
    setError('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scanQRCode()
      }
    } catch (err) {
      setError('Camera access denied')
      setScanning(false)
    }
  }

  function stopScanning() {
    setScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  function scanQRCode() {
    if (!scanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      if (imageData) {
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          handleQRCode(code.data)
          return
        }
      }
    }

    requestAnimationFrame(scanQRCode)
  }

  async function handleQRCode(data: string) {
    stopScanning()

    try {
      const parsed = JSON.parse(data)
      
      // Validate QR code format
      if (parsed.type !== 'club25-checkin' || !parsed.confirmationCode || !parsed.userId || !parsed.dropId) {
        setError('Invalid QR code format')
        return
      }

      // Verify RSVP exists and is confirmed
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('id', parsed.rsvpId)
        .eq('confirmation_code', parsed.confirmationCode)
        .eq('user_id', parsed.userId)
        .eq('drop_id', parsed.dropId)
        .single()

      if (rsvpError || !rsvpData) {
        console.error('RSVP lookup error:', rsvpError)
        setError('RSVP not found or invalid')
        return
      }

      if (rsvpData.status !== 'confirmed') {
        setError(`Cannot check in: Status is ${rsvpData.status}`)
        return
      }

      // Get guest and drop details
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', parsed.userId)
        .single()

      const { data: dropData } = await supabase
        .from('drops')
        .select('*')
        .eq('id', parsed.dropId)
        .single()

      // Create or update checkin record
      const { data: checkinData, error: checkinError } = await supabase
        .from('checkins')
        .upsert({
          user_id: parsed.userId,
          drop_id: parsed.dropId,
          checked_in_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,drop_id'
        })
        .select()
        .single()

      if (checkinError) {
        console.error('Checkin error:', checkinError)
        // Still show success even if checkin record fails
      }

      setResult({
        success: true,
        guest: profileData,
        drop: dropData,
        code: parsed.confirmationCode
      })

    } catch (err: any) {
      console.error('QR scan error:', err)
      setError(err.message || 'Invalid QR code')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue text-club-cream">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Image src="/logo.png" alt="Club25" width={80} height={80} className="mx-auto mb-6" />
          <h1 className="text-5xl font-serif mb-2">Check-In</h1>
          <p className="text-club-cream/70">Scan guest QR codes</p>
        </div>

        {/* Scanner */}
        {!result && (
          <motion.div
            className="bg-club-charcoal/50 border border-club-cream/10 p-8 backdrop-blur-sm text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {!scanning ? (
              <button
                onClick={startScanning}
                className="w-full py-6 bg-club-gold text-club-charcoal hover:bg-club-gold/90 transition-colors text-lg tracking-wider font-semibold flex items-center justify-center gap-3"
              >
                <Camera className="w-6 h-6" />
                START SCANNING
              </button>
            ) : (
              <div>
                <div className="relative mb-4 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover bg-black"
                    playsInline
                  />
                  <div className="absolute inset-0 border-4 border-club-gold/50 pointer-events-none" />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <button
                  onClick={stopScanning}
                  className="px-8 py-3 border border-club-cream/30 text-club-cream hover:bg-club-cream/10 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="bg-club-charcoal/50 border border-club-cream/10 p-8 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {result.success ? (
                <div className="text-center">
                  <CheckCircle className="w-20 h-20 text-club-gold mx-auto mb-6" />
                  <h2 className="text-4xl font-serif mb-4">Welcome!</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="text-sm text-club-cream/50 mb-1">GUEST</div>
                      <div className="text-2xl font-semibold">{result.guest?.name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-club-cream/50 mb-1">EVENT</div>
                      <div className="text-xl">{result.drop?.title}</div>
                    </div>

                    <div>
                      <div className="text-sm text-club-cream/50 mb-1">CONFIRMATION</div>
                      <div className="text-lg font-mono text-club-gold">{result.code}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setResult(null)
                      setError('')
                    }}
                    className="px-8 py-3 bg-club-blue text-club-cream hover:bg-club-lilac transition-colors"
                  >
                    SCAN NEXT GUEST
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-serif mb-4">Invalid Code</h2>
                  <p className="text-club-cream/70 mb-8">This QR code is not valid.</p>
                  <button
                    onClick={() => {
                      setResult(null)
                      setError('')
                    }}
                    className="px-8 py-3 border border-club-cream/30 text-club-cream hover:bg-club-cream/10 transition-colors"
                  >
                    TRY AGAIN
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
