// Server-only. GBP->EUR market exchange rate. It feeds the site's GBP/EUR
// toggle AND the rate guests are charged at in the EUR checkout (see
// lib/eur-checkout.ts, which adds the margin on top), so a wrong value here
// costs real money.
//
// Source: Frankfurter (https://frankfurter.dev), backed by the European
// Central Bank's daily reference rates.
// GET https://api.frankfurter.dev/v1/latest?base=GBP&symbols=EUR
// -> { "amount": 1.0, "base": "GBP", "date": "...", "rates": { "EUR": 1.2004 } }
//
// Cached via Next's fetch Data Cache (revalidate 24h): the external API is
// called about once per day.
//
// If the live call fails the order is:
//   1. the last rate we stored (table fx_rate_log, one row per day, written on
//      every successful fetch) if it is at most 7 days old;
//   2. a static default — 1.20 unless FX_FALLBACK_GBP_TO_EUR says otherwise.
//      Revisit it from time to time: it should sit at or just above the market.
import { supabaseServer } from '@/lib/supabase-server'

const FX_API_URL = 'https://api.frankfurter.dev/v1/latest?base=GBP&symbols=EUR'
const CACHE_SECONDS = 60 * 60 * 24 // 24h
const MAX_STORED_AGE_DAYS = 7
const DEFAULT_FALLBACK_GBP_TO_EUR = 1.2

export function staticFallbackRate(): number {
  const v = Number(process.env.FX_FALLBACK_GBP_TO_EUR ?? '')
  return Number.isFinite(v) && v > 1 && v < 2 ? v : DEFAULT_FALLBACK_GBP_TO_EUR
}

let lastLoggedDate = ''

async function storeRate(date: string | undefined, rate: number): Promise<void> {
  if (!date || date === lastLoggedDate) return
  lastLoggedDate = date
  try {
    const { error } = await supabaseServer.from('fx_rate_log').upsert({ rate_date: date, rate }, { onConflict: 'rate_date' })
    if (error) console.error('[getGbpToEurRate] could not store the rate', error.message)
  } catch (err) {
    console.error('[getGbpToEurRate] could not store the rate', err instanceof Error ? err.message : err)
  }
}

async function lastStoredRate(): Promise<{ rate: number; date: string } | null> {
  try {
    const { data } = await supabaseServer
      .from('fx_rate_log')
      .select('rate_date, rate')
      .order('rate_date', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!data) return null
    const ageDays = (Date.now() - new Date(`${data.rate_date}T12:00:00Z`).getTime()) / 86_400_000
    const rate = Number(data.rate)
    return ageDays <= MAX_STORED_AGE_DAYS && rate > 0 ? { rate, date: String(data.rate_date) } : null
  } catch {
    return null
  }
}

export async function getGbpToEurRate(): Promise<number> {
  try {
    const res = await fetch(FX_API_URL, { next: { revalidate: CACHE_SECONDS } })
    if (!res.ok) throw new Error(`FX rate fetch failed: ${res.status}`)

    const data = await res.json()
    const rate = data?.rates?.EUR

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('FX rate response missing a usable EUR rate')
    }

    await storeRate(typeof data?.date === 'string' ? data.date : undefined, rate)
    return rate
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    const stored = await lastStoredRate()
    if (stored) {
      console.error(`[getGbpToEurRate] live rate unavailable (${reason}); using the stored rate from ${stored.date}: ${stored.rate}`)
      return stored.rate
    }
    const fallback = staticFallbackRate()
    console.error(`[getGbpToEurRate] live rate unavailable (${reason}) and no recent stored rate; using the static default ${fallback}`)
    return fallback
  }
}
