'use client'

import { Suspense, use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { type Property } from '@/lib/types'
import { getGuestyPropertyUrl } from '@/lib/guesty'
import { getPaymentOptions } from '@/lib/booking'
import { type BookedRange, rangeOverlapsBooking } from '@/lib/availability'
import DateRangePicker from '@/components/DateRangePicker'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import StripeCheckoutForm from '@/components/StripeCheckoutForm'

interface Props {
  params: Promise<{ id: string }>
}

interface PricingResult {
  available: boolean
  currency: string
  nights: number
  totalPrice: number
  nightlyAverage: number
  minNights: number
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34617387171'

function formatDate(dateStr: string, lang: string): string {
  return new Date(dateStr).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CheckoutContent({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLanguage()

  const initialCheckIn = searchParams.get('from') ?? ''
  const initialCheckOut = searchParams.get('to') ?? ''
  const guests = searchParams.get('guests') ?? '2'

  // Editable in place (task: let guests fix dates without leaving
  // checkout) rather than fixed values read once from the URL — every
  // downstream check (pricing, availability, minStay) re-runs off this
  // state, not the original query params.
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([])

  const [property, setProperty] = useState<Property | null>(null)
  const [loadingProperty, setLoadingProperty] = useState(true)

  const [pricing, setPricing] = useState<PricingResult | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(false)
  const [pricingError, setPricingError] = useState(false)

  const [paymentChoice, setPaymentChoice] = useState<'deposit' | 'full'>('full')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [paymentSucceeded, setPaymentSucceeded] = useState(false)

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => setProperty(d.property ?? null))
      .catch(() => setProperty(null))
      .finally(() => setLoadingProperty(false))
  }, [id])

  // Same source as the villa detail page's own picker — our reservations
  // data, not Guesty pricing, so it keeps working even if Guesty pricing is
  // rate-limited.
  useEffect(() => {
    fetch(`/api/availability?propertyId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => setBookedRanges(d.bookedRanges ?? []))
      .catch(() => setBookedRanges([]))
  }, [id])

  useEffect(() => {
    if (!property?.guesty_listing_id || !checkIn || !checkOut) return
    setLoadingPricing(true)
    setPricingError(false)
    const url = `/api/guesty/pricing?listingId=${encodeURIComponent(property.guesty_listing_id)}&checkIn=${checkIn}&checkOut=${checkOut}`
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('Pricing fetch failed')
        return r.json()
      })
      .then((d) => setPricing(d))
      .catch(() => setPricingError(true))
      .finally(() => setLoadingPricing(false))
  }, [property?.guesty_listing_id, checkIn, checkOut])

  function handleDateChange(from: string, to: string) {
    setCheckIn(from)
    setCheckOut(to)
    router.replace(`/villas/${id}/checkout?from=${from}&to=${to}&guests=${guests}`, { scroll: false })
  }

  const datesBlocked = Boolean(checkIn && checkOut && rangeOverlapsBooking(checkIn, checkOut, bookedRanges))

  const t = translations[lang]

  if (loadingProperty) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse text-dark/40 text-lg">{t.checkout.loading}</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">🏡</p>
        <p className="font-semibold text-dark">{t.checkout.notFound}</p>
        <Link href="/villas" className="text-orange underline text-sm">{t.properties.viewAll}</Link>
      </div>
    )
  }

  if (!checkIn || !checkOut) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-2xl">📅</p>
        <p className="font-semibold text-dark">{t.checkout.missingDates}</p>
        <Link href={`/villas/${id}`} className="text-orange underline text-sm">{t.checkout.backToVilla}</Link>
      </div>
    )
  }

  const bookingUrl = getGuestyPropertyUrl(property.guesty_listing_id)
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    lang === 'es'
      ? `Hola, quiero reservar ${property.name} del ${checkIn} al ${checkOut}`
      : `Hi, I'd like to book ${property.name} from ${checkIn} to ${checkOut}`,
  )}`

  // Confirmed real cause of a failed beta test: Guesty rejects reservation
  // creation outright (422 "minNights or maxNights terms not applicable")
  // for a stay shorter than the listing's minimum — but nothing here
  // checked that before now, so a guest could pay via Stripe for a stay
  // Guesty would then refuse to book. Block payment before that can happen.
  const stayTooShort = Boolean(pricing?.available && pricing.minNights > 0 && pricing.nights < pricing.minNights)

  const paymentOptions = pricing ? getPaymentOptions(checkIn, pricing.totalPrice) : null
  const amountDueToday =
    paymentOptions == null
      ? 0
      : paymentChoice === 'deposit' && paymentOptions.depositAllowed
        ? paymentOptions.depositAmount
        : paymentOptions.fullAmount

  return (
    <>
      <Toaster position="top-center" />

      {/* Visible TEST MODE banner removed to preview the final production
          look — Stripe itself is still running in test mode (see
          lib/stripe-server.ts / components/StripeCheckoutForm.tsx, both
          untouched: they still hard-refuse to load anything that isn't a
          sk_test_/pk_test_ key). This is a visual-only change. */}
      <div className="min-h-screen bg-cream">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-sm text-dark/50">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <Link href={`/villas/${id}`} className="hover:text-orange">{property.name}</Link>
            <span>›</span>
            <span className="text-dark">{t.checkout.title}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-dark mb-6">{t.checkout.title}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Villa summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex gap-4">
                <div className="relative h-20 w-24 sm:h-24 sm:w-32 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                  {property.images[0] && (
                    <Image
                      src={property.images[0]}
                      alt={property.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange mb-1">
                    {property.location}
                  </p>
                  <h2 className="font-bold text-dark truncate">{property.name}</h2>
                  <p className="text-sm text-dark/60 mt-1">
                    {property.bedrooms} {property.bedrooms === 1 ? t.properties.bedroom : t.properties.bedrooms} ·{' '}
                    {property.bathrooms} {property.bathrooms === 1 ? t.properties.bathroom : t.properties.bathrooms} ·{' '}
                    {guests} {t.checkout.guests}
                  </p>
                </div>
              </div>

              {/* Stay details — dates are editable here directly (reuses
                  the same date-range picker as the villa page) so a guest
                  who picked the wrong dates doesn't have to leave checkout
                  to fix them; every check below (pricing, availability,
                  minStay) re-runs against whatever's selected here. */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                <h3 className="font-bold text-dark mb-1">{t.checkout.stayDetails}</h3>
                <p className="text-sm text-dark/60 mb-3">
                  {t.checkout.checkIn} {formatDate(checkIn, lang)} · {t.checkout.checkOut} {formatDate(checkOut, lang)}
                </p>
                <div className="flex justify-center overflow-x-auto">
                  <DateRangePicker
                    lang={lang}
                    bookedRanges={bookedRanges}
                    from={checkIn}
                    to={checkOut}
                    onChange={handleDateChange}
                  />
                </div>
                {datesBlocked && (
                  <p className="text-xs text-red-600 mt-2">{t.availability.datesUnavailable}</p>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                <h3 className="font-bold text-dark mb-4">{t.checkout.priceBreakdown}</h3>
                {loadingPricing ? (
                  <p className="text-sm text-dark/50 animate-pulse">{t.checkout.loadingPricing}</p>
                ) : pricingError ? (
                  <p className="text-sm text-red-600">{t.checkout.pricingError}</p>
                ) : !pricing || !pricing.available ? (
                  <p className="text-sm text-red-600">{t.checkout.unavailable}</p>
                ) : stayTooShort ? (
                  <p className="text-sm text-red-600">
                    {t.checkout.minStayNotMet.replace('{min}', String(pricing.minNights)).replace('{nights}', String(pricing.nights))}
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-dark/70">
                      <span>{pricing.nights} {pricing.nights === 1 ? t.checkout.night : t.checkout.nights}</span>
                      <span>£{pricing.nightlyAverage.toFixed(0)} {t.checkout.pricePerNightAvg.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-neutral-100 font-bold text-dark">
                      <span>{t.checkout.totalPrice}</span>
                      <span>£{pricing.totalPrice.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment option — hidden entirely (not just the pay button)
                  when minStay isn't met, so the whole payment area reads
                  as consistently blocked rather than partially normal. */}
              {paymentOptions && pricing?.available && !stayTooShort && (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                  <h3 className="font-bold text-dark mb-4">{t.checkout.paymentOption}</h3>
                  <div className="space-y-3">
                    {paymentOptions.depositAllowed && (
                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                          paymentChoice === 'deposit' ? 'border-orange bg-orange/5' : 'border-neutral-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment-choice"
                          checked={paymentChoice === 'deposit'}
                          onChange={() => setPaymentChoice('deposit')}
                          className="mt-1 text-orange focus:ring-orange"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-dark">{t.checkout.payDeposit}</span>
                            <span className="font-bold text-dark">£{paymentOptions.depositAmount.toFixed(0)}</span>
                          </div>
                          <p className="text-xs text-dark/50 mt-1">{t.checkout.payDepositDesc}</p>
                          {paymentOptions.balanceDueDate && (
                            <p className="text-xs text-dark/50 mt-1">
                              {t.checkout.dueBefore} {formatDate(paymentOptions.balanceDueDate, lang)}: £{paymentOptions.depositBalanceAmount.toFixed(0)}
                            </p>
                          )}
                        </div>
                      </label>
                    )}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        paymentChoice === 'full' ? 'border-orange bg-orange/5' : 'border-neutral-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-choice"
                        checked={paymentChoice === 'full'}
                        onChange={() => setPaymentChoice('full')}
                        className="mt-1 text-orange focus:ring-orange"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-dark">{t.checkout.payInFull}</span>
                          <span className="font-bold text-dark">£{paymentOptions.fullAmount.toFixed(0)}</span>
                        </div>
                        <p className="text-xs text-dark/50 mt-1">{t.checkout.payInFullDesc}</p>
                      </div>
                    </label>
                    {!paymentOptions.depositAllowed && (
                      <p className="text-xs text-dark/40">{t.checkout.depositUnavailableNote}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Guest details */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                <h3 className="font-bold text-dark mb-4">{t.checkout.guestDetails}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                      {t.checkout.fullName}
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                        {t.checkout.email}
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                        {t.checkout.phone}
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: payment placeholder — sticky on desktop */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 sticky top-6">
                <h3 className="font-bold text-dark mb-1">{t.checkout.paymentSectionTitle}</h3>

                {paymentSucceeded && (
                  <div className="mt-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      ✓
                    </div>
                    <p className="font-semibold text-dark text-sm mb-1">{t.checkout.testPaymentSucceeded}</p>
                    <p className="text-xs text-dark/50 leading-relaxed">{t.checkout.testPaymentSucceededDesc}</p>
                  </div>
                )}

                {pricing?.available && paymentOptions && !stayTooShort && (
                  <div className="flex items-baseline justify-between mt-5 mb-4">
                    <span className="text-sm text-dark/60">{t.checkout.amountToPay}</span>
                    <span className="text-2xl font-bold text-dark">£{amountDueToday.toFixed(0)}</span>
                  </div>
                )}

                {stayTooShort && (
                  <p className="text-sm text-red-600 mt-4">
                    {t.checkout.minStayNotMet.replace('{min}', String(pricing?.minNights ?? '')).replace('{nights}', String(pricing?.nights ?? ''))}
                  </p>
                )}

                {!paymentSucceeded && !stayTooShort && pricing?.available && paymentOptions && property.guesty_listing_id && (
                  <StripeCheckoutForm
                    lang={lang}
                    disabled={!guestName || !guestEmail}
                    booking={{
                      amountGbp: amountDueToday,
                      propertyId: id,
                      guestyListingId: property.guesty_listing_id,
                      checkIn,
                      checkOut,
                      paymentChoice,
                      guestName,
                      guestEmail,
                      guestPhone,
                      totalPrice: pricing.totalPrice,
                    }}
                    onSuccess={() => setPaymentSucceeded(true)}
                  />
                )}

                {/* "Book via our booking partner" is a genuine-error fallback
                    only — pricing failed to load, dates are unavailable, or
                    minStay isn't met. It must never show up as a visible
                    alternative during a normal, working checkout. */}
                {!paymentSucceeded && (pricingError || stayTooShort || (pricing && !pricing.available)) && (
                  <>
                    <p className="text-xs text-dark/40 mt-4 leading-relaxed">{t.checkout.contactToBookNote}</p>
                    <div className="flex flex-col gap-2 mt-3">
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center border border-orange text-orange font-semibold py-2.5 rounded-lg hover:bg-orange/5 transition-colors text-sm"
                      >
                        {t.checkout.goToGuesty}
                      </a>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2 mt-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center text-dark/60 hover:text-orange transition-colors text-sm"
                  >
                    {t.checkout.contactUs}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="mt-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-dark/50 hover:text-orange transition-colors"
            >
              ← {t.checkout.backToVilla}
            </button>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget villaName={property.name} lang={lang} />
    </>
  )
}

export default function CheckoutPage({ params }: Props) {
  return (
    <Suspense>
      <CheckoutContent params={params} />
    </Suspense>
  )
}
