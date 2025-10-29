'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { Calendar, Users, TrendingUp, Plus, Settings, MessageCircle, QrCode } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDrops: 0,
    activeDrops: 0,
    totalRSVPs: 0,
    confirmedSeats: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [dropsRes, rsvpsRes] = await Promise.all([
          supabase.from('drops').select('*', { count: 'exact' }),
          supabase.from('rsvps').select('*', { count: 'exact' })
        ])

        const activeDrops = dropsRes.data?.filter(d => 
          d.status === 'announced' || d.status === 'sold_out'
        ).length || 0

        const confirmedSeats = rsvpsRes.data?.filter(r => 
          r.status === 'confirmed'
        ).length || 0

        setStats({
          totalDrops: dropsRes.count || 0,
          activeDrops,
          totalRSVPs: rsvpsRes.count || 0,
          confirmedSeats
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Drops', value: stats.totalDrops, icon: Calendar, color: 'blue' },
    { label: 'Active Drops', value: stats.activeDrops, icon: TrendingUp, color: 'gold' },
    { label: 'Total RSVPs', value: stats.totalRSVPs, icon: Users, color: 'lilac' },
    { label: 'Confirmed Seats', value: stats.confirmedSeats, icon: TrendingUp, color: 'gold' }
  ]

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
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-serif mb-2">Admin Dashboard</h1>
            <p className="text-club-cream/70">Manage drops, RSVPs, and guests</p>
          </div>
          <Link href="/">
            <button className="px-6 py-3 border border-club-cream/30 hover:border-club-cream text-club-cream transition-colors">
              View Site →
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                className="bg-club-charcoal/50 border border-club-cream/10 p-6 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 text-club-${stat.color}`} />
                  <span className="text-3xl font-serif">{stat.value}</span>
                </div>
                <div className="text-club-cream/70 text-sm tracking-wide">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/drops/new">
            <motion.div
              className="bg-club-blue/20 border-2 border-club-blue p-8 cursor-pointer group hover:bg-club-blue/30 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <Plus className="w-12 h-12 mb-4 text-club-gold" />
              <h3 className="text-2xl font-serif mb-2 group-hover:text-club-gold transition-colors">
                Create New Drop
              </h3>
              <p className="text-club-cream/70">Design a new chapter</p>
            </motion.div>
          </Link>

          <Link href="/admin/drops">
            <motion.div
              className="bg-club-lilac/20 border-2 border-club-lilac p-8 cursor-pointer group hover:bg-club-lilac/30 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <Calendar className="w-12 h-12 mb-4 text-club-gold" />
              <h3 className="text-2xl font-serif mb-2 group-hover:text-club-gold transition-colors">
                Manage Drops
              </h3>
              <p className="text-club-cream/70">Edit existing drops</p>
            </motion.div>
          </Link>

          <Link href="/admin/guests">
            <motion.div
              className="bg-club-gold/20 border-2 border-club-gold p-8 cursor-pointer group hover:bg-club-gold/30 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <Users className="w-12 h-12 mb-4 text-club-gold" />
              <h3 className="text-2xl font-serif mb-2 group-hover:text-club-gold transition-colors">
                Guest Lists
              </h3>
              <p className="text-club-cream/70">Manage RSVPs</p>
            </motion.div>
          </Link>

          <Link href="/admin/prompts">
            <motion.div
              className="bg-club-lilac/20 border-2 border-club-lilac p-8 cursor-pointer group hover:bg-club-lilac/30 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <MessageCircle className="w-12 h-12 mb-4 text-club-gold" />
              <h3 className="text-2xl font-serif mb-2 group-hover:text-club-gold transition-colors">
                Prompts
              </h3>
              <p className="text-club-cream/70">Conversation starters</p>
            </motion.div>
          </Link>

          <Link href="/checkin">
            <motion.div
              className="bg-club-blue/20 border-2 border-club-blue p-8 cursor-pointer group hover:bg-club-blue/30 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <QrCode className="w-12 h-12 mb-4 text-club-gold" />
              <h3 className="text-2xl font-serif mb-2 group-hover:text-club-gold transition-colors">
                Check-In
              </h3>
              <p className="text-club-cream/70">Scan QR codes</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  )
}
