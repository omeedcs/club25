'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, MessageCircle, Key, Settings, BarChart3, QrCode, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/drops', label: 'Drops', icon: Calendar },
    { href: '/admin/guests', label: 'Guests', icon: Users },
    { href: '/admin/invites', label: 'Codes', icon: Key },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/prompts', label: 'Prompts', icon: MessageCircle },
    { href: '/checkin', label: 'Check-In', icon: QrCode },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-club-blue text-club-cream">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-club-charcoal/95 backdrop-blur-lg border-b border-club-cream/10 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <h1 className="text-xl font-serif text-club-gold">Club25</h1>
            <span className="text-xs text-club-cream/50 tracking-wider">ADMIN</span>
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-club-cream hover:text-club-gold transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-club-blue/80 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-club-charcoal border-l border-club-cream/10 z-50 overflow-y-auto safe-top pb-safe"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-serif text-club-gold">Club25</h2>
                    <p className="text-xs text-club-cream/50 tracking-wider">ADMIN PANEL</p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-club-cream/70 hover:text-club-cream touch-manipulation"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="space-y-1 mb-6">
                  {navItems.map(item => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all active:scale-95 touch-manipulation ${
                          isActive
                            ? 'bg-club-gold/20 text-club-gold border border-club-gold/30'
                            : 'text-club-cream/70 hover:bg-club-cream/5 hover:text-club-cream'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>

                <Link 
                  href="/" 
                  className="flex items-center justify-center gap-2 px-4 py-4 border border-club-cream/30 hover:bg-club-cream/5 rounded-lg text-center touch-manipulation active:scale-95 transition-all"
                >
                  ← View Site
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-club-charcoal/50 border-r border-club-cream/10 p-6 flex-col z-30">
        <div className="mb-8">
          <Link href="/">
            <h1 className="text-2xl font-serif text-club-gold">Club25</h1>
            <p className="text-xs text-club-cream/50 tracking-wider">ADMIN PANEL</p>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                  isActive
                    ? 'bg-club-gold/20 text-club-gold border border-club-gold/30'
                    : 'text-club-cream/70 hover:bg-club-cream/5 hover:text-club-cream'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <Link href="/" className="mt-4 px-4 py-3 border border-club-cream/30 hover:bg-club-cream/5 rounded text-center text-sm">
          ← View Site
        </Link>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
