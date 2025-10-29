'use client'

import { motion } from 'framer-motion'
import { Instagram, Mail, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative px-6 py-16 border-t border-club-cream/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid md:grid-cols-3 gap-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Brand */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Image 
                src="/logo.png" 
                alt="Club25 Logo" 
                width={60} 
                height={60}
                className="object-contain"
              />
              <h3 className="text-4xl font-serif">club25</h3>
            </div>
            <p className="text-club-cream/70 leading-relaxed">
              a collective of rooms, flavors, and ideas.
            </p>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-club-gold" />
              <h4 className="text-lg tracking-wide">LOCATION</h4>
            </div>
            <p className="text-club-cream/70">
              Dallas, TX<br />
              <span className="text-sm italic">Address shared upon RSVP confirmation</span>
            </p>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg tracking-wide mb-4">CONNECT</h4>
            <div className="space-y-3">
              <a
                href="mailto:hello@club25.co"
                className="flex items-center gap-3 text-club-cream/70 hover:text-club-gold transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>hello@club25.co</span>
              </a>
              <a
                href="https://instagram.com/club25"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-club-cream/70 hover:text-club-gold transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>@club25</span>
              </a>
            </div>

            {/* Email signup */}
            <div className="mt-8">
              <input
                type="email"
                placeholder="Join the list"
                className="w-full bg-transparent border-b border-club-cream/30 py-2 text-club-cream placeholder:text-club-cream/40 focus:border-club-gold outline-none transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="text-center text-club-cream/50 text-sm">
          2024 Club25. A living experiment in food, design, and connection.
        </div>

        {/* Admin Link (hidden) */}
        <Link href="/admin">
          <div className="text-center mt-4 text-club-cream/20 hover:text-club-cream/40 text-xs transition-colors cursor-pointer">
            •
          </div>
        </Link>
      </div>
    </footer>
  )
}
