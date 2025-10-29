'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { Key, Plus, Copy, Check, Trash2, Users, TrendingUp, Eye, EyeOff } from 'lucide-react'
import Modal from '@/components/Modal'

interface InviteCode {
  id: string
  code: string
  user_id: string | null
  max_uses: number
  current_uses: number
  source: 'attendee' | 'admin' | 'founder'
  active: boolean
  expires_at: string | null
  created_at: string
  profiles?: { name: string; email: string }
}

export default function InviteCodesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState('')
  const [newCodeData, setNewCodeData] = useState({
    maxUses: 3,
    source: 'admin' as 'admin' | 'founder',
    expiresIn: 0 // 0 = never, otherwise days
  })

  useEffect(() => {
    fetchCodes()
  }, [])

  async function fetchCodes() {
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*, profiles(name, email)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCodes(data || [])
    } catch (error) {
      console.error('Error fetching codes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createNewCode() {
    try {
      // Generate random code
      const randomCode = 'CLUB-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const expiresAt = newCodeData.expiresIn > 0
        ? new Date(Date.now() + newCodeData.expiresIn * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { error } = await supabase
        .from('invite_codes')
        .insert({
          code: randomCode,
          max_uses: newCodeData.maxUses,
          source: newCodeData.source,
          expires_at: expiresAt,
          active: true
        })

      if (error) throw error

      await fetchCodes()
      setShowCreateModal(false)
      setNewCodeData({ maxUses: 3, source: 'admin', expiresIn: 0 })
    } catch (error: any) {
      console.error('Error creating code:', error)
      alert('Error: ' + error.message)
    }
  }

  async function toggleCodeActive(codeId: string, currentActive: boolean) {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .update({ active: !currentActive })
        .eq('id', codeId)

      if (error) throw error
      await fetchCodes()
    } catch (error) {
      console.error('Error toggling code:', error)
    }
  }

  async function deleteCode(codeId: string) {
    if (!confirm('Are you sure you want to delete this code?')) return

    try {
      const { error } = await supabase
        .from('invite_codes')
        .delete()
        .eq('id', codeId)

      if (error) throw error
      await fetchCodes()
    } catch (error) {
      console.error('Error deleting code:', error)
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const stats = {
    total: codes.length,
    active: codes.filter(c => c.active).length,
    totalUses: codes.reduce((sum, c) => sum + c.current_uses, 0),
    avgUsage: codes.length > 0
      ? (codes.reduce((sum, c) => sum + (c.current_uses / c.max_uses * 100), 0) / codes.length).toFixed(1)
      : '0'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-club-cream/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif mb-2">Invite Codes</h1>
          <p className="text-club-cream/60">Manage and track invitation codes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-club-gold text-club-blue hover:bg-club-gold/90 transition-colors font-semibold rounded flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Generate Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-club-charcoal/30 border border-club-cream/10 p-4 rounded">
          <div className="text-2xl font-semibold mb-1">{stats.total}</div>
          <div className="text-xs text-club-cream/60">Total Codes</div>
        </div>
        <div className="bg-club-charcoal/30 border border-club-cream/10 p-4 rounded">
          <div className="text-2xl font-semibold text-club-gold mb-1">{stats.active}</div>
          <div className="text-xs text-club-cream/60">Active Codes</div>
        </div>
        <div className="bg-club-charcoal/30 border border-club-cream/10 p-4 rounded">
          <div className="text-2xl font-semibold mb-1">{stats.totalUses}</div>
          <div className="text-xs text-club-cream/60">Total Uses</div>
        </div>
        <div className="bg-club-charcoal/30 border border-club-cream/10 p-4 rounded">
          <div className="text-2xl font-semibold mb-1">{stats.avgUsage}%</div>
          <div className="text-xs text-club-cream/60">Avg Usage Rate</div>
        </div>
      </div>

      {/* Codes List */}
      <div className="space-y-3">
        {codes.map((code, i) => (
          <motion.div
            key={code.id}
            className={`bg-club-charcoal/30 border p-6 rounded ${
              code.active ? 'border-club-cream/10' : 'border-club-cream/5 opacity-50'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Key className={`w-5 h-5 ${code.active ? 'text-club-gold' : 'text-club-cream/30'}`} />
                    <code className="text-xl font-mono font-bold">{code.code}</code>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="p-2 hover:bg-club-cream/10 rounded transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === code.code ? (
                      <Check className="w-4 h-4 text-club-gold" />
                    ) : (
                      <Copy className="w-4 h-4 text-club-cream/50" />
                    )}
                  </button>

                  <span className={`text-xs px-3 py-1 rounded-full ${
                    code.source === 'founder' ? 'bg-club-gold/20 text-club-gold' :
                    code.source === 'admin' ? 'bg-club-lilac/20 text-club-lilac' :
                    'bg-club-cream/10 text-club-cream/70'
                  }`}>
                    {code.source}
                  </span>

                  {!code.active && (
                    <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                      INACTIVE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-6 text-sm text-club-cream/70">
                  <div>
                    <div className="text-club-cream/50 text-xs mb-1">Usage</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-club-charcoal/50 rounded-full h-2">
                        <div
                          className="bg-club-gold h-2 rounded-full"
                          style={{ width: `${(code.current_uses / code.max_uses) * 100}%` }}
                        />
                      </div>
                      <span>{code.current_uses}/{code.max_uses}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-club-cream/50 text-xs mb-1">Created</div>
                    <div>{new Date(code.created_at).toLocaleDateString()}</div>
                  </div>
                  
                  <div>
                    <div className="text-club-cream/50 text-xs mb-1">Expires</div>
                    <div>{code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}</div>
                  </div>
                </div>

                {code.profiles && (
                  <div className="mt-3 text-xs text-club-cream/50">
                    <Users className="w-3 h-3 inline mr-1" />
                    Owned by: {code.profiles.name} ({code.profiles.email})
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleCodeActive(code.id, code.active)}
                  className="p-2 hover:bg-club-cream/10 rounded transition-colors"
                  title={code.active ? 'Deactivate' : 'Activate'}
                >
                  {code.active ? (
                    <Eye className="w-5 h-5 text-club-cream/70" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-club-cream/30" />
                  )}
                </button>
                <button
                  onClick={() => deleteCode(code.id)}
                  className="p-2 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete code"
                >
                  <Trash2 className="w-5 h-5 text-red-400/70" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="sm">
        <div>
          <h2 className="text-2xl font-serif mb-6">Generate Invite Code</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-club-cream/70">Max Uses</label>
              <input
                type="number"
                value={newCodeData.maxUses}
                onChange={(e) => setNewCodeData({ ...newCodeData, maxUses: parseInt(e.target.value) })}
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-club-cream/70">Source</label>
              <select
                value={newCodeData.source}
                onChange={(e) => setNewCodeData({ ...newCodeData, source: e.target.value as 'admin' | 'founder' })}
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
              >
                <option value="admin">Admin</option>
                <option value="founder">Founder</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-club-cream/70">Expires In (days, 0 = never)</label>
              <input
                type="number"
                value={newCodeData.expiresIn}
                onChange={(e) => setNewCodeData({ ...newCodeData, expiresIn: parseInt(e.target.value) })}
                className="w-full bg-club-charcoal/50 border border-club-cream/20 px-4 py-2 rounded focus:border-club-gold outline-none"
                min="0"
              />
            </div>

            <button
              onClick={createNewCode}
              className="w-full py-3 bg-club-gold text-club-blue hover:bg-club-gold/90 transition-colors font-semibold rounded"
            >
              Generate Code
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
