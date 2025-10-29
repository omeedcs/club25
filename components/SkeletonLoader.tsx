'use client'

import { motion } from 'framer-motion'

export function CardSkeleton() {
  return (
    <div className="bg-club-charcoal/30 border border-club-cream/10 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-club-cream/10 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-club-cream/10 rounded w-1/2 mb-3"></div>
      <div className="h-4 bg-club-cream/10 rounded w-2/3"></div>
    </div>
  )
}

export function DropSkeleton() {
  return (
    <motion.div
      className="bg-club-charcoal/50 border border-club-cream/10 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-club-cream/10 rounded w-3/4"></div>
        <div className="h-4 bg-club-cream/10 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-club-cream/10 rounded"></div>
          <div className="h-4 bg-club-cream/10 rounded w-5/6"></div>
        </div>
      </div>
    </motion.div>
  )
}

export function TicketSkeleton() {
  return (
    <motion.div
      className="max-w-md mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-club-charcoal border-2 border-club-gold/30 rounded-2xl overflow-hidden animate-pulse">
        {/* QR Skeleton */}
        <div className="bg-club-cream p-8">
          <div className="w-64 h-64 bg-club-blue/20 mx-auto rounded-lg"></div>
        </div>
        
        {/* Details Skeleton */}
        <div className="p-6 space-y-4">
          <div className="h-8 bg-club-cream/10 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-club-cream/10 rounded w-1/2 mx-auto"></div>
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-club-cream/10 rounded"></div>
            <div className="h-4 bg-club-cream/10 rounded w-5/6"></div>
            <div className="h-4 bg-club-cream/10 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-club-charcoal/30 rounded-lg animate-pulse"
        ></div>
      ))}
    </div>
  )
}
