'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  // Owned here (rather than by the parent checkout page) so it sits
  // literally immediately above the Pay button, not separated by any other
  // form section — the last thing a guest does before paying.
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  async function handlePay() {
    if (!stripe || !elements || !agreedToTerms) return
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

      {/* Terms checkbox — immediately above Pay, nothing else in between.
          Sized and boxed deliberately larger/higher-contrast than a normal
          inline checkbox so it reads as a required final step, not a
          throwaway fine-print line. */}
      <label
        className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition-colors ${
          agreedToTerms ? 'border-orange bg-orange/5' : 'border-neutral-300 bg-neutral-50'
        }`}
      >
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-neutral-400 text-orange focus:ring-orange focus:ring-2"
        />
        <span className="text-sm font-medium text-dark leading-snug">
          {t.agreeToTermsPrefix}{' '}
          <Link href="/terms" target="_blank" className="text-orange underline hover:no-underline">
            {t.agreeToTermsLink}
          </Link>
        </span>
      </label>

      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || submitting || !stripe || !agreedToTerms}
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
