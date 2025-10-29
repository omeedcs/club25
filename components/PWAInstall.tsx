'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('SW registration failed:', error)
      })
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('pwa_install_dismissed')
      if (!dismissed) {
        setTimeout(() => setShowInstall(true), 5000) // Show after 5 seconds
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  const handleDismiss = () => {
    setShowInstall(false)
    localStorage.setItem('pwa_install_dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto safe-bottom"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="bg-club-charcoal border-2 border-club-gold/50 rounded-lg p-4 shadow-2xl backdrop-blur-lg">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-club-cream/50 hover:text-club-cream"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-club-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-club-gold" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-club-cream font-semibold mb-1">
                  Install Club25
                </h3>
                <p className="text-club-cream/70 text-sm mb-3">
                  Get faster access and save your ticket offline
                </p>
                
                <button
                  onClick={handleInstall}
                  className="w-full py-2 bg-club-gold text-club-blue rounded-lg font-semibold text-sm active:scale-95 transition-transform touch-manipulation"
                >
                  Install App
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
