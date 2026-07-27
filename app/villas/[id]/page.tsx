'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { type Language, translations, getLanguage } from '@/lib/i18n'
import { type Property, type Availability } from '@/lib/types'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface Props {
  params: Promise<{ id: string }>
}

export default function VillaDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const [lang, setLang] = useState<Language>('en')
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)

  // Booking widget state
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    setLang(getLanguage())
  }, [])

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => setProperty(d.property ?? null))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false))
  }, [id])

  async function checkAvailability() {
    if (!property || !checkIn || !checkOut) return
    setChecking(true)
    setAvailability(null)
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ villa_id: property.id, check_in: checkIn, check_out: checkOut }),
      })
      const data = await res.json()
      setAvailability(data)
    } finally {
      setChecking(false)
    }
  }

  const t = translations[lang]
  const today = new Date().toISOString().split('T')[0]

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

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-cream">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Gallery + Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-200 shadow-md">
                <Image
                  src={property.images[imgIdx] ?? property.images[0]}
                  alt={property.name}
                  fill
                  className="object-cover"
                  priority
                />
                {property.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {property.images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgIdx(i)}
                        className={`h-2 w-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
                {property.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImgIdx((i) => (i - 1 + property.images.length) % property.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => setImgIdx((i) => (i + 1) % property.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow"
                    >
                      →
                    </button>
                  </>
                )}
              </div>

              {/* Title */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange mb-1">
                  {property.location}
                </p>
                <h1 className="text-3xl font-bold text-dark mb-3">{property.name}</h1>
                <div className="flex items-center gap-4 text-sm text-dark/60 mb-4">
                  <span>{property.bedrooms} {property.bedrooms === 1 ? t.properties.bedroom : t.properties.bedrooms}</span>
                  <span>·</span>
                  <span>{property.bathrooms} {property.bathrooms === 1 ? t.properties.bathroom : t.properties.bathrooms}</span>
                  <span>·</span>
                  <span>{property.guests_max} {t.properties.guests}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <span className="text-orange">★</span>
                    {property.rating} ({property.reviews_count} {t.properties.reviews})
                  </span>
                </div>
                <p className="text-dark/70 leading-relaxed">{property.description}</p>
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
            </div>

            {/* Right: Booking widget */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-dark">£{property.price_per_night_gbp}</span>
                  <span className="text-dark/50 text-sm">{t.properties.perNight}</span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                      {t.search.from}
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(e) => { setCheckIn(e.target.value); setAvailability(null) }}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                      {t.search.to}
                    </label>
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => { setCheckOut(e.target.value); setAvailability(null) }}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={!checkIn || !checkOut || checking}
                  className="w-full bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50 mb-4 text-sm"
                >
                  {checking ? t.availability.checking : t.properties.bookNow}
                </button>

                {/* Availability result */}
                {availability && (
                  <div className={`rounded-lg p-3 text-sm text-center ${availability.available ? 'bg-green/20 text-dark' : 'bg-red-50 text-red-700'}`}>
                    {availability.available ? (
                      <>
                        <p className="font-semibold mb-1">✓ {t.availability.available}</p>
                        <p className="text-dark/60">
                          {nights} {nights === 1 ? t.properties.night : t.properties.nights} · {t.properties.totalPrice}: <span className="font-bold text-dark">£{availability.price_total.toLocaleString()}</span>
                        </p>
                      </>
                    ) : (
                      <p>{t.availability.unavailable}</p>
                    )}
                  </div>
                )}

                {!checkIn || !checkOut ? (
                  <p className="text-xs text-center text-dark/40 mt-3">{t.availability.selectDates}</p>
                ) : null}
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

      <Footer lang={lang} />
      <WhatsAppWidget villaName={property.name} lang={lang} />
    </>
  )
}
