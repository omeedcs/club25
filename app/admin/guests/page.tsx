'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Search, Mail, Phone, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import Link from 'next/link'

export default function GuestsPage() {
  const [rsvps, setRsvps] = useState<any[]>([])
  const [drops, setDrops] = useState<any[]>([])
  const [selectedDrop, setSelectedDrop] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [rsvpsRes, dropsRes] = await Promise.all([
        supabase
          .from('rsvps')
          .select('*, drops(*), profiles(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('drops')
          .select('*')
          .order('date_time', { ascending: false })
      ])

      setRsvps(rsvpsRes.data || [])
      setDrops(dropsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateRSVPStatus(rsvpId: string, newStatus: 'confirmed' | 'waitlist' | 'cancelled') {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({ status: newStatus })
        .eq('id', rsvpId)

      if (error) throw error

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error updating RSVP:', error)
    }
  }

  const filteredRSVPs = rsvps.filter(rsvp => {
    const matchesDrop = selectedDrop === 'all' || rsvp.drop_id === selectedDrop
    const matchesStatus = statusFilter === 'all' || rsvp.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      rsvp.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rsvp.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesDrop && matchesStatus && matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-club-gold" />
      case 'waitlist': return <Clock className="w-5 h-5 text-club-lilac" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-400" />
      default: return <Clock className="w-5 h-5 text-club-cream/30" />
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/admin">
            <button className="p-2 hover:bg-club-cream/10 transition-colors rounded">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-5xl font-serif mb-2">Guest Lists</h1>
            <p className="text-club-cream/70">Manage RSVPs and confirmations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-club-charcoal/50 border border-club-cream/10 p-6 mb-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-club-cream/50" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-club-charcoal border border-club-cream/30 py-3 pl-12 pr-4 text-club-cream focus:border-club-gold outline-none transition-colors rounded"
              />
            </div>

            {/* Drop Filter */}
            <select
              value={selectedDrop}
              onChange={(e) => setSelectedDrop(e.target.value)}
              className="bg-club-charcoal border border-club-cream/30 py-3 px-4 text-club-cream focus:border-club-gold outline-none transition-colors rounded"
            >
              <option value="all">All Drops</option>
              {drops.map(drop => (
                <option key={drop.id} value={drop.id}>{drop.title}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-club-charcoal border border-club-cream/30 py-3 px-4 text-club-cream focus:border-club-gold outline-none transition-colors rounded"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="waitlist">Waitlist</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-club-cream/50">
            Showing {filteredRSVPs.length} of {rsvps.length} RSVPs
          </div>
        </div>

        {/* Guest List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredRSVPs.map((rsvp, index) => (
              <motion.div
                key={rsvp.id}
                className="bg-club-charcoal/50 border border-club-cream/10 p-6 backdrop-blur-sm hover:border-club-cream/30 transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(rsvp.status)}
                      <h3 className="text-xl font-serif">{rsvp.profiles?.name || 'No name'}</h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-club-lilac/20 text-club-lilac">
                        {rsvp.drops?.title}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-club-cream/70 mb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${rsvp.profiles?.email}`} className="hover:text-club-gold transition-colors">
                          {rsvp.profiles?.email}
                        </a>
                      </div>
                      {rsvp.profiles?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${rsvp.profiles.phone}`} className="hover:text-club-gold transition-colors">
                            {rsvp.profiles.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {rsvp.dietary_notes && (
                      <div className="text-sm text-club-cream/70 bg-club-blue/10 p-3 rounded">
                        <span className="text-club-gold">Dietary:</span> {rsvp.dietary_notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {rsvp.status !== 'confirmed' && (
                      <button
                        onClick={() => updateRSVPStatus(rsvp.id, 'confirmed')}
                        className="px-4 py-2 bg-club-gold text-club-charcoal hover:bg-club-gold/90 transition-colors text-sm font-semibold rounded"
                      >
                        CONFIRM
                      </button>
                    )}
                    {rsvp.status !== 'waitlist' && (
                      <button
                        onClick={() => updateRSVPStatus(rsvp.id, 'waitlist')}
                        className="px-4 py-2 border border-club-lilac text-club-lilac hover:bg-club-lilac/10 transition-colors text-sm rounded"
                      >
                        WAITLIST
                      </button>
                    )}
                    {rsvp.status !== 'cancelled' && (
                      <button
                        onClick={() => updateRSVPStatus(rsvp.id, 'cancelled')}
                        className="px-4 py-2 border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors text-sm rounded"
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRSVPs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-club-cream/50 text-xl">No RSVPs match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
