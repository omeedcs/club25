'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { Sparkles, Users, MessageCircle, Music, Camera, Heart, Send, ChefHat, Zap, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export default function ExperiencePage({ params }: { params: { code: string } }) {
  const [guest, setGuest] = useState<any>(null)
  const [drop, setDrop] = useState<any>(null)
  const [rsvp, setRsvp] = useState<any>(null)
  const [myPrompts, setMyPrompts] = useState<any[]>([])
  const [otherGuests, setOtherGuests] = useState<any[]>([])
  const [activeGuests, setActiveGuests] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<'arrival' | 'appetizer' | 'main' | 'dessert'>('arrival')
  const [kitchenUpdates, setKitchenUpdates] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [personalityMatch, setPersonalityMatch] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showGallery, setShowGallery] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadExperience()
    subscribeToUpdates()
  }, [params.code])

  async function loadExperience() {
    try {
      // Get guest RSVP
      const { data: rsvpData } = await supabase
        .from('rsvps')
        .select('*, drops(*)')
        .eq('confirmation_code', params.code)
        .maybeSingle()

      if (!rsvpData) return

      setRsvp(rsvpData)
      setDrop(rsvpData.drops)

      // Get guest profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', rsvpData.user_id)
        .maybeSingle()
      
      setGuest(profileData)

      // Update presence (mark as active)
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

      // Get current drop phase
      const { data: phaseData } = await supabase
        .from('drop_phases')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .maybeSingle()
      
      if (phaseData) setPhase(phaseData.current_phase)

      // Get MY personalized prompts for current phase
      const { data: promptsData } = await supabase
        .from('guest_prompts')
        .select('*, prompts(*)')
        .eq('user_id', rsvpData.user_id)
        .eq('drop_id', rsvpData.drop_id)
      
      setMyPrompts(promptsData || [])

      // Get other confirmed guests
      const { data: guestsData } = await supabase
        .from('rsvps')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .eq('status', 'confirmed')
        .neq('user_id', rsvpData.user_id)

      // Fetch profiles for other guests
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
      } else {
        setOtherGuests([])
      }

      // Get active guests (real-time presence)
      const { data: presenceData } = await supabase
        .from('guest_presence')
        .select('user_id')
        .eq('drop_id', rsvpData.drop_id)
        .eq('is_active', true)
        .gte('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 min
      
      setActiveGuests(new Set(presenceData?.map(p => p.user_id) || []))

      // Get kitchen updates
      const { data: kitchenData } = await supabase
        .from('kitchen_updates')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      setKitchenUpdates(kitchenData || [])

      // Get guest messages (we'll fetch profiles separately)
      const { data: messagesData } = await supabase
        .from('guest_messages')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .order('created_at', { ascending: true })
        .limit(50)
      
      // Fetch profile data for each message
      if (messagesData && messagesData.length > 0) {
        const userIds = Array.from(new Set(messagesData.map(m => m.from_user_id)))
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)
        
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]))
        const messagesWithProfiles = messagesData.map(m => ({
          ...m,
          from_user: profilesMap.get(m.from_user_id)
        }))
        setMessages(messagesWithProfiles)
      } else {
        setMessages([])
      }

      // Get photos from gallery
      const { data: photosData } = await supabase
        .from('media')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .eq('type', 'photo')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(20)
      
      setPhotos(photosData || [])

      // Get my AI personality match for this drop (simplified query)
      const { data: matchData } = await supabase
        .from('personality_matches')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .eq('user_id_1', rsvpData.user_id)
        .maybeSingle()
      
      // If match exists, fetch the matched user's profile
      if (matchData) {
        const { data: matchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', matchData.user_id_2)
          .maybeSingle()
        
        setPersonalityMatch({ ...matchData, matched_user: matchedProfile })
      } else {
        setPersonalityMatch(null)
      }

    } catch (error) {
      console.error('Error loading experience:', error)
    } finally {
      setLoading(false)
    }
  }

  function subscribeToUpdates() {
    if (!rsvp) return

    // Subscribe to phase changes
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

    // Subscribe to kitchen updates
    const kitchenChannel = supabase
      .channel('kitchen_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'kitchen_updates',
        filter: `drop_id=eq.${rsvp.drop_id}`
      }, (payload) => {
        setKitchenUpdates(prev => [payload.new, ...prev].slice(0, 10))
      })
      .subscribe()

    // Subscribe to guest messages
    const messagesChannel = supabase
      .channel('guest_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'guest_messages',
        filter: `drop_id=eq.${rsvp.drop_id}`
      }, async (payload) => {
        // Fetch the profile data for the message
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', payload.new.from_user_id)
          .maybeSingle()
        
        setMessages(prev => [...prev, { ...payload.new, from_user: profileData }])
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
      .subscribe()

    // Subscribe to photo uploads
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

    // Subscribe to presence updates
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
      kitchenChannel.unsubscribe()
      messagesChannel.unsubscribe()
      photosChannel.unsubscribe()
      presenceChannel.unsubscribe()
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !rsvp) return

    await supabase
      .from('guest_messages')
      .insert({
        drop_id: rsvp.drop_id,
        from_user_id: rsvp.user_id,
        message: newMessage,
        message_type: 'text'
      })

    setNewMessage('')
  }

  const currentPhasePrompts = myPrompts.filter(p => p.prompts?.phase === phase)

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
    <div className="min-h-screen bg-club-blue text-club-cream pb-24">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(74, 62, 142, 0.15), transparent 60%)'
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
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
