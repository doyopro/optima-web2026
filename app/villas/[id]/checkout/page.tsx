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
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface Props {
  params: Promise<{ id: string }>
}

interface PricingResult {
  available: boolean
  currency: string
  nights: number
  totalPrice: number
  nightlyAverage: number
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

  const checkIn = searchParams.get('from') ?? ''
  const checkOut = searchParams.get('to') ?? ''
  const guests = searchParams.get('guests') ?? '2'

  const [property, setProperty] = useState<Property | null>(null)
  const [loadingProperty, setLoadingProperty] = useState(true)

  const [pricing, setPricing] = useState<PricingResult | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(false)
  const [pricingError, setPricingError] = useState(false)

  const [paymentChoice, setPaymentChoice] = useState<'deposit' | 'full'>('full')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => setProperty(d.property ?? null))
      .catch(() => setProperty(null))
      .finally(() => setLoadingProperty(false))
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

              {/* Stay details */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                <h3 className="font-bold text-dark mb-4">{t.checkout.stayDetails}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1">{t.checkout.checkIn}</p>
                    <p className="text-dark font-medium">{formatDate(checkIn, lang)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1">{t.checkout.checkOut}</p>
                    <p className="text-dark font-medium">{formatDate(checkOut, lang)}</p>
                  </div>
                </div>
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

              {/* Payment option */}
              {paymentOptions && pricing?.available && (
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

                <div className="mt-4 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-5 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange/10 text-orange">
                    🔒
                  </div>
                  <p className="font-semibold text-dark text-sm mb-1">{t.checkout.paymentComingSoon}</p>
                  <p className="text-xs text-dark/50 leading-relaxed">{t.checkout.paymentComingSoonDesc}</p>
                </div>

                {pricing?.available && paymentOptions && (
                  <div className="flex items-baseline justify-between mt-5 mb-4">
                    <span className="text-sm text-dark/60">{t.checkout.amountToPay}</span>
                    <span className="text-2xl font-bold text-dark">£{amountDueToday.toFixed(0)}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled
                  className="w-full bg-neutral-300 text-white font-semibold py-3 rounded-lg cursor-not-allowed text-sm"
                >
                  {t.checkout.notYetAvailable}
                </button>

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
