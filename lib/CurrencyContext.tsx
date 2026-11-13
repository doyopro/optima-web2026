'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Currency, getCurrency, setCurrency as persistCurrency } from './currency'

// Mirrors lib/fx-rate.ts's own fallback — used only for the brief window
// before /api/fx-rate responds on first load.
const INITIAL_GBP_TO_EUR_RATE = 1.17

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (currency: Currency) => void
  gbpToEurRate: number
  /** Rate guests are actually charged at when paying in EUR (null while EUR checkout is off). */
  checkoutRate: number | null
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('GBP')
  const [gbpToEurRate, setGbpToEurRate] = useState<number>(INITIAL_GBP_TO_EUR_RATE)
  const [checkoutRate, setCheckoutRate] = useState<number | null>(null)

  useEffect(() => {
    setCurrencyState(getCurrency())

    fetch('/api/fx-rate')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.rate === 'number' && d.rate > 0) setGbpToEurRate(d.rate)
        if (typeof d.checkoutRate === 'number' && d.checkoutRate > 0) setCheckoutRate(d.checkoutRate)
      })
      .catch(() => {
        // Keep the initial fallback rate — better than a broken toggle.
      })
  }, [])

  function setCurrency(next: Currency) {
    persistCurrency(next)
    setCurrencyState(next)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, gbpToEurRate, checkoutRate }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return ctx
}
