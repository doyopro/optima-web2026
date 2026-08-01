'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { type Property } from '@/lib/types'
import { getGuestyPropertyUrl } from '@/lib/guesty'
import { getApproximateMapEmbedUrl } from '@/lib/map'
import { type BookedRange, rangeOverlapsBooking } from '@/lib/availability'
import DateRangePicker from '@/components/DateRangePicker'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

function formatShortDate(value: string, lang: string): string {
  if (!value) return ''
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

interface Props {
  params: Promise<{ id: string }>
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function VillaDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const { lang } = useLanguage()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => setProperty(d.property ?? null))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false))
  }, [id])

  // Availability comes from our own reservations data, not Guesty pricing —
  // this must keep working even while Guesty pricing is rate-limited.
  useEffect(() => {
    fetch(`/api/availability?propertyId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => setBookedRanges(d.bookedRanges ?? []))
      .catch(() => setBookedRanges([]))
  }, [id])

  const t = translations[lang]
  const description = (lang === 'es' && property?.description_es) || property?.description || ''

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse text-dark/40 text-lg">{t.properties.loading}</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">🏡</p>
        <p className="font-semibold text-dark">{t.errors.notFound}</p>
        <Link href="/villas" className="text-orange underline text-sm">{t.properties.viewAll}</Link>
      </div>
    )
  }

  const bookingUrl = getGuestyPropertyUrl(property.guesty_listing_id)
  const mapUrl = getApproximateMapEmbedUrl(property.latitude, property.longitude)
  const images = property.images
  const bedroomsLabel = property.bedrooms === 1 ? t.properties.bedroom : t.properties.bedrooms
  const bathroomsLabel = property.bathrooms === 1 ? t.properties.bathroom : t.properties.bathrooms

  const datesSelected = Boolean(fromDate && toDate)
  const datesBlocked = datesSelected && rangeOverlapsBooking(fromDate, toDate, bookedRanges)
  const canContinue = datesSelected && !datesBlocked

  function goToCheckout() {
    if (!canContinue) return
    router.push(`/villas/${id}/checkout?from=${fromDate}&to=${toDate}`)
  }

  function handleDateChange(from: string, to: string) {
    setFromDate(from)
    setToDate(to)
  }

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-cream pb-28 lg:pb-0">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-sm text-dark/50">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <Link href="/villas" className="hover:text-orange">{t.nav.villas}</Link>
            <span>›</span>
            <span className="text-dark">{property.name}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          {/* --- PHOTO GALLERY --- */}

          {/* Mobile: single-image carousel */}
          <div className="md:hidden relative aspect-video rounded-2xl overflow-hidden bg-neutral-200 shadow-md">
            {images.length > 0 && (
              <Image
                src={images[imgIdx] ?? images[0]}
                alt={property.name}
                fill
                className="object-cover"
                priority
              />
            )}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImgIdx(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow"
                >
                  →
                </button>
              </>
            )}
          </div>

          {/* Desktop: mosaic */}
          <div className="hidden md:block relative">
            {images.length === 0 ? (
              <div className="aspect-[21/9] rounded-2xl bg-neutral-200" />
            ) : images.length === 1 ? (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden block"
              >
                <Image src={images[0]} alt={property.name} fill className="object-cover" priority />
              </button>
            ) : (
              (() => {
                const secondaryImages = images.slice(1, 5)
                const secondaryGridClass =
                  secondaryImages.length === 1
                    ? 'grid-cols-1 grid-rows-1'
                    : secondaryImages.length === 2
                      ? 'grid-cols-1 grid-rows-2'
                      : secondaryImages.length === 3
                        ? 'grid-cols-1 grid-rows-3'
                        : 'grid-cols-2 grid-rows-2'

                return (
                  <div className="grid grid-cols-2 gap-2 h-[420px] rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      className="relative block h-full w-full"
                    >
                      <Image src={images[0]} alt={property.name} fill className="object-cover" priority />
                    </button>
                    <div className={`grid gap-2 h-full ${secondaryGridClass}`}>
                      {secondaryImages.map((img, i) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setGalleryOpen(true)}
                          className="relative block h-full w-full"
                        >
                          <Image src={img} alt={`${property.name} ${i + 2}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()
            )}

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="absolute bottom-4 right-4 bg-white text-dark text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-neutral-50 transition-colors"
              >
                {t.properties.showAllPhotos} ({images.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title + key stats */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange mb-1">
                  {property.location}
                </p>
                <h1 className="text-3xl font-bold text-dark mb-3">{property.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-dark/60 mb-4">
                  {property.type && (
                    <>
                      <span className="font-medium text-dark">{capitalize(property.type)}</span>
                      <span className="text-dark/30">·</span>
                    </>
                  )}
                  <span>{property.guests_max} {t.properties.guests}</span>
                  <span className="text-dark/30">·</span>
                  <span>{property.bedrooms} {bedroomsLabel}</span>
                  <span className="text-dark/30">·</span>
                  <span>{property.bathrooms} {bathroomsLabel}</span>
                </div>

                {/* Description */}
                <p className="text-dark/70 leading-relaxed">{description}</p>

                {/* Tourist license */}
                {property.vv_license && (
                  <p className="text-xs text-dark/40 mt-3">
                    {t.properties.touristLicense}: {property.vv_license}
                  </p>
                )}
              </div>

              {/* Availability — mobile only (desktop has it in the sticky sidebar) */}
              <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                <h2 className="text-lg font-bold text-dark mb-1">{t.availability.checkAvailability}</h2>
                {datesSelected && (
                  <p className="text-sm text-dark/60 mb-3">
                    {t.availability.checkIn} {formatShortDate(fromDate, lang)} · {t.availability.checkOut}{' '}
                    {formatShortDate(toDate, lang)}
                  </p>
                )}
                <div className="flex justify-center overflow-x-auto">
                  <DateRangePicker
                    lang={lang}
                    bookedRanges={bookedRanges}
                    from={fromDate}
                    to={toDate}
                    onChange={handleDateChange}
                  />
                </div>
                {datesBlocked && (
                  <p className="text-xs text-red-600 mt-2">{t.availability.datesUnavailable}</p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-lg font-bold text-dark mb-4">{t.properties.amenities}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-dark/70">
                      <span className="text-green">✓</span>
                      {a}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location map */}
              {mapUrl && (
                <div>
                  <h2 className="text-lg font-bold text-dark mb-4">{t.properties.approximateLocation}</h2>
                  <div className="rounded-2xl overflow-hidden border border-neutral-200 h-72">
                    <iframe
                      title={t.properties.approximateLocation}
                      src={mapUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-dark/40 mt-2">{t.properties.approximateLocationNote}</p>
                </div>
              )}
            </div>

            {/* Right: sticky booking sidebar — desktop only */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-dark">£{property.price_per_night_gbp}</span>
                  <span className="text-dark/50 text-sm">{t.properties.perNight}</span>
                </div>

                <p className="text-xs text-dark/40 mb-3">{t.properties.priceIndicative}</p>

                {datesSelected && (
                  <p className="text-xs font-semibold text-dark mb-2">
                    {formatShortDate(fromDate, lang)} → {formatShortDate(toDate, lang)}
                  </p>
                )}
                <div className="flex justify-center mb-3">
                  <DateRangePicker
                    lang={lang}
                    bookedRanges={bookedRanges}
                    from={fromDate}
                    to={toDate}
                    onChange={handleDateChange}
                  />
                </div>

                {datesBlocked && (
                  <p className="text-xs text-red-600 mb-3">{t.availability.datesUnavailable}</p>
                )}

                {canContinue ? (
                  <button
                    type="button"
                    onClick={goToCheckout}
                    className="block w-full text-center bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm"
                  >
                    {t.availability.proceedToBook}
                  </button>
                ) : (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm"
                  >
                    {t.properties.bookNow}
                  </a>
                )}

                <p className="text-xs text-center text-dark/40 mt-3">{t.properties.bookNowNote}</p>
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
              ← {t.nav.villas}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom booking bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4">
        <div>
          <span className="text-lg font-bold text-dark">£{property.price_per_night_gbp}</span>
          <span className="text-dark/50 text-xs"> {t.properties.perNight}</span>
        </div>
        {canContinue ? (
          <button
            type="button"
            onClick={goToCheckout}
            className="bg-orange text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-orange/90 transition-colors"
          >
            {t.availability.proceedToBook}
          </button>
        ) : (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-orange/90 transition-colors"
          >
            {t.properties.bookNow}
          </a>
        )}
      </div>

      {/* Gallery modal */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 overflow-y-auto"
          onClick={() => setGalleryOpen(false)}
        >
          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            aria-label={t.properties.closeGallery}
            className="fixed top-4 right-4 h-10 w-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-dark text-lg z-10"
          >
            ✕
          </button>
          <div
            className="max-w-4xl mx-auto py-16 px-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <div key={img} className="relative aspect-video rounded-xl overflow-hidden">
                <Image src={img} alt={`${property.name} ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer lang={lang} />
      <WhatsAppWidget villaName={property.name} lang={lang} />
    </>
  )
}
