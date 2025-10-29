import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Club25 — Invitation Only',
  description: 'An intimate supper club. 25 seats. One secret location. Every two weeks, a new chapter unfolds in Dallas.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Club25',
  },
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Club25 — You\'ve Been Invited',
    description: 'An intimate dining experience. 25 seats. One secret location.',
    type: 'website',
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
