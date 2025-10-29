'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Users, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function DropPage({ params }: { params: { slug: string } }) {
  const [drop, setDrop] = useState<any>(null)
  const [gallery, setGallery] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDrop() {
      try {
        const [dropRes, galleryRes] = await Promise.all([
          fetch(`/api/drops/${params.slug}`),
          fetch(`/api/drops/${params.slug}/gallery`)
        ])

        const dropData = await dropRes.json()
        const galleryData = await galleryRes.json()

        setDrop(dropData.drop)
        setGallery(galleryData.media || [])
      } catch (error) {
        console.error('Error fetching drop:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDrop()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue">
        <div className="text-club-cream/50 text-xl">Loading...</div>
      </div>
    )
  }

  if (!drop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue">
        <div className="text-center">
          <h1 className="text-4xl font-serif mb-4 text-club-cream">Drop Not Found</h1>
          <Link href="/" className="text-club-gold hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-club-blue via-club-lilac/20 to-club-blue text-club-cream">
      {/* Back button */}
      <div className="fixed top-8 left-8 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 text-club-cream/70 hover:text-club-cream transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="tracking-wide">BACK</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-club-gold text-sm tracking-widest mb-6">
              {drop.status === 'completed' ? 'ARCHIVE' : 'CURRENT DROP'}
            </div>

            <h1 className="text-6xl md:text-8xl font-serif mb-8">{drop.title}</h1>

            {/* Meta info */}
            <div className="flex flex-wrap gap-6 mb-12 text-club-cream/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(drop.date_time).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{drop.confirmedCount} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Dallas, TX</span>
              </div>
            </div>

            <p className="text-2xl leading-relaxed text-club-cream/90 mb-12">
              {drop.description}
            </p>

            {drop.short_copy && (
              <blockquote className="border-l-4 border-club-gold pl-6 italic text-club-lilac text-xl">
                {drop.short_copy}
              </blockquote>
            )}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="relative px-6 py-24 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-serif mb-12 text-club-gold">Gallery</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((media) => (
                  <motion.div
                    key={media.id}
                    className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Image
                      src={media.url}
                      alt={media.caption || 'Drop photo'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {media.caption && (
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <p className="text-center text-sm">{media.caption}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Empty gallery state */}
      {gallery.length === 0 && drop.status === 'completed' && (
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-club-cream/50">No photos available yet.</p>
          </div>
        </section>
      )}
    </div>
  )
}
