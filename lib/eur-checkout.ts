// Server-only helpers for paying in EUR at the website checkout.
//
// The EUR price is fixed when the guest books: total_eur = round(total_gbp *
// rate * (1 + margin)), and the deposit is round(deposit_gbp * rate * (1 +
// margin)). The rate and both figures are stored in `eur_checkout_rates`, so
// the balance stays in euros at that same rate no matter how GBP/EUR moves
// afterwards. Guesty and all reports stay in GBP (the GBP equivalent of each
// payment is what gets registered there).
import { getGbpToEurRate } from '@/lib/fx-rate'

// Small cushion for rate movement between booking and the later balance
// payment. EUR_CHECKOUT_MARGIN_PCT=1 means +1%. Defaults to 1%.
function marginFraction(): number {
  const pct = Number(process.env.EUR_CHECKOUT_MARGIN_PCT ?? '1')
  return Number.isFinite(pct) && pct >= 0 && pct <= 10 ? pct / 100 : 0.01
}

/** The rate actually applied to a guest (market rate + margin), 6 decimals. */
export async function getCheckoutEurRate(): Promise<number> {
  const market = await getGbpToEurRate()
  return Math.round(market * (1 + marginFraction()) * 1e6) / 1e6
}

/** Whole euros — same rounding on server and in the UI so the numbers match. */
export function gbpToEur(amountGbp: number, rate: number): number {
  return Math.round(amountGbp * rate)
}
