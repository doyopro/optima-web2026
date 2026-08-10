// Display-only currency toggle. Every real charge (Stripe) and every real
// price source (Guesty) stays in GBP untouched — this only affects what
// figure gets shown to a browsing guest.

export type Currency = 'GBP' | 'EUR'

const STORAGE_KEY = 'currency'

export function getCurrency(): Currency {
  if (typeof window === 'undefined') return 'GBP'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'EUR' ? 'EUR' : 'GBP'
}

export function setCurrency(currency: Currency): void {
  localStorage.setItem(STORAGE_KEY, currency)
}

export function currencySymbol(currency: Currency): string {
  return currency === 'EUR' ? '€' : '£'
}

export function convertFromGbp(amountGbp: number, currency: Currency, gbpToEurRate: number): number {
  return currency === 'EUR' ? amountGbp * gbpToEurRate : amountGbp
}

/** e.g. "£120" or "€138" — rounded to the nearest whole unit, same as the site's existing £ labels. */
export function formatPrice(amountGbp: number, currency: Currency, gbpToEurRate: number): string {
  const value = convertFromGbp(amountGbp, currency, gbpToEurRate)
  return `${currencySymbol(currency)}${Math.round(value)}`
}
