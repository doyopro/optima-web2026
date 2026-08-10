// Server-only. GBP->EUR exchange rate for DISPLAY purposes only — never used
// for anything that actually charges a guest (Stripe stays GBP, always).
//
// Source: Frankfurter (https://frankfurter.dev), a free, no-API-key-required
// FX rate API backed by the European Central Bank's daily reference rates.
// Confirmed live: GET https://api.frankfurter.dev/v1/latest?base=GBP&symbols=EUR
// -> { "amount": 1.0, "base": "GBP", "date": "...", "rates": { "EUR": 1.1687 } }
//
// Cached via Next's fetch Data Cache (next: { revalidate: 86400 }) — the
// external API is only actually called once per 24h no matter how many
// times getGbpToEurRate() itself is invoked; every other call in that
// window is served from Next's cache. See app/api/fx-rate/route.ts, the
// only caller.

const FX_API_URL = 'https://api.frankfurter.dev/v1/latest?base=GBP&symbols=EUR'
const CACHE_SECONDS = 60 * 60 * 24 // 24h

// Used only if the FX API is unreachable and there's no cached value yet —
// a stale-but-reasonable estimate is better than the page breaking.
const FALLBACK_GBP_TO_EUR_RATE = 1.17

export async function getGbpToEurRate(): Promise<number> {
  try {
    const res = await fetch(FX_API_URL, { next: { revalidate: CACHE_SECONDS } })
    if (!res.ok) throw new Error(`FX rate fetch failed: ${res.status}`)

    const data = await res.json()
    const rate = data?.rates?.EUR

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('FX rate response missing a usable EUR rate')
    }

    return rate
  } catch (err) {
    console.error(
      '[getGbpToEurRate] falling back to static rate',
      err instanceof Error ? err.message : err,
    )
    return FALLBACK_GBP_TO_EUR_RATE
  }
}
