'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { type Language, translations } from '@/lib/i18n'

// BETA — internal testing only. TEST-MODE-ONLY, dedicated publishable key —
// never the site's live key (which doesn't even exist as a NEXT_PUBLIC var
// today). Publishable keys are always safe to expose client-side by design,
// but this still hard-refuses to load anything that isn't a test key, so a
// misconfigured env var can never let this beta form process a real card.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY ?? ''
const isValidTestKey = publishableKey.startsWith('pk_test_')
const stripePromise = isValidTestKey ? loadStripe(publishableKey) : null

interface BookingDetails {
  amountGbp: number
  propertyId: string
  guestyListingId: string
  checkIn: string
  checkOut: string
  paymentChoice: 'deposit' | 'full'
  guestName: string
  guestEmail: string
  guestPhone: string
  totalPrice: number
}

interface Props {
  lang: Language
  booking: BookingDetails
  disabled: boolean
  onSuccess: () => void
}

function PayButton({ lang, booking, disabled, onSuccess }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const t = translations[lang].checkout
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || 'Failed to start payment')
      }

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card details not ready')

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: booking.guestName, email: booking.guestEmail },
        },
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
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-neutral-200 px-3 py-3">
        <CardElement options={{ style: { base: { fontSize: '14px' } } }} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || submitting || !stripe}
        className="w-full bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? t.processingPayment : t.payNow}
      </button>
      <p className="text-[11px] text-dark/40 text-center">{t.testCardHint}</p>
    </div>
  )
}

export default function StripeCheckoutForm(props: Props) {
  const t = translations[props.lang].checkout

  if (!stripePromise) {
    return (
      <p className="text-xs text-red-600 text-center py-4">
        {t.stripeNotConfigured}
      </p>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PayButton {...props} />
    </Elements>
  )
}
