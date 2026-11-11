// Single entry point for dataLayer pushes. GTM itself is only loaded after
// cookie consent (components/ConsentGatedGtm.tsx); pushing into the
// dataLayer before that is harmless — GTM replays the queue when it loads.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export function pushEvent(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

// Fires `fn` at most once per `key` in this browser (localStorage, falling
// back to in-memory when storage is blocked). Used so reloading a thank-you
// page or re-polling can never count a conversion twice.
const memory = new Set<string>()
export function runOnce(key: string, fn: () => void): boolean {
  const k = `optima_once:${key}`
  try {
    if (window.localStorage.getItem(k)) return false
    window.localStorage.setItem(k, String(Date.now()))
  } catch {
    if (memory.has(k)) return false
    memory.add(k)
  }
  fn()
  return true
}
