'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'

export default function MyDropsPage() {
  const [rsvps, setRsvps] = useState<any[]>([])
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      try {
        const [rsvpsRes, receiptsRes] = await Promise.all([
          supabase
            .from('rsvps')
            .select('*, drops(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('receipts')
            .select('*, drops(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        ])

        setRsvps(rsvpsRes.data || [])
        setReceipts(receiptsRes.data || [])
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue">
        <div className="text-club-cream/50 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue text-club-cream px-6 py-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-6xl font-serif mb-4">My Drops</h1>
          <p className="text-club-cream/70">Your Club25 journey</p>
        </motion.div>

        {/* Upcoming RSVPs */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif mb-6 text-club-gold">Upcoming</h2>
          {rsvps.filter(r => r.drops?.status !== 'completed').length > 0 ? (
            <div className="space-y-4">
              {rsvps
                .filter(r => r.drops?.status !== 'completed')
                .map(rsvp => (
                  <Link href={`/drop/${rsvp.drops.slug}`} key={rsvp.id}>
                    <motion.div
                      className="border border-club-cream/20 p-6 hover:border-club-gold/50 transition-all duration-300 group cursor-pointer"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-serif group-hover:text-club-gold transition-colors">
                              {rsvp.drops.title}
                            </h3>
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              rsvp.status === 'confirmed' 
                                ? 'bg-club-gold/20 text-club-gold' 
                                : 'bg-club-lilac/20 text-club-lilac'
                            }`}>
                              {rsvp.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-club-cream/70">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(rsvp.drops.date_time).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-club-cream/50 group-hover:text-club-gold transition-colors" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-club-cream/50">No upcoming drops.</p>
          )}
        </section>

        {/* Digital Receipts */}
        <section>
          <h2 className="text-2xl font-serif mb-6 text-club-gold">Your Collection</h2>
          {receipts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {receipts.map(receipt => (
                <Link href={`/drop/${receipt.drops.slug}`} key={receipt.id}>
                  <motion.div
                    className="border border-club-cream/20 p-6 hover:border-club-gold/50 transition-all duration-300 group cursor-pointer"
                    whileHover={{ y: -4 }}
                  >
                    <div className="text-xs text-club-gold tracking-widest mb-2">
                      {receipt.code}
                    </div>
                    <h3 className="text-xl font-serif mb-2 group-hover:text-club-gold transition-colors">
                      {receipt.drops.title}
                    </h3>
                    <div className="text-sm text-club-cream/50">
                      {new Date(receipt.drops.date_time).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-club-cream/50">Attend a drop to start your collection.</p>
          )}
        </section>

        {/* Back link */}
        <div className="mt-16 text-center">
          <Link href="/" className="text-club-cream/70 hover:text-club-cream transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
