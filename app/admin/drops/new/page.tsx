'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabaseAdmin } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewDropPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: '',
    time: '19:00',
    seatLimit: 12,
    description: '',
    shortCopy: '',
    status: 'draft' as 'draft' | 'announced'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const dateTime = `${formData.date} ${formData.time}:00+00`

      const { data, error: insertError } = await supabaseAdmin
        .from('drops')
        .insert({
          title: formData.title,
          slug: formData.slug,
          date_time: dateTime,
          seat_limit: formData.seatLimit,
          description: formData.description,
          short_copy: formData.shortCopy || null,
          status: formData.status
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push('/admin/drops')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue text-club-cream">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/admin">
            <button className="p-2 hover:bg-club-cream/10 transition-colors rounded">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-5xl font-serif mb-2">Create New Drop</h1>
            <p className="text-club-cream/70">Design the next chapter</p>
          </div>
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
                placeholder="Tokyo Midnight"
                className="w-full bg-transparent border-b-2 border-club-cream/30 py-3 text-2xl font-serif text-club-cream focus:border-club-gold outline-none transition-colors"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm mb-2 tracking-wide text-club-cream/70">URL SLUG (auto-generated)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                placeholder="tokyo-midnight"
                className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors font-mono text-sm"
              />
              <p className="text-xs text-club-cream/50 mt-2">club25.co/drop/{formData.slug || 'your-slug'}</p>
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
                placeholder="izakaya energy meets dim jazz. sake flows like conversation..."
                className="w-full bg-transparent border border-club-cream/30 py-3 px-4 text-club-cream focus:border-club-gold outline-none transition-colors resize-none rounded"
              />
              <p className="text-xs text-club-cream/50 mt-2">This appears on the main page and drop detail page</p>
            </div>

            {/* Short Copy */}
            <div>
              <label className="block text-sm mb-2 tracking-wide text-club-cream/70">SHORT COPY (optional)</label>
              <input
                type="text"
                name="shortCopy"
                value={formData.shortCopy}
                onChange={handleChange}
                placeholder='"the kind of night where strangers become co-conspirators..."'
                className="w-full bg-transparent border-b border-club-cream/30 py-3 text-club-cream focus:border-club-gold outline-none transition-colors italic"
              />
              <p className="text-xs text-club-cream/50 mt-2">Poetic one-liner for archive cards</p>
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
                <option value="draft">Draft (hidden)</option>
                <option value="announced">Announced (public, accepting RSVPs)</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-club-gold text-club-charcoal hover:bg-club-gold/90 transition-all duration-300 text-lg tracking-wider font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'CREATING...' : 'CREATE DROP'}
              </button>
              <Link href="/admin" className="flex-shrink-0">
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
