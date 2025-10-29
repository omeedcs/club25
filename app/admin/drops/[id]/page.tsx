'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabaseAdmin } from '@/lib/supabase/client'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function EditDropPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: '',
    time: '19:00',
    seatLimit: 12,
    description: '',
    shortCopy: '',
    status: 'draft' as 'draft' | 'announced' | 'sold_out' | 'completed' | 'cancelled'
  })

  useEffect(() => {
    fetchDrop()
  }, [params.id])

  async function fetchDrop() {
    try {
      const { data, error } = await supabaseAdmin
        .from('drops')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      const dateTime = new Date(data.date_time)
      const date = dateTime.toISOString().split('T')[0]
      const time = dateTime.toTimeString().slice(0, 5)

      setFormData({
        title: data.title,
        slug: data.slug,
        date,
        time,
        seatLimit: data.seat_limit,
        description: data.description || '',
        shortCopy: data.short_copy || '',
        status: data.status
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const dateTime = `${formData.date} ${formData.time}:00+00`

      const { error: updateError } = await supabaseAdmin
        .from('drops')
        .update({
          title: formData.title,
          slug: formData.slug,
          date_time: dateTime,
          seat_limit: formData.seatLimit,
          description: formData.description,
          short_copy: formData.shortCopy || null,
          status: formData.status
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      router.push('/admin/drops')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this drop? This cannot be undone.')) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabaseAdmin
        .from('drops')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/admin/drops')
    } catch (err: any) {
      setError(err.message)
      setDeleting(false)
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
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link href="/admin/drops">
              <button className="p-2 hover:bg-club-cream/10 transition-colors rounded">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <div>
              <h1 className="text-5xl font-serif mb-2">Edit Drop</h1>
              <p className="text-club-cream/70">{formData.title}</p>
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-3 border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'DELETING...' : 'DELETE'}
          </button>
        </div>

        {/* Form */}
        <motion.div
          className="bg-club-charcoal/50 border border-club-cream/10 p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm mb-2 tracking-wide text-club-gold">DROP TITLE *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b-2 border-club-cream/30 py-3 text-2xl font-serif text-club-cream focus:border-club-gold outline-none transition-colors"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm mb-2 tracking-wide text-club-cream/70">URL SLUG</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors font-mono text-sm"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 tracking-wide text-club-gold">DATE *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-club-charcoal border border-club-cream/30 py-3 px-4 text-club-cream focus:border-club-gold outline-none transition-colors rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 tracking-wide text-club-gold">TIME *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full bg-club-charcoal border border-club-cream/30 py-3 px-4 text-club-cream focus:border-club-gold outline-none transition-colors rounded"
                />
              </div>
            </div>

            {/* Seat Limit */}
            <div>
              <label className="block text-sm mb-2 tracking-wide text-club-gold">SEAT LIMIT *</label>
              <input
                type="number"
                name="seatLimit"
                value={formData.seatLimit}
                onChange={handleChange}
                required
                min="1"
                max="30"
                className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-2 tracking-wide text-club-gold">DESCRIPTION *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-transparent border border-club-cream/30 py-3 px-4 text-club-cream focus:border-club-gold outline-none transition-colors resize-none rounded"
              />
            </div>

            {/* Short Copy */}
            <div>
              <label className="block text-sm mb-2 tracking-wide text-club-cream/70">SHORT COPY</label>
              <input
                type="text"
                name="shortCopy"
                value={formData.shortCopy}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors italic"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm mb-2 tracking-wide text-club-gold">STATUS *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-club-charcoal border border-club-cream/30 py-3 px-4 text-club-cream focus:border-club-gold outline-none transition-colors rounded"
              >
                <option value="draft">Draft</option>
                <option value="announced">Announced</option>
                <option value="sold_out">Sold Out</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 bg-club-gold text-club-charcoal hover:bg-club-gold/90 transition-all duration-300 text-lg tracking-wider font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
              <Link href="/admin/drops" className="flex-shrink-0">
                <button
                  type="button"
                  className="px-8 py-4 border border-club-cream/30 text-club-cream hover:bg-club-cream/10 transition-all duration-300"
                >
                  CANCEL
                </button>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
