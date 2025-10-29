'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, MessageCircle, Key, Settings, BarChart3, QrCode } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/drops', label: 'Drops', icon: Calendar },
    { href: '/admin/guests', label: 'Guests', icon: Users },
    { href: '/admin/invites', label: 'Invite Codes', icon: Key },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/prompts', label: 'Prompts', icon: MessageCircle },
    { href: '/checkin', label: 'Check-In', icon: QrCode },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-club-blue text-club-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-club-charcoal/50 border-r border-club-cream/10 p-6 flex flex-col">
        <div className="mb-8">
          <Link href="/">
            <h1 className="text-2xl font-serif text-club-gold">Club25</h1>
            <p className="text-xs text-club-cream/50 tracking-wider">ADMIN PANEL</p>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
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
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
