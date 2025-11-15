'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Archive() {
  const [drops, setDrops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { rootMargin: '100px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    async function fetchArchive() {
      try {
        const res = await fetch('/api/drops/archive', { 
          cache: 'no-store',
          next: { revalidate: 60 }
        })
        const data = await res.json()
        setDrops(data.drops || [])
      } catch (error) {
        console.error('Error fetching archive:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArchive()
  }, [isVisible])

  if (loading) {
    return (
      <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center px-6 py-24">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 border-2 border-club-gold border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="text-club-cream/50 text-sm tracking-widest">LOADING ARCHIVE</div>
        </motion.div>
      </section>
    )
  }

  if (drops.length === 0) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-4xl text-center">
          <div className="text-club-gold text-sm tracking-widest mb-6">ARCHIVE</div>
          <p className="text-xl text-club-cream/70">The story is just beginning...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Section header */}
          <div className="mb-16">
            <div className="text-club-gold text-sm tracking-widest mb-4">
              ARCHIVE
            </div>
            <h2 className="text-5xl md:text-6xl font-serif">
              Past Chapters
            </h2>
          </div>

          {/* Archive grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {drops.map((drop, index) => (
              <Link href={`/drop/${drop.slug}`} key={drop.id}>
                <motion.div
                  className="border border-club-cream/20 p-8 hover:border-club-gold/50 transition-all duration-300 group cursor-pointer bg-club-charcoal/20 backdrop-blur-sm hover:bg-club-charcoal/40"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                >
                  <div className="text-club-cream/50 text-sm mb-4">
                    {new Date(drop.date_time).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <h3 className="text-3xl font-serif mb-4 group-hover:text-club-gold transition-colors">
                    {drop.title}
                  </h3>
                  <p className="text-club-cream/70 italic leading-relaxed">
                    {drop.short_copy || drop.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Empty state message if no past chapters */}
          {drops.length === 0 && (
            <div className="text-center py-20 text-club-cream/50">
              <p className="text-xl">The archive awaits its first chapter...</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
