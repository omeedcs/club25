'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [drops, setDrops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newPrompt, setNewPrompt] = useState({
    dropId: '',
    text: '',
    phase: 'arrival' as 'arrival' | 'appetizer' | 'main' | 'dessert',
    weight: 1.0
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [promptsRes, dropsRes] = await Promise.all([
        supabase.from('prompts').select('*, drops(*)').order('created_at', { ascending: false }),
        supabase.from('drops').select('*').order('date_time', { ascending: false })
      ])

      setPrompts(promptsRes.data || [])
      setDrops(dropsRes.data || [])
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createPrompt() {
    if (!newPrompt.dropId || !newPrompt.text) return

    setCreating(true)
    try {
      await supabase.from('prompts').insert({
        drop_id: newPrompt.dropId,
        text: newPrompt.text,
        phase: newPrompt.phase,
        weight: newPrompt.weight,
        active: true
      })

      setNewPrompt({ dropId: '', text: '', phase: 'arrival', weight: 1.0 })
      await fetchData()
    } catch (error) {
      console.error('Error creating prompt:', error)
    } finally {
      setCreating(false)
    }
  }

  async function togglePrompt(id: string, currentActive: boolean) {
    try {
      await supabase.from('prompts').update({ active: !currentActive }).eq('id', id)
      await fetchData()
    } catch (error) {
      console.error('Error toggling prompt:', error)
    }
  }

  async function deletePrompt(id: string) {
    if (!confirm('Delete this prompt?')) return

    try {
      await supabase.from('prompts').delete().eq('id', id)
      await fetchData()
    } catch (error) {
      console.error('Error deleting prompt:', error)
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/admin">
            <button className="p-2 hover:bg-club-cream/10 transition-colors rounded">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-5xl font-serif mb-2">Conversation Prompts</h1>
            <p className="text-club-cream/70">Guide the evening's dialogue</p>
          </div>
        </div>

        {/* Create New */}
        <motion.div
          className="bg-club-charcoal/50 border border-club-cream/10 p-8 mb-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-serif mb-6">Create New Prompt</h2>
          
          <div className="space-y-4">
            <select
              value={newPrompt.dropId}
              onChange={(e) => setNewPrompt({ ...newPrompt, dropId: e.target.value })}
              className="w-full bg-club-charcoal border border-club-cream/30 py-3 px-4 text-club-cream rounded"
            >
              <option value="">Select Drop</option>
              {drops.map(drop => (
                <option key={drop.id} value={drop.id}>{drop.title}</option>
              ))}
            </select>

            <select
              value={newPrompt.phase}
              onChange={(e) => setNewPrompt({ ...newPrompt, phase: e.target.value as any })}
              className="w-full bg-club-charcoal border border-club-cream/30 py-3 px-4 text-club-cream rounded"
            >
              <option value="arrival">Arrival</option>
              <option value="appetizer">Appetizer</option>
              <option value="main">Main Course</option>
              <option value="dessert">Dessert</option>
            </select>

            <textarea
              value={newPrompt.text}
              onChange={(e) => setNewPrompt({ ...newPrompt, text: e.target.value })}
              placeholder="What meal changed your life?"
              rows={3}
              className="w-full bg-transparent border border-club-cream/30 py-3 px-4 text-club-cream rounded resize-none"
            />

            <button
              onClick={createPrompt}
              disabled={creating || !newPrompt.dropId || !newPrompt.text}
              className="w-full py-3 bg-club-gold text-club-charcoal hover:bg-club-gold/90 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {creating ? 'CREATING...' : 'CREATE PROMPT'}
            </button>
          </div>
        </motion.div>

        {/* Existing Prompts */}
        <div className="space-y-4">
          {prompts.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              className="bg-club-charcoal/50 border border-club-cream/10 p-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-club-lilac/20 text-club-lilac">
                      {prompt.phase}
                    </span>
                    <span className="text-xs text-club-cream/50">
                      {prompt.drops?.title}
                    </span>
                  </div>
                  <p className="text-lg">{prompt.text}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => togglePrompt(prompt.id, prompt.active)}
                    className="p-2 hover:bg-club-cream/10 transition-colors rounded"
                  >
                    {prompt.active ? (
                      <ToggleRight className="w-5 h-5 text-club-gold" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-club-cream/30" />
                    )}
                  </button>
                  <button
                    onClick={() => deletePrompt(prompt.id)}
                    className="p-2 hover:bg-red-400/10 transition-colors rounded"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {prompts.length === 0 && (
          <div className="text-center py-20 text-club-cream/50">
            No prompts yet. Create your first one above.
          </div>
        )}
      </div>
    </div>
  )
}
