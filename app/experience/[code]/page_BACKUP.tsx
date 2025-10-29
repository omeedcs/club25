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
  const [pendingConnection, setPendingConnection] = useState<string | null>(null)
  const [activeGame, setActiveGame] = useState<Game>(null)
  const [gameData, setGameData] = useState<any>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', text: 'Find someone who traveled from another city', points: 50, completed: false },
    { id: '2', text: 'Make 3 connections by tapping phones', points: 100, completed: false },
    { id: '3', text: 'Upload a photo to the shared album', points: 75, completed: false },
    { id: '4', text: 'Win a game round', points: 150, completed: false },
    { id: '5', text: 'Connect with 5 different people', points: 200, completed: false },
  ])
  const [points, setPoints] = useState(0)
  const [groupEnergy, setGroupEnergy] = useState(65)
  const [showUpload, setShowUpload] = useState(false)
  const [photoLikes, setPhotoLikes] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadExperience()
    subscribeToUpdates()
    
    // Simulate dynamic group energy
    const energyInterval = setInterval(() => {
      setGroupEnergy(prev => Math.min(100, Math.max(20, prev + (Math.random() - 0.5) * 10)))
    }, 5000)
    
    return () => clearInterval(energyInterval)
  }, [params.code])

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

  // Tap to connect with another guest
  async function initiateConnection(targetGuestId: string) {
    setPendingConnection(targetGuestId)
    setTimeout(() => {
      setConnections(prev => new Set([...prev, targetGuestId]))
      setPendingConnection(null)
      addPoints(100)
      
      if (connections.size + 1 >= 3) completeChallenge('2')
      if (connections.size + 1 >= 5) completeChallenge('5')
    }, 2000)
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

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !rsvp) return
    
    const mockUrl = URL.createObjectURL(file)
    
    await supabase
      .from('media')
      .insert({
        drop_id: rsvp.drop_id,
        user_id: rsvp.user_id,
        url: mockUrl,
        type: 'photo',
        approved: true
      })
    
    setShowUpload(false)
    completeChallenge('3')
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

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Header with Live Phase Indicator */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif">{drop?.title}</h1>
              <p className="text-club-cream/60 text-sm">Welcome, {guest?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-club-gold rounded-full animate-pulse" />
              <span className="text-xs text-club-gold tracking-widest">{phase.toUpperCase()}</span>
            </div>
          </div>

          {/* Phase Progress */}
          <div className="flex gap-1">
            {['arrival', 'appetizer', 'main', 'dessert'].map((p) => (
              <div
                key={p}
                className={`h-1 flex-1 transition-all ${
                  phase === p ? 'bg-club-gold' : 'bg-club-cream/20'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Live Kitchen Updates */}
        {kitchenUpdates.length > 0 && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AnimatePresence>
              {kitchenUpdates.slice(0, 1).map((update) => (
                <motion.div
                  key={update.id}
                  className="bg-club-lilac/10 border border-club-lilac/30 p-4 flex items-start gap-3"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <ChefHat className="w-5 h-5 text-club-gold flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="text-xs text-club-gold mb-1">FROM THE KITCHEN</div>
                    <p className="text-sm">{update.message}</p>
                    <div className="text-xs text-club-cream/50 mt-2">
                      {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* AI Personality Match */}
        {personalityMatch && (
          <motion.div
            className="mb-4 bg-gradient-to-r from-club-lilac/20 to-club-gold/10 border border-club-gold/30 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-club-gold" />
              <div>
                <div className="text-xs text-club-gold mb-1">YOUR MATCH TONIGHT</div>
                <p className="text-sm">
                  You and <span className="font-semibold">{personalityMatch.matched_user?.name}</span> share {personalityMatch.match_score}% personality compatibility
                </p>
                {personalityMatch.match_reasons && (
                  <div className="text-xs text-club-cream/70 mt-1">
                    {personalityMatch.match_reasons[0]}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* My Personalized Prompts for Current Phase */}
        {currentPhasePrompts.length > 0 && (
          <motion.div
            className="mb-4 bg-club-charcoal/30 border border-club-gold/30 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-club-gold" />
              <h3 className="font-serif text-lg">Your Conversation Cards</h3>
            </div>
            <div className="space-y-3">
              {currentPhasePrompts.slice(0, 3).map((prompt, i) => (
                <motion.div
                  key={prompt.id}
                  className="bg-club-blue/20 p-4 border-l-2 border-club-gold"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <p className="text-sm italic">"{prompt.prompts?.text}"</p>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-club-cream/50 mt-3">
              💡 These prompts are unique to you — no one else has these
            </p>
          </motion.div>
        )}

        {/* Live Guest Chat */}
        <motion.div
          className="mb-4 bg-club-charcoal/30 border border-club-cream/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-4 border-b border-club-cream/10">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-club-gold" />
              <h3 className="text-sm font-semibold">Table Chat</h3>
              <span className="text-xs text-club-cream/50">({messages.length})</span>
            </div>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.from_user_id === rsvp?.user_id ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 bg-club-lilac/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">{msg.from_user?.name?.[0] || '?'}</span>
                </div>
                <div className={`flex-1 ${msg.from_user_id === rsvp?.user_id ? 'text-right' : ''}`}>
                  <div className="text-xs text-club-cream/50 mb-1">{msg.from_user?.name}</div>
                  <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    msg.from_user_id === rsvp?.user_id
                      ? 'bg-club-gold/20 text-club-cream'
                      : 'bg-club-charcoal/50 text-club-cream'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-club-cream/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Send a message..."
                className="flex-1 bg-club-charcoal/50 border border-club-cream/20 px-3 py-2 text-sm rounded focus:outline-none focus:border-club-gold"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-club-gold text-club-charcoal rounded hover:bg-club-gold/80 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Photo Gallery Preview */}
        {photos.length > 0 && (
          <motion.div
            className="mb-4 bg-club-charcoal/30 border border-club-cream/20 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-club-gold" />
                <h3 className="text-sm font-semibold">Tonight's Moments</h3>
              </div>
              <button
                onClick={() => setShowGallery(!showGallery)}
                className="text-xs text-club-gold hover:underline"
              >
                {showGallery ? 'Hide' : `View all ${photos.length}`}
              </button>
            </div>
            
            {showGallery ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square bg-club-charcoal/50 rounded overflow-hidden">
                    <img
                      src={photo.url}
                      alt="Event moment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {photos.slice(0, 4).map((photo) => (
                  <div key={photo.id} className="aspect-square bg-club-charcoal/50 rounded overflow-hidden">
                    <img
                      src={photo.url}
                      alt="Event moment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Who's Here - with Live Presence */}
        <motion.div
          className="bg-club-charcoal/30 border border-club-cream/20 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-club-gold" />
            <h3 className="text-sm font-semibold">At the Table</h3>
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">{activeGuests.size} active</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {otherGuests.map((g) => {
              const isActive = activeGuests.has(g.user_id)
              return (
                <div
                  key={g.id}
                  className={`p-3 rounded text-center transition-all ${
                    isActive ? 'bg-club-lilac/20 border border-club-lilac/40' : 'bg-club-blue/10'
                  }`}
                >
                  <div className="relative inline-block">
                    <div className="w-10 h-10 bg-club-charcoal/50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">{g.profiles?.name?.[0] || '?'}</span>
                    </div>
                    {isActive && (
                      <div className="absolute bottom-1 right-0 w-3 h-3 bg-green-400 border-2 border-club-blue rounded-full" />
                    )}
                  </div>
                  <div className="text-xs font-medium truncate">{g.profiles?.name?.split(' ')[0] || 'Guest'}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
