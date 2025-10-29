// Mobile Optimization Utilities for Club25

/**
 * Haptic feedback for mobile interactions
 */
export const haptic = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30])
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50])
    }
  }
}

/**
 * Detect if running as PWA
 */
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  // Preload fonts
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.as = 'font'
  fontLink.type = 'font/woff2'
  fontLink.crossOrigin = 'anonymous'
  
  // Preload images
  const preloadImage = (src: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  }
  
  preloadImage('/logo.png')
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]')
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src || ''
        img.removeAttribute('data-src')
        imageObserver.unobserve(img)
      }
    })
  })
  
  images.forEach((img) => imageObserver.observe(img))
}

/**
 * Smooth scroll with offset for mobile headers
 */
export function smoothScrollTo(elementId: string, offset = 0) {
  const element = document.getElementById(elementId)
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

/**
 * Prevent body scroll (for modals)
 */
export function disableBodyScroll() {
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}

export function enableBodyScroll() {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
}

/**
 * Check if device has notch/safe area
 */
export function hasNotch(): boolean {
  const safeArea = getComputedStyle(document.documentElement)
    .getPropertyValue('padding-top')
  return parseInt(safeArea) > 0
}

/**
 * Copy to clipboard with feedback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    haptic.success()
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    haptic.error()
    return false
  }
}

/**
 * Share API with fallback
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data)
      haptic.light()
      return true
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err)
      }
      return false
    }
  }
  // Fallback: copy to clipboard
  if (data.url) {
    return copyToClipboard(data.url)
  }
  return false
}

/**
 * Prefetch next page
 */
export function prefetchPage(url: string) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  document.head.appendChild(link)
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return await Notification.requestPermission()
}

/**
 * Add to home screen prompt
 */
export function showAddToHomeScreen(deferredPrompt: any) {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    return deferredPrompt.userChoice
  }
  return null
}
