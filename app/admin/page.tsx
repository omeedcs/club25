'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { 
  Calendar, Users, TrendingUp, DollarSign, Key, CheckCircle, 
  Clock, AlertCircle, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

interface Stats {
  // Drops
  totalDrops: number
  activeDrops: number
  completedDrops: number
  
  // RSVPs
  totalRSVPs: number
  confirmedSeats: number
  waitlistCount: number
  cancelledCount: number
  conversionRate: number
  
  // Invite Codes
  totalCodes: number
  activeCodes: number
  totalInvites: number
  codeUsageRate: number
  
  // Attendance
  totalCheckins: number
  attendanceRate: number
  
  // Revenue (if you add pricing later)
  totalRevenue: number
  avgTicketPrice: number
}

interface RecentActivity {
  id: string
  type: 'rsvp' | 'checkin' | 'code_used'
  user: string
  drop: string
  timestamp: Date
}

export default function EnhancedAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDrops: 0,
    activeDrops: 0,
    completedDrops: 0,
    totalRSVPs: 0,
    confirmedSeats: 0,
    waitlistCount: 0,
    cancelledCount: 0,
    conversionRate: 0,
    totalCodes: 0,
    activeCodes: 0,
    totalInvites: 0,
    codeUsageRate: 0,
    totalCheckins: 0,
    attendanceRate: 0,
    totalRevenue: 0,
    avgTicketPrice: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComprehensiveStats()
    
    // Set up real-time subscriptions
    const rsvpSubscription = supabase
      .channel('rsvps_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
        fetchComprehensiveStats()
      })
      .subscribe()

    return () => {
      rsvpSubscription.unsubscribe()
    }
  }, [])

  async function fetchComprehensiveStats() {
    try {
      const [
        dropsRes,
        rsvpsRes,
        codesRes,
        checkinsRes,
        profilesRes
      ] = await Promise.all([
        supabase.from('drops').select('*'),
        supabase.from('rsvps').select('*, drops(*), profiles(*)'),
        supabase.from('invite_codes').select('*'),
        supabase.from('checkins').select('*'),
        supabase.from('profiles').select('*')
      ])

      const drops = dropsRes.data || []
      const rsvps = rsvpsRes.data || []
      const codes = codesRes.data || []
      const checkins = checkinsRes.data || []
      const profiles = profilesRes.data || []

      // Calculate stats
      const activeDrops = drops.filter(d => d.status === 'announced' || d.status === 'sold_out').length
      const completedDrops = drops.filter(d => d.status === 'completed').length
      
      const confirmedSeats = rsvps.filter(r => r.status === 'confirmed').length
      const waitlistCount = rsvps.filter(r => r.status === 'waitlist').length
      const cancelledCount = rsvps.filter(r => r.status === 'cancelled').length
      
      const conversionRate = rsvps.length > 0 
        ? (confirmedSeats / rsvps.length) * 100 
        : 0

      const activeCodes = codes.filter(c => c.active).length
      const totalInvites = codes.reduce((sum, c) => sum + c.current_uses, 0)
      const maxPossibleUses = codes.reduce((sum, c) => sum + c.max_uses, 0)
      const codeUsageRate = maxPossibleUses > 0
        ? (totalInvites / maxPossibleUses) * 100
        : 0

      const attendanceRate = confirmedSeats > 0
        ? (checkins.length / confirmedSeats) * 100
        : 0

      setStats({
        totalDrops: drops.length,
        activeDrops,
        completedDrops,
        totalRSVPs: rsvps.length,
        confirmedSeats,
        waitlistCount,
        cancelledCount,
        conversionRate,
        totalCodes: codes.length,
        activeCodes,
        totalInvites,
        codeUsageRate,
        totalCheckins: checkins.length,
        attendanceRate,
        totalRevenue: 0, // TODO: Add pricing system
        avgTicketPrice: 0
      })

      // Build recent activity
      const activity: RecentActivity[] = []
      
      // Recent RSVPs
      rsvps.slice(0, 5).forEach(rsvp => {
        if (rsvp.status === 'confirmed') {
          activity.push({
            id: rsvp.id,
            type: 'rsvp',
            user: rsvp.profiles?.name || 'Guest',
            drop: rsvp.drops?.title || 'Unknown',
            timestamp: new Date(rsvp.created_at)
          })
        }
      })

      setRecentActivity(activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10))

    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="w-12 h-12 border-2 border-club-gold border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  const mainStats = [
    { 
      label: 'Total Drops', 
      value: stats.totalDrops, 
      icon: Calendar, 
      color: 'blue',
      subtitle: `${stats.activeDrops} active`
    },
    { 
      label: 'Confirmed Seats', 
      value: stats.confirmedSeats, 
      icon: CheckCircle, 
      color: 'gold',
      subtitle: `${stats.waitlistCount} on waitlist`
    },
    { 
      label: 'Conversion Rate', 
      value: `${stats.conversionRate.toFixed(1)}%`, 
      icon: TrendingUp, 
      color: 'lilac',
      subtitle: `${stats.totalRSVPs} total RSVPs`
    },
    { 
      label: 'Active Inv. Codes', 
      value: stats.activeCodes, 
      icon: Key, 
      color: 'gold',
      subtitle: `${stats.totalInvites} uses`
    },
  ]

  const secondaryStats = [
    { label: 'Total Check-ins', value: stats.totalCheckins, change: null },
    { label: 'Attendance Rate', value: `${stats.attendanceRate.toFixed(1)}%`, change: null },
    { label: 'Code Usage', value: `${stats.codeUsageRate.toFixed(1)}%`, change: null },
    { label: 'Cancelled', value: stats.cancelledCount, change: null },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif mb-1 md:mb-2">Dashboard</h1>
        <p className="text-club-cream/60 text-sm md:text-base">Real-time analytics and system overview</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {mainStats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              className="bg-club-charcoal/30 border border-club-cream/10 p-4 md:p-6 rounded-lg backdrop-blur-sm hover:border-club-cream/30 transition-all active:scale-95 touch-manipulation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <Icon className="w-6 h-6 md:w-8 md:h-8 text-club-gold flex-shrink-0" />
                <span className="text-2xl md:text-3xl font-serif text-club-cream">{stat.value}</span>
              </div>
              <div className="text-club-cream/70 text-xs md:text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-club-cream/50 text-xs">{stat.subtitle}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {secondaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-club-charcoal/20 border border-club-cream/10 p-4 rounded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
          >
            <div className="text-2xl font-semibold mb-1">{stat.value}</div>
            <div className="text-xs text-club-cream/60">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          className="bg-club-charcoal/30 border border-club-cream/10 p-4 md:p-6 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Activity className="w-5 h-5 text-club-gold" />
            <h2 className="text-lg md:text-xl font-serif">Recent Activity</h2>
          </div>

          <div className="space-y-3 md:space-y-4 max-h-80 overflow-y-auto smooth-scroll">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, i) => (
                <div key={activity.id} className="flex items-center gap-3 md:gap-4 text-sm border-b border-club-cream/10 pb-3 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-club-gold flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-club-cream truncate">{activity.user}</div>
                    <div className="text-club-cream/50 text-xs truncate">
                      {activity.type === 'rsvp' && 'Reserved for'} {activity.drop}
                    </div>
                  </div>
                  <div className="text-xs text-club-cream/50 flex-shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-club-cream/50 text-center py-8 text-sm">No recent activity</div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="bg-club-charcoal/30 border border-club-cream/10 p-4 md:p-6 rounded-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg md:text-xl font-serif mb-4 md:mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-4 bg-club-gold text-club-blue hover:bg-club-gold/90 active:scale-95 transition-all rounded-lg font-semibold text-left text-sm md:text-base touch-manipulation">
              + Create New Drop
            </button>
            <button className="w-full px-4 py-4 border border-club-cream/30 hover:bg-club-cream/5 active:scale-95 transition-all rounded-lg text-left text-sm md:text-base touch-manipulation">
              Generate Invite Code
            </button>
            <button className="w-full px-4 py-4 border border-club-cream/30 hover:bg-club-cream/5 active:scale-95 transition-all rounded-lg text-left text-sm md:text-base touch-manipulation">
              Export Guest List
            </button>
            <button className="w-full px-4 py-4 border border-club-cream/30 hover:bg-club-cream/5 active:scale-95 transition-all rounded-lg text-left text-sm md:text-base touch-manipulation">
              View Analytics Report
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
