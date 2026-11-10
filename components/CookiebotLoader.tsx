'use client'

import { useEffect } from 'react'

// Cookiebot (Usercentrics) consent banner — the same account/domain group
// already running on optimavillaslanzarote.com. It is injected ONLY on the
// real domain: Cookiebot is licensed per domain, so staging hosts such as
// *.vercel.app must not load it. ConsentGatedGtm (loads Google Tag Manager)
// listens to this banner's consent events.
const COOKIEBOT_CBID = '737b543a-ac7f-41b2-a7fb-d3764876d129'
const REAL_HOSTS = ['optimavillaslanzarote.com', 'www.optimavillaslanzarote.com']

export default function CookiebotLoader() {
  useEffect(() => {
    if (!REAL_HOSTS.includes(window.location.hostname)) return
    if (document.getElementById('Cookiebot')) return
    const s = document.createElement('script')
    s.id = 'Cookiebot'
    s.src = 'https://consent.cookiebot.com/uc.js'
    s.setAttribute('data-cbid', COOKIEBOT_CBID)
    s.setAttribute('data-blockingmode', 'auto')
    s.async = true
    document.head.appendChild(s)
  }, [])
  return null
}
