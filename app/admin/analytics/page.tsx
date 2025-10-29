'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { TrendingUp, Users, Calendar, BarChart3, Download } from 'lucide-react'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    dropStats: [] as any[],
    inviteTree: [] as any[],
    topReferrers: [] as any[],
    growthData: [] as any[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      const [drops, rsvps, codes, profiles] = await Promise.all([
        supabase.from('drops').select('*').order('date_time', { ascending: false }),
        supabase.from('rsvps').select('*, drops(title), profiles(name, email)'),
        supabase.from('invite_codes').select('*'),
        supabase.from('profiles').select('*')
      ])

      // Drop Performance
      const dropStats = drops.data?.map(drop => {
        const dropRSVPs = rsvps.data?.filter(r => r.drop_id === drop.id) || []
        const confirmed = dropRSVPs.filter(r => r.status === 'confirmed').length
        const waitlist = dropRSVPs.filter(r => r.status === 'waitlist').length
        
        return {
          title: drop.title,
          date: new Date(drop.date_time).toLocaleDateString(),
          confirmed,
          waitlist,
          fillRate: drop.seat_limit > 0 ? ((confirmed / drop.seat_limit) * 100).toFixed(1) : 0,
          status: drop.status
        }
      }) || []

      // Top Referrers (most used codes)
      const topReferrers = codes.data
        ?.filter(c => c.current_uses > 0)
        .sort((a, b) => b.current_uses - a.current_uses)
        .slice(0, 10)
        .map(code => ({
          code: code.code,
          uses: code.current_uses,
          maxUses: code.max_uses,
          usageRate: ((code.current_uses / code.max_uses) * 100).toFixed(1)
        })) || []

      // Growth over time (RSVPs by month)
      const monthlyGrowth = rsvps.data?.reduce((acc: any, rsvp) => {
        const month = new Date(rsvp.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {}) || {}

      const growthData = Object.entries(monthlyGrowth).map(([month, count]) => ({
        month,
        count
      }))

      setAnalytics({
        dropStats,
        inviteTree: [],
        topReferrers,
        growthData
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  function exportToCSV() {
    const csv = [
      ['Drop', 'Date', 'Confirmed', 'Waitlist', 'Fill Rate', 'Status'],
      ...analytics.dropStats.map(d => [d.title, d.date, d.confirmed, d.waitlist, d.fillRate + '%', d.status])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `club25-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-club-cream/50">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif mb-2">Analytics</h1>
          <p className="text-club-cream/60">Performance insights and trends</p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-6 py-3 border border-club-cream/30 hover:bg-club-cream/5 transition-colors rounded flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Drop Performance */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-club-gold" />
          Drop Performance
        </h2>
        <div className="bg-club-charcoal/30 border border-club-cream/10 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-club-charcoal/50 border-b border-club-cream/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-club-cream/70 uppercase tracking-wider">Drop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-club-cream/70 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-club-cream/70 uppercase tracking-wider">Confirmed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-club-cream/70 uppercase tracking-wider">Waitlist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-club-cream/70 uppercase tracking-wider">Fill Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-club-cream/70 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-club-cream/10">
              {analytics.dropStats.map((drop, i) => (
                <tr key={i} className="hover:bg-club-cream/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{drop.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-club-cream/70">{drop.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-club-gold">{drop.confirmed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-club-lilac">{drop.waitlist}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-club-charcoal/50 rounded-full h-2">
                        <div
                          className="bg-club-gold h-2 rounded-full"
                          style={{ width: `${drop.fillRate}%` }}
                        />
                      </div>
                      <span className="text-sm">{drop.fillRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      drop.status === 'completed' ? 'bg-club-cream/10 text-club-cream/50' :
                      drop.status === 'announced' ? 'bg-club-gold/20 text-club-gold' :
                      'bg-club-lilac/20 text-club-lilac'
                    }`}>
                      {drop.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-club-gold" />
            Top Invite Codes
          </h2>
          <div className="bg-club-charcoal/30 border border-club-cream/10 rounded p-6">
            <div className="space-y-4">
              {analytics.topReferrers.map((ref, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-club-gold font-semibold">#{i + 1}</div>
                    <code className="font-mono">{ref.code}</code>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{ref.uses}</div>
                    <div className="text-xs text-club-cream/50">{ref.usageRate}% used</div>
                  </div>
                </div>
              ))}
              {analytics.topReferrers.length === 0 && (
                <div className="text-center py-8 text-club-cream/50">No invite code usage yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div>
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-club-gold" />
            Monthly Growth
          </h2>
          <div className="bg-club-charcoal/30 border border-club-cream/10 rounded p-6">
            <div className="space-y-3">
              {analytics.growthData.map((data, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-club-cream/70">{data.month}</div>
                  <div className="flex-1 bg-club-charcoal/50 rounded-full h-8 relative">
                    <div
                      className="bg-club-gold/30 h-8 rounded-full flex items-center px-3"
                      style={{ width: `${Math.min((data.count / Math.max(...analytics.growthData.map(d => d.count))) * 100, 100)}%` }}
                    >
                      <span className="text-xs font-semibold">{data.count}</span>
                    </div>
                  </div>
                </div>
              ))}
              {analytics.growthData.length === 0 && (
                <div className="text-center py-8 text-club-cream/50">No growth data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
