'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Clock, DollarSign, Navigation, Heart,
  Sun, Sunset, Moon, Star, CheckCircle2, Circle, Sparkles
} from 'lucide-react'
import { austinItinerary, type Location } from '@/lib/austinData'

export default function AustinItinerary() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'budget'>('timeline')
  const [completedLocations, setCompletedLocations] = useState<Set<string>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Load completed locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('austin_completed')
    if (saved) {
      try {
        setCompletedLocations(new Set(JSON.parse(saved)))
      } catch (e) {
        console.error('Failed to load progress:', e)
      }
    }
  }, [])

  // Save completed locations to localStorage
  useEffect(() => {
    if (completedLocations.size > 0) {
      localStorage.setItem('austin_completed', JSON.stringify(Array.from(completedLocations)))
    }
  }, [completedLocations])

  const toggleComplete = (locationId: string) => {
    setCompletedLocations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(locationId)) {
        newSet.delete(locationId)
      } else {
        newSet.add(locationId)
        // Show celebration animation
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2000)
      }
      return newSet
    })
  }

  const totalCost = austinItinerary.reduce((sum, loc) => sum + loc.costAmount, 0)
  const completionPercentage = Math.round((completedLocations.size / austinItinerary.length) * 100)

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0])
    if (hour >= 6 && hour < 18) return Sun
    if (hour >= 18 && hour < 21) return Sunset
    return Moon
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-club-blue via-club-charcoal to-club-blue text-club-cream pb-safe">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-club-gold rounded-full"
                initial={{ 
                  x: 0, 
                  y: 0,
                  scale: 1,
                  opacity: 1
                }}
                animate={{ 
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200,
                  scale: 0,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 1, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-club-gold/10 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 sm:space-y-6"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 border border-club-gold/30 bg-club-gold/10 rounded-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Heart className="w-4 h-4 text-club-gold animate-pulse" />
              <span className="text-sm tracking-wider text-club-gold">FOR ALISHBA</span>
            </motion.div>

            <h1 className="text-4xl sm:text-7xl font-serif text-club-cream">
              Your Perfect<br />
              <span className="text-club-gold">Austin Saturday</span>
            </h1>

            <p className="text-lg sm:text-xl text-club-cream/70 max-w-2xl mx-auto px-4">
              A hyper-optimized itinerary for your Austin adventure 🤠✨
            </p>

            {/* Progress Bar */}
            {completedLocations.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto px-4"
              >
                <div className="bg-club-charcoal/50 border border-club-gold/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-club-cream flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-club-gold" />
                      Your Progress
                    </span>
                    <span className="text-sm font-bold text-club-gold">
                      {completedLocations.size}/{austinItinerary.length} ({completionPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-club-blue/30 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-club-gold to-yellow-400 rounded-full h-3"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto pt-6 sm:pt-8 px-4">
              <motion.div
                className="bg-club-charcoal/50 border border-club-cream/10 p-3 sm:p-4 rounded-lg touch-manipulation"
                whileTap={{ scale: 0.95 }}
              >
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-club-gold mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{austinItinerary.length}</div>
                <div className="text-xs text-club-cream/60">Locations</div>
              </motion.div>

              <motion.div
                className="bg-club-charcoal/50 border border-club-cream/10 p-3 sm:p-4 rounded-lg touch-manipulation"
                whileTap={{ scale: 0.95 }}
              >
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-club-gold mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-2xl font-bold">13.5h</div>
                <div className="text-xs text-club-cream/60">Duration</div>
              </motion.div>

              <motion.div
                className="bg-club-charcoal/50 border border-club-cream/10 p-3 sm:p-4 rounded-lg touch-manipulation"
                whileTap={{ scale: 0.95 }}
              >
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-club-gold mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-2xl font-bold">${Math.round(totalCost)}</div>
                <div className="text-xs text-club-cream/60">Est. Cost</div>
              </motion.div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 justify-center pt-4 sm:pt-6 px-4">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-6 py-3 rounded-lg transition-all font-medium touch-manipulation ${
                  viewMode === 'timeline'
                    ? 'bg-club-gold text-club-blue'
                    : 'bg-club-charcoal/50 text-club-cream/60 active:bg-club-charcoal'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('budget')}
                className={`px-6 py-3 rounded-lg transition-all font-medium touch-manipulation ${
                  viewMode === 'budget'
                    ? 'bg-club-gold text-club-blue'
                    : 'bg-club-charcoal/50 text-club-cream/60 active:bg-club-charcoal'
                }`}
              >
                Budget
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 sm:pb-20">
        {viewMode === 'timeline' && (
          <div className="space-y-4 sm:space-y-6">
            {austinItinerary.map((location, index) => {
              const TimeIcon = getTimeIcon(location.time)
              const isCompleted = completedLocations.has(location.id)
              
              return (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-club-charcoal/30 border rounded-xl overflow-hidden transition-all ${
                    isCompleted 
                      ? 'border-club-gold/50 bg-club-gold/5' 
                      : 'border-club-cream/10 hover:border-club-gold/30'
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComplete(location.id)}
                        className="flex-shrink-0 mt-1 touch-manipulation"
                        aria-label={`Mark ${location.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
                      >
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          className="relative"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-club-gold" />
                          ) : (
                            <Circle className="w-7 h-7 sm:w-8 sm:h-8 text-club-cream/40" />
                          )}
                        </motion.div>
                      </button>

                      {/* Time Badge */}
                      <div className="flex-shrink-0">
                        <div className={`rounded-lg p-2 sm:p-3 text-center min-w-[70px] sm:min-w-[80px] ${
                          isCompleted 
                            ? 'bg-club-gold/30 border border-club-gold/50' 
                            : 'bg-club-gold/20 border border-club-gold/30'
                        }`}>
                          <TimeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-club-gold mx-auto mb-1" />
                          <div className="text-xs sm:text-sm font-bold text-club-gold">{location.time}</div>
                          <div className="text-[10px] sm:text-xs text-club-cream/60">{location.duration}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xl sm:text-2xl">{location.emoji}</span>
                              <h3 className={`text-lg sm:text-xl font-bold ${
                                isCompleted ? 'text-club-gold' : 'text-club-cream'
                              }`}>
                                {location.name}
                              </h3>
                              {location.priority === 'must-see' && (
                                <span className="px-2 py-0.5 bg-club-gold/20 text-club-gold text-[10px] sm:text-xs rounded-full border border-club-gold/30 whitespace-nowrap">
                                  MUST-SEE
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-club-cream/60 flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{location.address}</span>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm sm:text-base text-club-gold font-bold">{location.cost}</div>
                          </div>
                        </div>

                        <p className={`text-sm sm:text-base mb-4 ${
                          isCompleted ? 'text-club-cream/60 line-through' : 'text-club-cream/80'
                        }`}>
                          {location.description}
                        </p>

                        {/* Tips */}
                        {location.tips.length > 0 && !isCompleted && (
                          <div className="bg-club-blue/30 border border-club-cream/10 rounded-lg p-3 mb-4">
                            <div className="text-xs font-bold text-club-gold mb-2 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Pro Tips
                            </div>
                            <ul className="space-y-1.5">
                              {location.tips.map((tip, i) => (
                                <li key={i} className="text-xs sm:text-sm text-club-cream/70 flex items-start gap-2">
                                  <span className="text-club-gold flex-shrink-0 mt-0.5">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <a
                            href={location.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-club-gold/20 active:bg-club-gold/30 border border-club-gold/30 rounded-lg text-sm font-medium text-club-gold transition-all touch-manipulation"
                          >
                            <Navigation className="w-4 h-4" />
                            Open in Maps
                          </a>
                          {isCompleted && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center justify-center gap-2 px-4 py-3 bg-club-gold/10 border border-club-gold/20 rounded-lg text-sm text-club-gold"
                            >
                              <Sparkles className="w-4 h-4" />
                              Completed! 🎉
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {viewMode === 'budget' && (
          <div className="space-y-6">
            <div className="bg-club-charcoal/30 border border-club-cream/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-club-cream mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-club-gold" />
                Budget Breakdown
              </h2>

              <div className="space-y-4">
                {['food', 'view', 'activity', 'nightlife', 'nature', 'culture'].map((type) => {
                  const items = austinItinerary.filter((loc) => loc.type === type)
                  const typeCost = items.reduce((sum, loc) => sum + loc.costAmount, 0)
                  const percentage = totalCost > 0 ? (typeCost / totalCost) * 100 : 0

                  if (items.length === 0) return null

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-club-cream capitalize font-medium">{type}</span>
                        <span className="text-club-gold font-bold">${typeCost.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-club-blue/30 rounded-full h-2">
                        <div
                          className="bg-club-gold rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-club-cream/60">
                        {items.length} locations • {percentage.toFixed(1)}% of budget
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-club-cream/10">
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold text-club-cream">Total Estimated Cost</span>
                  <span className="font-bold text-club-gold">${totalCost.toFixed(2)}</span>
                </div>
                <p className="text-sm text-club-cream/60 mt-2">
                  * Prices are estimates and may vary
                </p>
              </div>
            </div>

            {/* Cost-saving tips */}
            <div className="bg-club-gold/10 border border-club-gold/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-club-gold mb-4">💰 Money-Saving Tips</h3>
              <ul className="space-y-2 text-sm text-club-cream/80">
                <li>• Many of the best spots are completely free (views, parks, trails)</li>
                <li>• Bring a reusable water bottle to save on drinks</li>
                <li>• Some restaurants have happy hour specials</li>
                <li>• Walk between nearby locations to save on parking</li>
                <li>• Street parking on South Congress is metered but affordable</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
