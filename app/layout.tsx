import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Club25 — Curated Dinner Experiences',
  description: 'Intimate supper club events in Dallas, TX. Every two weeks, a new chapter.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Club25',
  },
  icons: {
    icon: '/logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#004aad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="film-grain"></div>
        {children}
      </body>
    </html>
  )
}
