'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Share } from 'lucide-react'

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    setIsStandalone(standalone)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Service Worker registered')
      }).catch((error) => {
        console.log('SW registration failed:', error)
      })
    }

    // Listen for install prompt (Android/Desktop)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      console.log('beforeinstallprompt fired')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Show prompt after delay if not already installed
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    if (!dismissed && !standalone) {
      setTimeout(() => {
        setShowInstall(true)
      }, 8000) // Show after 8 seconds
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      // iOS users need manual instructions
      return
    }

    if (!deferredPrompt) {
      // No prompt available, keep showing instructions
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstall(false)
      localStorage.setItem('pwa_install_dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowInstall(false)
    localStorage.setItem('pwa_install_dismissed', 'true')
  }

  if (isStandalone) {
    return null // Already installed
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
              className="absolute top-2 right-2 p-1 text-club-cream/50 hover:text-club-cream touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-club-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-club-gold" />
              </div>
              
              <div className="flex-1 pr-6">
                <h3 className="text-club-cream font-semibold mb-1">
                  Install Club25
                </h3>
                <p className="text-club-cream/70 text-sm mb-3">
                  Quick access to your tickets • Works offline • No app store needed
                </p>
                
                {isIOS ? (
                  // iOS Instructions
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-club-cream/80 bg-club-blue/30 p-2 rounded">
                      <Share className="w-4 h-4 text-club-gold flex-shrink-0" />
                      <span>Tap <strong>Share</strong> button below</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-club-cream/80 bg-club-blue/30 p-2 rounded">
                      <Download className="w-4 h-4 text-club-gold flex-shrink-0" />
                      <span>Select <strong>"Add to Home Screen"</strong></span>
                    </div>
                  </div>
                ) : deferredPrompt ? (
                  // Android/Desktop with prompt
                  <button
                    onClick={handleInstall}
                    className="w-full py-3 bg-club-gold text-club-blue rounded-lg font-semibold text-sm active:scale-95 transition-transform touch-manipulation"
                  >
                    Install Now
                  </button>
                ) : (
                  // Browser without prompt support
                  <div className="text-xs text-club-cream/70 bg-club-blue/30 p-3 rounded">
                    <p className="mb-1">To install:</p>
                    <p>Open browser menu → <strong>Install app</strong> or <strong>Add to home screen</strong></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
