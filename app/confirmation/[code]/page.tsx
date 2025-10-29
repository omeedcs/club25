'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { Calendar, MapPin, Users, QrCode, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ConfirmationPage({ params }: { params: { code: string } }) {
  const [rsvp, setRsvp] = useState<any>(null)
  const [drop, setDrop] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [checkin, setCheckin] = useState<any>(null)
  const [otherGuests, setOtherGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfirmation()
  }, [params.code])

  async function fetchConfirmation() {
    try {
      // Get RSVP by confirmation code
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*, drops(*)')
        .eq('confirmation_code', params.code)
        .maybeSingle()

      if (rsvpError) throw rsvpError
      
      if (!rsvpData) {
        setLoading(false)
        return
      }

      setRsvp(rsvpData)
      setDrop(rsvpData.drops)
      
      // Get user profile separately
      if (rsvpData.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', rsvpData.user_id)
          .maybeSingle()
        
        setProfile(profileData)
      }

      // Get QR code
      const { data: checkinData } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', rsvpData.user_id)
        .eq('drop_id', rsvpData.drop_id)
        .maybeSingle()

      setCheckin(checkinData)

      // Get other confirmed guests (for matching)
      const { data: guestsData } = await supabase
        .from('rsvps')
        .select('*')
        .eq('drop_id', rsvpData.drop_id)
        .eq('status', 'confirmed')
        .neq('user_id', rsvpData.user_id)
        .limit(5)

      // Fetch profiles for each guest
      if (guestsData && guestsData.length > 0) {
        const profilePromises = guestsData.map(guest =>
          supabase
            .from('profiles')
            .select('*')
            .eq('id', guest.user_id)
            .maybeSingle()
        )
        
        const profileResults = await Promise.all(profilePromises)
        const guestsWithProfiles = guestsData.map((guest, i) => ({
          ...guest,
          profiles: profileResults[i].data
        }))
        
        setOtherGuests(guestsWithProfiles)
      }

    } catch (error) {
      console.error('Error fetching confirmation:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (!rsvp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue text-club-cream">
        <div className="text-center">
          <h1 className="text-4xl font-serif mb-4">Confirmation Not Found</h1>
          <p className="text-club-cream/70 mb-8">This confirmation code is invalid.</p>
          <Link href="/" className="text-club-gold hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = {
    confirmed: { icon: CheckCircle, color: 'text-club-gold', label: 'CONFIRMED' },
    waitlist: { icon: Clock, color: 'text-club-lilac', label: 'WAITLIST' },
    cancelled: { icon: Clock, color: 'text-red-400', label: 'CANCELLED' }
  }

  const status = statusConfig[rsvp.status as keyof typeof statusConfig] || statusConfig.waitlist

  return (
    <div className="min-h-screen bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue text-club-cream">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Club25" width={80} height={80} />
          </div>
          <h1 className="text-5xl font-serif mb-4">Your Reservation</h1>
          <div className="flex items-center justify-center gap-2">
            <status.icon className={`w-5 h-5 ${status.color}`} />
            <span className={`text-sm tracking-widest ${status.color}`}>{status.label}</span>
          </div>
        </motion.div>

        {/* Confirmation Code */}
        <motion.div
          className="bg-club-charcoal/50 border border-club-cream/10 p-8 mb-6 text-center backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-sm text-club-cream/50 mb-2 tracking-widest">CONFIRMATION CODE</div>
          <div className="text-4xl font-mono font-bold text-club-gold mb-4">{params.code}</div>
          <div className="text-sm text-club-cream/70 mb-6">Save this code — you'll need it to check in</div>
          
          {/* View Ticket CTA */}
          <Link 
            href={`/my-ticket?code=${params.code}`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-club-gold text-club-blue font-semibold rounded-lg hover:bg-club-gold/90 active:scale-95 transition-all touch-manipulation"
          >
            <QrCode className="w-5 h-5" />
            <span>View My Ticket & QR Code</span>
          </Link>
        </motion.div>

        {/* Event Details */}
        <motion.div
          className="bg-club-charcoal/50 border border-club-cream/10 p-8 mb-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-serif mb-6">{drop.title}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-club-cream/70">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(drop.date_time).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-club-cream/70">
              <MapPin className="w-5 h-5" />
              <span>Location sent 24h before event</span>
            </div>

            {rsvp.dietary_notes && (
              <div className="mt-6 p-4 bg-club-blue/10 rounded">
                <div className="text-sm text-club-gold mb-1">Your dietary notes:</div>
                <div className="text-club-cream/70">{rsvp.dietary_notes}</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* QR Code - Only for confirmed */}
        {rsvp.status === 'confirmed' && checkin && (
          <motion.div
            className="bg-club-charcoal/50 border border-club-cream/10 p-8 mb-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-sm text-club-cream/50 mb-4 tracking-widest">CHECK-IN QR CODE</div>
            <div className="flex justify-center mb-4">
              <div className="bg-club-cream p-4 rounded-lg">
                <img src={checkin.qr_code} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>
            <div className="text-sm text-club-cream/70">Show this at the door</div>
          </motion.div>
        )}

        {/* Experience Access - Only for confirmed */}
        {rsvp.status === 'confirmed' && (
          <motion.div
            className="bg-club-lilac/10 border border-club-lilac/30 p-8 mb-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-sm text-club-gold mb-3 tracking-widest">DURING THE EVENT</div>
            <h3 className="text-2xl font-serif mb-4">The Ultimate Virtual Experience</h3>
            <p className="text-club-cream/70 mb-6">
              Once you arrive, unlock live features: auto-connect with nearby guests, capture BeReal moments, play icebreaker games, view the interactive menu, and get real-time kitchen updates.
            </p>
            <Link 
              href={`/experience/${params.code}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-club-gold text-club-blue font-semibold rounded-lg hover:bg-club-gold/90 active:scale-95 transition-all touch-manipulation"
            >
              <Users className="w-5 h-5" />
              <span>Access Experience</span>
            </Link>
          </motion.div>
        )}

        {/* Other Attendees - Only for confirmed */}
        {rsvp.status === 'confirmed' && otherGuests.length > 0 && (
          <motion.div
            className="bg-club-charcoal/50 border border-club-cream/10 p-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-club-gold" />
              <h3 className="text-xl font-serif">Who's Coming</h3>
            </div>
            
            <div className="space-y-3">
              {otherGuests.map(guest => (
                <div key={guest.id} className="flex items-center justify-between p-4 bg-club-blue/5 rounded">
                  <div>
                    <div className="font-semibold">{guest.profiles?.name || 'Guest'}</div>
                    <div className="text-sm text-club-cream/50">Attending</div>
                  </div>
                </div>
              ))}
              <div className="text-center text-sm text-club-cream/50 mt-4">
                + {drop.seat_limit - otherGuests.length - 1} more guests
              </div>
            </div>
          </motion.div>
        )}

        {/* Waitlist Message */}
        {rsvp.status === 'waitlist' && (
          <motion.div
            className="bg-club-lilac/10 border border-club-lilac/30 p-6 rounded text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-club-cream/70">
              You're on the priority waitlist. We'll email you immediately if a spot opens.
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="mt-8 text-center space-y-4">
          <Link href={`/drop/${drop.slug}`}>
            <button className="px-8 py-3 border border-club-cream/30 text-club-cream hover:bg-club-cream/10 transition-colors">
              VIEW EVENT DETAILS
            </button>
          </Link>
          <div>
            <Link href="/" className="text-club-cream/50 hover:text-club-cream text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
