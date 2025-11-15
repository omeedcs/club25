'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Clock, DollarSign, Navigation, Heart,
  Sun, Sunset, Moon, Star
} from 'lucide-react'
import { austinItinerary, type Location } from '@/lib/austinData'

export default function AustinItinerary() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'budget'>('timeline')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const totalCost = austinItinerary.reduce((sum, loc) => sum + loc.costAmount, 0)

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0])
    if (hour >= 6 && hour < 18) return Sun
    if (hour >= 18 && hour < 21) return Sunset
    return Moon
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-club-blue via-club-charcoal to-club-blue text-club-cream">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-club-gold/10 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 border border-club-gold/30 bg-club-gold/10 rounded-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Heart className="w-4 h-4 text-club-gold animate-pulse" />
              <span className="text-sm tracking-wider text-club-gold">FOR ALISHBA</span>
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-serif text-club-cream">
              Your Perfect<br />
              <span className="text-club-gold">Austin Saturday</span>
            </h1>

            <p className="text-xl text-club-cream/70 max-w-2xl mx-auto">
              A hyper-optimized itinerary for your Austin adventure 🤠✨
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
              <motion.div
                className="bg-club-charcoal/50 border border-club-cream/10 p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <MapPin className="w-6 h-6 text-club-gold mx-auto mb-2" />
                <div className="text-2xl font-bold">{austinItinerary.length}</div>
                <div className="text-xs text-club-cream/60">Locations</div>
              </motion.div>

              <motion.div
                className="bg-club-charcoal/50 border border-club-cream/10 p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <Clock className="w-6 h-6 text-club-gold mx-auto mb-2" />
                <div className="text-2xl font-bold">13.5h</div>
                <div className="text-xs text-club-cream/60">Duration</div>
              </motion.div>

              <motion.div
                className="bg-club-charcoal/50 border border-club-cream/10 p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <DollarSign className="w-6 h-6 text-club-gold mx-auto mb-2" />
                <div className="text-2xl font-bold">${Math.round(totalCost)}</div>
                <div className="text-xs text-club-cream/60">Est. Cost</div>
              </motion.div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 justify-center pt-6">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-club-gold text-club-blue'
                    : 'bg-club-charcoal/50 text-club-cream/60 hover:text-club-cream'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('budget')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'budget'
                    ? 'bg-club-gold text-club-blue'
                    : 'bg-club-charcoal/50 text-club-cream/60 hover:text-club-cream'
                }`}
              >
                Budget
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            {austinItinerary.map((location, index) => {
              const TimeIcon = getTimeIcon(location.time)
              
              return (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-club-charcoal/30 border border-club-cream/10 rounded-xl overflow-hidden hover:border-club-gold/30 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Time Badge */}
                      <div className="flex-shrink-0">
                        <div className="bg-club-gold/20 border border-club-gold/30 rounded-lg p-3 text-center min-w-[80px]">
                          <TimeIcon className="w-5 h-5 text-club-gold mx-auto mb-1" />
                          <div className="text-sm font-bold text-club-gold">{location.time}</div>
                          <div className="text-xs text-club-cream/60">{location.duration}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{location.emoji}</span>
                              <h3 className="text-xl font-bold text-club-cream">{location.name}</h3>
                              {location.priority === 'must-see' && (
                                <span className="px-2 py-0.5 bg-club-gold/20 text-club-gold text-xs rounded-full border border-club-gold/30">
                                  MUST-SEE
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-club-cream/60 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {location.address}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-club-gold font-bold">{location.cost}</div>
                          </div>
                        </div>

                        <p className="text-club-cream/80 mb-4">{location.description}</p>

                        {/* Tips */}
                        {location.tips.length > 0 && (
                          <div className="bg-club-blue/30 border border-club-cream/10 rounded-lg p-3 mb-4">
                            <div className="text-xs font-bold text-club-gold mb-2 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Pro Tips
                            </div>
                            <ul className="space-y-1">
                              {location.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-club-cream/70 flex items-start gap-2">
                                  <span className="text-club-gold">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <a
                            href={location.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-club-gold/20 hover:bg-club-gold/30 border border-club-gold/30 rounded-lg text-sm text-club-gold transition-all"
                          >
                            <Navigation className="w-4 h-4" />
                            Navigate
                          </a>
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
