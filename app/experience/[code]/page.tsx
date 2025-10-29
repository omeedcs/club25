'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { Sparkles, Users, MessageCircle, Music, Camera, Heart, Send, ChefHat, Zap, Image as ImageIcon, Wifi, Trophy, Target, Vote, MapPin, TrendingUp, PartyPopper, Gamepad2, Link2, Upload, ThumbsUp, Play, X, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

type Game = 'two-truths' | 'rapid-fire' | 'would-rather' | 'hot-seat' | null
type Challenge = { id: string; text: string; points: number; completed: boolean }
type ViewType = 'home' | 'connect' | 'games' | 'album' | 'challenges'

export default function ExperiencePage({ params }: { params: { code: string } }) {
  // Core data
  const [guest, setGuest] = useState<any>(null)
  const [drop, setDrop] = useState<any>(null)
  const [rsvp, setRsvp] = useState<any>(null)
  const [otherGuests, setOtherGuests] = useState<any[]>([])
  const [activeGuests, setActiveGuests] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<'arrival' | 'appetizer' | 'main' | 'dessert'>('arrival')
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Interactive features
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [connections, setConnections] = useState<Set<string>>(new Set())
  const [nearbyGuests, setNearbyGuests] = useState<Set<string>>(new Set())
  const [activeGame, setActiveGame] = useState<Game>(null)
  const [gameData, setGameData] = useState<any>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', text: 'Find someone who traveled from another city', points: 50, completed: false },
    { id: '2', text: 'Auto-connect with 3 nearby guests', points: 100, completed: false },
    { id: '3', text: 'Capture a BeReal moment', points: 75, completed: false },
    { id: '4', text: 'Win a game round', points: 150, completed: false },
    { id: '5', text: 'React with 3 RealMojis', points: 200, completed: false },
  ])
  const [points, setPoints] = useState(0)
  const [groupEnergy, setGroupEnergy] = useState(65)
  const [photoPrompt, setPhotoPrompt] = useState<{text: string, expiresAt: Date} | null>(null)
  const [hasPostedToday, setHasPostedToday] = useState(false)
  const [capturingBeReal, setCapturingBeReal] = useState(false)
  const [photoLikes, setPhotoLikes] = useState<Record<string, number>>({})
  const [realMojis, setRealMojis] = useState<Record<string, string[]>>({})
  const frontCameraRef = useRef<HTMLVideoElement>(null)
  const backCameraRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadExperience()
    subscribeToUpdates()
    
    // Simulate dynamic group energy
    const energyInterval = setInterval(() => {
      setGroupEnergy(prev => Math.min(100, Math.max(20, prev + (Math.random() - 0.5) * 10)))
    }, 5000)
    
    // Send photo prompts at random intervals during event
    const promptInterval = setInterval(() => {
      if (Math.random() > 0.7 && !photoPrompt) {
        const prompts = [
          "Time to BeReal - capture this moment! 📸",
          "What's happening right now? Show us! ⚡",
          "Moment check! Snap what you're doing 🎯",
          "The vibe right now... capture it! ✨"
        ]
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
        setPhotoPrompt({
          text: prompts[Math.floor(Math.random() * prompts.length)],
          expiresAt
        })
      }
    }, 15 * 60 * 1000) // Check every 15 minutes
    
    return () => {
      clearInterval(energyInterval)
      clearInterval(promptInterval)
    }
  }, [params.code])

  // Start proximity detection after guests are loaded
  useEffect(() => {
    if (otherGuests.length > 0) {
      startProximityDetection()
    }
  }, [otherGuests])

  async function loadExperience() {
    try {
      const { data: rsvpData } = await supabase
        .from('rsvps')
        .select('*, drops(*)')
        .eq('confirmation_code', params.code)
        .maybeSingle()

      if (!rsvpData) return

      setRsvp(rsvpData)
      setDrop(rsvpData.drops)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', rsvpData.user_id)
        .maybeSingle()
      
      setGuest(profileData)

      await supabase
        .from('guest_presence')
        .upsert({
          user_id: rsvpData.user_id,
          drop_id: rsvpData.drop_id,
          last_seen_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_id,drop_id'
        })

      const { data: phaseData } = await supabase
        .from('drop_phases')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .maybeSingle()
      
      if (phaseData) setPhase(phaseData.current_phase)

      const { data: guestsData } = await supabase
        .from('rsvps')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .eq('status', 'confirmed')
        .neq('user_id', rsvpData.user_id)

      if (guestsData && guestsData.length > 0) {
        const userIds = guestsData.map(g => g.user_id)
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)
        
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]))
        const guestsWithProfiles = guestsData.map(g => ({
          ...g,
          profiles: profilesMap.get(g.user_id)
        }))
        setOtherGuests(guestsWithProfiles)
      }

      const { data: presenceData } = await supabase
        .from('guest_presence')
        .select('user_id')
        .eq('drop_id', rsvpData.drop_id)
        .eq('is_active', true)
        .gte('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      
      setActiveGuests(new Set(presenceData?.map(p => p.user_id) || []))

      const { data: photosData } = await supabase
        .from('media')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .eq('type', 'photo')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(50)
      
      setPhotos(photosData || [])

    } catch (error) {
      console.error('Error loading experience:', error)
    } finally {
      setLoading(false)
    }
  }

  function subscribeToUpdates() {
    if (!rsvp) return

    const phaseChannel = supabase
      .channel('drop_phases')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'drop_phases',
        filter: `drop_id=eq.${rsvp.drop_id}`
      }, (payload) => {
        setPhase(payload.new.current_phase)
      })
      .subscribe()

    const photosChannel = supabase
      .channel('media')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'media',
        filter: `drop_id=eq.${rsvp.drop_id}`
      }, (payload) => {
        if (payload.new.approved) {
          setPhotos(prev => [payload.new, ...prev])
        }
      })
      .subscribe()

    const presenceChannel = supabase
      .channel('guest_presence')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'guest_presence',
        filter: `drop_id=eq.${rsvp.drop_id}`
      }, (payload: any) => {
        if (payload.new.is_active) {
          setActiveGuests(prev => new Set([...Array.from(prev), payload.new.user_id]))
        } else {
          setActiveGuests(prev => {
            const newSet = new Set(Array.from(prev))
            newSet.delete(payload.new.user_id)
            return newSet
          })
        }
      })
      .subscribe()

    return () => {
      phaseChannel.unsubscribe()
      photosChannel.unsubscribe()
      presenceChannel.unsubscribe()
    }
  }

  // Bluetooth proximity detection
  async function startProximityDetection() {
    // In a real implementation, this would use Web Bluetooth API or
    // a custom proximity service. For now, simulate with random nearby detection
    setInterval(() => {
      if (otherGuests.length > 0) {
        // Simulate 2-3 random guests being nearby
        const nearby = otherGuests
          .slice(0, 3)
          .filter(() => Math.random() > 0.5)
          .map(g => g.user_id)
        
        setNearbyGuests(new Set(nearby))
        
        // Auto-connect with nearby guests
        nearby.forEach(guestId => {
          if (!connections.has(guestId)) {
            setConnections(prev => new Set([...Array.from(prev), guestId]))
            addPoints(100)
            
            // Show notification
            console.log('Auto-connected with nearby guest!')
          }
        })
        
        if (connections.size >= 3) completeChallenge('2')
      }
    }, 10000) // Check every 10 seconds
  }

  // BeReal-style dual camera capture
  async function captureBeReal() {
    setCapturingBeReal(true)
    setCurrentView('album')
    
    try {
      // Request both cameras
      const frontStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      const backStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (frontCameraRef.current) frontCameraRef.current.srcObject = frontStream
      if (backCameraRef.current) backCameraRef.current.srcObject = backStream
    } catch (error) {
      console.error('Camera access denied:', error)
      alert('Please enable camera access to capture BeReal moments')
      setCapturingBeReal(false)
    }
  }

  async function takeDualPhoto() {
    if (!frontCameraRef.current || !backCameraRef.current || !rsvp) return
    
    // Capture both camera frames
    const frontCanvas = document.createElement('canvas')
    const backCanvas = document.createElement('canvas')
    
    frontCanvas.width = frontCameraRef.current.videoWidth
    frontCanvas.height = frontCameraRef.current.videoHeight
    backCanvas.width = backCameraRef.current.videoWidth
    backCanvas.height = backCameraRef.current.videoHeight
    
    frontCanvas.getContext('2d')?.drawImage(frontCameraRef.current, 0, 0)
    backCanvas.getContext('2d')?.drawImage(backCameraRef.current, 0, 0)
    
    // In production, upload to storage and save URLs
    const frontUrl = frontCanvas.toDataURL('image/jpeg')
    const backUrl = backCanvas.toDataURL('image/jpeg')
    
    const isLate = photoPrompt && new Date() > photoPrompt.expiresAt
    
    await supabase.from('media').insert({
      drop_id: rsvp.drop_id,
      user_id: rsvp.user_id,
      url: backUrl,
      type: 'photo',
      approved: true,
      caption: JSON.stringify({
        frontCamera: frontUrl,
        prompt: photoPrompt?.text,
        postedAt: new Date().toISOString(),
        late: isLate
      })
    })
    
    setHasPostedToday(true)
    setPhotoPrompt(null)
    setCapturingBeReal(false)
    completeChallenge('3')
    addPoints(isLate ? 50 : 75)
    
    // Stop camera streams
    ;[frontCameraRef, backCameraRef].forEach(ref => {
      const stream = ref.current?.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
    })
  }

  // RealMoji reactions - capture your face reacting
  async function captureRealMoji(photoId: string) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      
      const reactionUrl = canvas.toDataURL('image/jpeg')
      
      setRealMojis(prev => ({
        ...prev,
        [photoId]: [...(prev[photoId] || []), reactionUrl]
      }))
      
      stream.getTracks().forEach(track => track.stop())
      
      // Track for challenge
      const totalReactions = Object.values(realMojis).flat().length + 1
      if (totalReactions >= 3) completeChallenge('5')
      
      addPoints(25)
    } catch (error) {
      console.error('Camera access denied:', error)
    }
  }

  // Start a game
  function startGame(gameType: Game) {
    setActiveGame(gameType)
    if (gameType === 'two-truths') {
      setGameData({ statements: ['', '', ''], lie: 0, phase: 'input' })
    } else if (gameType === 'rapid-fire') {
      setGameData({
        questions: [
          "What's your hidden talent?",
          'Last show you binged?',
          'Dream dinner guest (dead or alive)?',
          'Superpower of choice?',
          "Best trip you've ever taken?"
        ],
        currentQuestion: 0,
        timer: 30,
        answers: []
      })
    } else if (gameType === 'would-rather') {
      setGameData({
        question: 'Would you rather have the ability to fly or be invisible?',
        options: ['Fly', 'Be invisible'],
        votes: { option1: 0, option2: 0 },
        voted: false
      })
    }
  }

  function addPoints(amount: number) {
    setPoints(prev => prev + amount)
  }

  function completeChallenge(id: string) {
    setChallenges(prev => prev.map(c => 
      c.id === id && !c.completed ? { ...c, completed: true } : c
    ))
    const challenge = challenges.find(c => c.id === id)
    if (challenge && !challenge.completed) {
      addPoints(challenge.points)
    }
  }

  function likePhoto(photoId: string) {
    setPhotoLikes(prev => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1
    }))
  }

  const connectedGuests = otherGuests.filter(g => connections.has(g.user_id))
  const completedChallengesCount = challenges.filter(c => c.completed).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue">
        <motion.div
          className="w-12 h-12 border-2 border-club-gold border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-club-blue text-club-cream">
      <div className="fixed inset-0 bg-gradient-to-br from-club-blue via-club-lilac/10 to-club-blue pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-4 py-4 border-b border-club-cream/10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif">{drop?.title}</h1>
            <p className="text-xs text-club-cream/60">{guest?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-club-gold/60">POINTS</div>
              <div className="text-xl font-bold text-club-gold">{points}</div>
            </div>
            <div className="w-10 h-10 bg-club-gold/20 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-club-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {currentView === 'home' && (
          <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
            {/* BeReal Photo Prompt */}
            {photoPrompt && !hasPostedToday && (
              <motion.div
                className="bg-gradient-to-r from-club-gold/30 to-club-lilac/30 border-2 border-club-gold p-4 rounded-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-club-gold animate-pulse" />
                    <span className="font-semibold text-club-gold">Time to BeReal!</span>
                  </div>
                  <span className="text-xs text-club-cream/70">
                    {Math.max(0, Math.floor((photoPrompt.expiresAt.getTime() - Date.now()) / 1000 / 60))}m left
                  </span>
                </div>
                <p className="text-sm mb-3">{photoPrompt.text}</p>
                <button
                  onClick={captureBeReal}
                  className="w-full bg-club-gold text-club-charcoal py-2 rounded-lg font-semibold hover:bg-club-gold/80"
                >
                  Capture Now
                </button>
              </motion.div>
            )}

            {/* Energy Meter */}
            <motion.div className="bg-club-charcoal/40 border border-club-cream/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className={`w-5 h-5 ${groupEnergy > 70 ? 'text-club-gold animate-pulse' : 'text-club-cream/60'}`} />
                  <span className="text-sm font-semibold">Group Energy</span>
                </div>
                <span className="text-lg font-bold text-club-gold">{Math.round(groupEnergy)}%</span>
              </div>
              <div className="w-full bg-club-blue/50 rounded-full h-2">
                <motion.div 
                  className="h-full bg-gradient-to-r from-club-lilac to-club-gold rounded-full"
                  animate={{ width: `${groupEnergy}%` }}
                />
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCurrentView('connect')} className="bg-gradient-to-br from-club-lilac/30 to-club-lilac/10 border-2 border-club-lilac/50 p-6 rounded-xl">
                <Wifi className="w-8 h-8 text-club-lilac mb-2 animate-pulse" />
                <h3 className="font-semibold mb-1">Proximity Map</h3>
                <p className="text-xs text-club-cream/60">{nearbyGuests.size} nearby</p>
              </button>
              <button onClick={() => setCurrentView('games')} className="bg-gradient-to-br from-club-gold/30 to-club-gold/10 border-2 border-club-gold/50 p-6 rounded-xl">
                <Gamepad2 className="w-8 h-8 text-club-gold mb-2" />
                <h3 className="font-semibold mb-1">Play Games</h3>
                <p className="text-xs text-club-cream/60">Icebreakers</p>
              </button>
              <button onClick={() => setCurrentView('album')} className="bg-gradient-to-br from-club-cream/20 to-club-cream/5 border-2 border-club-cream/30 p-6 rounded-xl">
                <Camera className="w-8 h-8 text-club-cream mb-2" />
                <h3 className="font-semibold mb-1">BeReal Moments</h3>
                <p className="text-xs text-club-cream/60">{photos.length} posted</p>
              </button>
              <button onClick={() => setCurrentView('challenges')} className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/40 p-6 rounded-xl">
                <Trophy className="w-8 h-8 text-green-400 mb-2" />
                <h3 className="font-semibold mb-1">Challenges</h3>
                <p className="text-xs text-club-cream/60">{completedChallengesCount}/{challenges.length}</p>
              </button>
            </div>

            {/* Who's Here */}
            <motion.div className="bg-club-charcoal/40 border border-club-cream/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Who's Here
                </h3>
                <span className="text-xs text-green-400">{activeGuests.size + 1} active</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {otherGuests.slice(0, 8).map((g) => {
                  const isActive = activeGuests.has(g.user_id)
                  const isConnected = connections.has(g.user_id)
                  return (
                    <div key={g.id} className="relative">
                      <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg font-semibold ${
                        isConnected ? 'bg-club-lilac/30 border-2 border-club-lilac' : 'bg-club-charcoal/50'
                      }`}>
                        {g.profiles?.name?.[0] || '?'}
                      </div>
                      {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-club-blue" />}
                      {isConnected && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-club-lilac rounded-full flex items-center justify-center">
                        <Link2 className="w-2 h-2 text-club-blue" />
                      </div>}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}

        {currentView === 'connect' && (
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif">Proximity Map</h2>
              <button onClick={() => setCurrentView('home')} className="text-club-cream/60 hover:text-club-cream">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-club-lilac/10 border border-club-lilac/30 p-4 rounded-lg mb-6 text-center text-sm">
              <Wifi className="w-5 h-5 inline mr-2 text-club-lilac animate-pulse" />
              Bluetooth proximity detection active - auto-connecting with nearby guests!
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-club-gold mb-3">Nearby Right Now ({nearbyGuests.size})</h3>
              <div className="space-y-2">
                {Array.from(nearbyGuests).map((guestId) => {
                  const guest = otherGuests.find(g => g.user_id === guestId)
                  if (!guest) return null
                  const isConnected = connections.has(guestId)
                  return (
                    <motion.div
                      key={guestId}
                      className="bg-club-gold/20 border-2 border-club-gold/60 p-3 rounded-lg flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-club-charcoal/50 rounded-full flex items-center justify-center">
                            {guest.profiles?.name?.[0] || '?'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-club-gold rounded-full border-2 border-club-blue animate-pulse" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">{guest.profiles?.name || 'Guest'}</div>
                          <div className="text-xs text-club-gold">Within 10ft</div>
                        </div>
                      </div>
                      {isConnected && <CheckCircle2 className="w-5 h-5 text-club-gold" />}
                      {!isConnected && <div className="text-xs text-club-gold animate-pulse">Connecting...</div>}
                    </motion.div>
                  )
                })}
                {nearbyGuests.size === 0 && (
                  <div className="text-center py-8 text-club-cream/50 text-sm">
                    No guests nearby at the moment. Walk around to discover connections!
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-club-lilac mb-3">All Connections ({connections.size})</h3>
              <div className="grid grid-cols-3 gap-2">
                {Array.from(connections).map((guestId) => {
                  const guest = otherGuests.find(g => g.user_id === guestId)
                  if (!guest) return null
                  return (
                    <div key={guestId} className="bg-club-lilac/20 border border-club-lilac/40 p-3 rounded-lg text-center">
                      <div className="w-12 h-12 bg-club-charcoal/50 rounded-full flex items-center justify-center mx-auto mb-2">
                        {guest.profiles?.name?.[0] || '?'}
                      </div>
                      <div className="text-xs font-medium truncate">{guest.profiles?.name?.split(' ')[0]}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {currentView === 'games' && (
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif">Play Games</h2>
              <button onClick={() => { setCurrentView('home'); setActiveGame(null) }} className="text-club-cream/60 hover:text-club-cream">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <button onClick={() => startGame('two-truths')} className="w-full bg-gradient-to-r from-club-lilac/20 to-club-gold/20 border border-club-gold/30 p-6 rounded-xl text-left">
                <h3 className="font-semibold text-lg mb-2">Two Truths & a Lie</h3>
                <p className="text-sm text-club-cream/70">Share 3 statements, guess the lie</p>
              </button>
              <button onClick={() => startGame('rapid-fire')} className="w-full bg-gradient-to-r from-club-gold/20 to-club-lilac/20 border border-club-lilac/30 p-6 rounded-xl text-left">
                <h3 className="font-semibold text-lg mb-2">Rapid Fire Questions</h3>
                <p className="text-sm text-club-cream/70">Quick-fire 30-second answers</p>
              </button>
              <button onClick={() => startGame('would-rather')} className="w-full bg-gradient-to-r from-green-500/20 to-club-gold/20 border border-green-500/30 p-6 rounded-xl text-left">
                <h3 className="font-semibold text-lg mb-2">Would You Rather</h3>
                <p className="text-sm text-club-cream/70">Group voting on dilemmas</p>
              </button>
            </div>
          </div>
        )}

        {currentView === 'album' && (
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif">BeReal Moments</h2>
              <button onClick={() => setCurrentView('home')} className="text-club-cream/60 hover:text-club-cream">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dual Camera Capture Interface */}
            {capturingBeReal && (
              <div className="mb-6 bg-club-charcoal/60 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-center text-club-gold">Capturing BeReal...</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="text-xs text-club-cream/70 mb-1">Back Camera</div>
                    <video ref={backCameraRef} autoPlay playsInline className="w-full aspect-square bg-black rounded-lg object-cover" />
                  </div>
                  <div className="relative">
                    <div className="text-xs text-club-cream/70 mb-1">Front Camera (You)</div>
                    <video ref={frontCameraRef} autoPlay playsInline className="w-full aspect-square bg-black rounded-lg object-cover" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={takeDualPhoto}
                    className="flex-1 bg-club-gold text-club-charcoal py-3 rounded-lg font-semibold"
                  >
                    <Camera className="w-5 h-5 inline mr-2" />
                    Capture Both
                  </button>
                  <button
                    onClick={() => {
                      setCapturingBeReal(false)
                      ;[frontCameraRef, backCameraRef].forEach(ref => {
                        const stream = ref.current?.srcObject as MediaStream
                        stream?.getTracks().forEach(track => track.stop())
                      })
                    }}
                    className="px-4 bg-club-charcoal/50 text-club-cream border border-club-cream/20 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!capturingBeReal && (
              <button
                onClick={captureBeReal}
                className="w-full bg-club-gold/20 border-2 border-club-gold/50 p-4 rounded-lg flex items-center justify-center gap-2 mb-6 hover:bg-club-gold/30"
              >
                <Camera className="w-5 h-5" />
                <span className="font-semibold">Capture BeReal Moment</span>
              </button>
            )}

            {/* Photo Grid */}
            <div className="space-y-4">
              {photos.map((photo) => {
                const metadata = photo.caption ? JSON.parse(photo.caption) : {}
                const canView = hasPostedToday // Can't see others' photos until you post
                return (
                  <div key={photo.id} className="bg-club-charcoal/40 border border-club-cream/20 rounded-lg overflow-hidden">
                    <div className="relative aspect-square">
                      <img 
                        src={photo.url} 
                        alt="Moment" 
                        className={`w-full h-full object-cover ${!canView ? 'blur-lg' : ''}`} 
                      />
                      {/* Front camera overlay */}
                      {metadata.frontCamera && canView && (
                        <div className="absolute top-2 left-2 w-20 h-20 rounded-lg overflow-hidden border-2 border-club-cream shadow-lg">
                          <img src={metadata.frontCamera} alt="Selfie" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {metadata.late && canView && (
                        <div className="absolute top-2 right-2 bg-club-charcoal/80 px-2 py-1 rounded-full text-xs text-club-cream/70">
                          Late ⏰
                        </div>
                      )}
                      {!canView && (
                        <div className="absolute inset-0 flex items-center justify-center bg-club-blue/80">
                          <div className="text-center">
                            <Camera className="w-8 h-8 mx-auto mb-2 text-club-gold" />
                            <p className="text-sm">Post your BeReal to view</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {canView && (
                      <div className="p-3">
                        {metadata.prompt && (
                          <div className="text-xs text-club-gold mb-2">"{metadata.prompt}"</div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => captureRealMoji(photo.id)}
                            className="bg-club-lilac/20 px-3 py-1 rounded-full text-xs hover:bg-club-lilac/30"
                          >
                            + RealMoji
                          </button>
                          {realMojis[photo.id]?.slice(0, 3).map((emoji, idx) => (
                            <div key={idx} className="w-6 h-6 rounded-full overflow-hidden border border-club-cream/30">
                              <img src={emoji} alt="Reaction" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {(realMojis[photo.id]?.length || 0) > 3 && (
                            <span className="text-xs text-club-cream/50">+{(realMojis[photo.id]?.length || 0) - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {photos.length === 0 && (
                <div className="text-center py-12 text-club-cream/50">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No moments captured yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'challenges' && (
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif">Challenges</h2>
              <button onClick={() => setCurrentView('home')} className="text-club-cream/60 hover:text-club-cream">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6 bg-club-gold/10 border border-club-gold/30 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-club-gold mb-1">{points}</div>
              <div className="text-sm text-club-cream/70">Total Points Earned</div>
            </div>
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    challenge.completed
                      ? 'bg-green-500/20 border-2 border-green-500/40'
                      : 'bg-club-charcoal/40 border border-club-cream/20'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {challenge.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Target className="w-5 h-5 text-club-cream/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{challenge.text}</div>
                    <div className="text-xs text-club-gold mt-1">+{challenge.points} points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
