'use client'

import { useState } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { type Language, translations } from '@/lib/i18n'
import { STRIPE_LIVE } from '@/lib/stripe-mode'
import { pushEvent, runOnce } from '@/lib/analytics'

// BETA — internal testing only. TEST-MODE-ONLY, dedicated publishable key —
// never the site's live key (which doesn't even exist as a NEXT_PUBLIC var
// today). Publishable keys are always safe to expose client-side by design,
// but this still hard-refuses to load anything that isn't a test key, so a
// misconfigured env var can never let this beta form process a real card.
// Test by default; live only when NEXT_PUBLIC_STRIPE_MODE=live (lib/stripe-mode.ts).
// The key prefix must match the mode, so a test key can't run in live mode or
// the reverse. (Each NEXT_PUBLIC_ var is referenced literally so Next inlines it.)
const publishableKey = STRIPE_LIVE
  ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')
  : (process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY ?? '')
const isValidKey = publishableKey.startsWith(STRIPE_LIVE ? 'pk_live_' : 'pk_test_')
const stripePromise = isValidKey ? loadStripe(publishableKey) : null

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
  propertyName?: string
}

// ANALYTICS — exactly ONE 'Purchase' dataLayer push per RESERVATION (not per
// payment). GTM (container GTM-MP58Q26) maps this single event to the Google
// Ads conversion and to GA4 'purchase'; do NOT add a second push.
//
// The reservation is created by the Stripe webhook a moment AFTER the card is
// charged, so the push waits for it: /api/checkout/purchase-status reports the
// reservation code (used as transaction_id) and the amount Stripe really
// charged (deposit or full — never trusted from the browser). If the booking
// fails and is auto-refunded, nothing is pushed. runOnce() guarantees a
// reload or a retry can never count the same reservation twice.
//
// Balance payments made later from the guest portal never go through this
// component, so they do not fire Purchase.
//
// currency is always GBP (the PaymentIntent is created in GBP); the Google
// Ads account is in EUR, so the Ads tag must take `currency` from this event
// for Google to convert the value.
async function reportPurchaseWhenBooked(paymentIntentId: string, propertyName: string): Promise<void> {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`/api/checkout/purchase-status?pi=${encodeURIComponent(paymentIntentId)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const d = await res.json()
        if (d.status === 'refunded') return
        if (d.status === 'ready') {
          runOnce(`purchase:${d.transactionId}`, () =>
            pushEvent({
              event: 'Purchase',
              transaction_id: d.transactionId,
              value: d.value,
              currency: d.currency,
              payment_type: d.paymentChoice, // 'deposit' | 'full'
              items: [{ item_id: d.propertyId, item_name: propertyName, price: d.value, quantity: 1 }],
            }),
          )
          return
        }
      }
    } catch {
      // network blip — keep trying until the deadline
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  console.error('[checkout] reservation not confirmed in time; Purchase event not sent for', paymentIntentId)
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
        void reportPurchaseWhenBooked(result.paymentIntent.id, booking.propertyName ?? booking.propertyId)
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
      {!STRIPE_LIVE && <p className="text-[11px] text-dark/40 text-center">{t.testCardHint}</p>}
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
