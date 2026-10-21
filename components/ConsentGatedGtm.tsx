'use client'

import { useEffect } from 'react'

// Google Tag Manager is loaded ONLY after the visitor has consented to
// statistics or marketing cookies. With no consent mechanism installed
// (today), nothing ever loads it — no GTM, GA4 or Ads tags, no cookies, no
// network requests to Google. The noscript iframe variant is intentionally
// not used: it would load GTM with no consent.
//
// Ready for Cookiebot: once its script is added in app/layout.tsx (see the
// TODO there), this listens to Cookiebot's own events/state and loads GTM
// when statistics or marketing consent is given. For another CMP, call
// window.optimaGrantTracking() from its "accepted" callback.
declare global {
  interface Window {
    Cookiebot?: { consent?: { statistics?: boolean; marketing?: boolean } }
    optimaGrantTracking?: () => void
    dataLayer?: Record<string, unknown>[]
  }
}

let loaded = false

function loadGtm(containerId: string) {
  if (loaded || typeof document === 'undefined') return
  loaded = true
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`
  document.head.appendChild(s)
}

export default function ConsentGatedGtm({ containerId }: { containerId: string }) {
  useEffect(() => {
    const maybeLoad = () => {
      const c = window.Cookiebot?.consent
      if (c?.statistics || c?.marketing) loadGtm(containerId)
    }
    window.optimaGrantTracking = () => loadGtm(containerId)
    window.addEventListener('CookiebotOnAccept', maybeLoad)
    window.addEventListener('CookiebotOnConsentReady', maybeLoad)
    maybeLoad()
    return () => {
      window.removeEventListener('CookiebotOnAccept', maybeLoad)
      window.removeEventListener('CookiebotOnConsentReady', maybeLoad)
    }
  }, [containerId])
  return null
}
