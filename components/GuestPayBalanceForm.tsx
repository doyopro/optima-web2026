'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { type Language, translations } from '@/lib/i18n'

// Same TEST-MODE-ONLY publishable key as the new-booking checkout
// (components/StripeCheckoutForm.tsx) — see that file for why this refuses
// to load anything but a test key.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY ?? ''
const isValidTestKey = publishableKey.startsWith('pk_test_')
const stripePromise = isValidTestKey ? loadStripe(publishableKey) : null

interface Props {
  lang: Language
  reservationId: string
  balanceDueGbp: number
  onSuccess: () => void
}

function PayBalanceButton({ lang, reservationId, balanceDueGbp, onSuccess }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const t = translations[lang].guestPortal.payments

  const [amount, setAmount] = useState(() => balanceDueGbp.toFixed(2))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    if (!stripe || !elements) return

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > balanceDueGbp + 0.005) {
      setError(t.payBalanceInvalidAmount)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/guest/pay-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, amount: numericAmount }),
      })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || 'Failed to start payment')
      }

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card details not ready')

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      })

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed')
      }

      if (result.paymentIntent?.status === 'succeeded') {
        onSuccess()
      } else {
        throw new Error(`Unexpected payment status: ${result.paymentIntent?.status}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.payBalanceError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1.5">
          {t.payBalanceLabel}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-dark/50">£</span>
          <input
            type="number"
            min={0.01}
            max={balanceDueGbp}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 pl-7 pr-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-orange/40"
          />
        </div>
        <p className="text-[11px] text-dark/40 mt-1">
          {t.payBalanceHint.replace('{amount}', `£${balanceDueGbp.toFixed(2)}`)}
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 px-3 py-3">
        <CardElement options={{ style: { base: { fontSize: '14px' } } }} />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={submitting || !stripe}
        className="w-full bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? t.payBalanceSubmitting : t.payBalanceSubmit}
      </button>
    </div>
  )
}

export default function GuestPayBalanceForm(props: Props) {
  const t = translations[props.lang].checkout

  if (!stripePromise) {
    return <p className="text-xs text-red-600 text-center py-4">{t.stripeNotConfigured}</p>
  }

  return (
    <Elements stripe={stripePromise}>
      <PayBalanceButton {...props} />
    </Elements>
  )
}
