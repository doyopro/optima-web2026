import { NextResponse } from 'next/server'
import { getGbpToEurRate } from '@/lib/fx-rate'

// Display-only exchange rate for the site's GBP/EUR toggle. The underlying
// fetch to the real FX API is cached for 24h (see lib/fx-rate.ts) — this
// route can be hit on every page load without that turning into a
// per-request external call.
export async function GET() {
  const rate = await getGbpToEurRate()
  return NextResponse.json({ base: 'GBP', target: 'EUR', rate })
}
