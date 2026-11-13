import { NextResponse } from 'next/server'
import { getGbpToEurRate } from '@/lib/fx-rate'
import { getCheckoutEurRate } from '@/lib/eur-checkout'
import { EUR_CHECKOUT_ENABLED } from '@/lib/features'

// Display-only exchange rate for the site's GBP/EUR toggle. The underlying
// fetch to the real FX API is cached for 24h (see lib/fx-rate.ts) — this
// route can be hit on every page load without that turning into a
// per-request external call.
export async function GET() {
  const rate = await getGbpToEurRate()
  // checkoutRate: the rate a guest is actually charged at when paying in EUR
  // (market rate + small margin). Only present when EUR checkout is on.
  const checkoutRate = EUR_CHECKOUT_ENABLED ? await getCheckoutEurRate() : null
  return NextResponse.json({ base: 'GBP', target: 'EUR', rate, checkoutRate })
}
