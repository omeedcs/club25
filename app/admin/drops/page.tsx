'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Users, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ManageDropsPage() {
  const [drops, setDrops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrops()
  }, [])

  async function fetchDrops() {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*, rsvps(id, status)')
        .order('date_time', { ascending: false })

      if (error) throw error

      setDrops(data || [])
    } catch (error) {
      console.error('Error fetching drops:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'announced': return 'text-club-gold'
      case 'sold_out': return 'text-club-lilac'
      case 'completed': return 'text-club-cream/50'
      default: return 'text-club-cream/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue">
        <div className="text-club-cream/50 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue text-club-cream">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/admin">
            <button className="p-2 hover:bg-club-cream/10 transition-colors rounded">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-5xl font-serif mb-2">Manage Drops</h1>
            <p className="text-club-cream/70">All drops across all statuses</p>
          </div>
          <Link href="/admin/drops/new">
            <button className="px-6 py-3 bg-club-gold text-club-charcoal hover:bg-club-gold/90 transition-colors font-semibold">
              + NEW DROP
            </button>
          </Link>
        </div>

        {/* Drops List */}
        <div className="space-y-4">
          {drops.map((drop, index) => {
            const confirmedCount = drop.rsvps?.filter((r: any) => r.status === 'confirmed').length || 0
            const waitlistCount = drop.rsvps?.filter((r: any) => r.status === 'waitlist').length || 0

            return (
              <motion.div
                key={drop.id}
                className="bg-club-charcoal/50 border border-club-cream/10 p-6 backdrop-blur-sm hover:border-club-cream/30 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-serif">{drop.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(drop.status)}`}>
                        {drop.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-6 text-club-cream/70 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(drop.date_time).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {confirmedCount}/{drop.seat_limit} confirmed
                          {waitlistCount > 0 && ` (+${waitlistCount} waitlist)`}
                        </span>
                      </div>
                    </div>

                    <p className="text-club-cream/70 line-clamp-2">{drop.description}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/drops/${drop.id}`}>
                      <button className="p-3 hover:bg-club-cream/10 transition-colors rounded">
                        <Edit className="w-5 h-5" />
                      </button>
                    </Link>
                    <Link href={`/drop/${drop.slug}`} target="_blank">
                      <button className="px-4 py-3 border border-club-cream/30 hover:bg-club-cream/10 transition-colors rounded text-sm">
                        VIEW
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {drops.length === 0 && (
          <div className="text-center py-20">
            <p className="text-club-cream/50 text-xl mb-6">No drops yet</p>
            <Link href="/admin/drops/new">
              <button className="px-8 py-4 bg-club-gold text-club-charcoal hover:bg-club-gold/90 transition-colors font-semibold">
                CREATE YOUR FIRST DROP
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
