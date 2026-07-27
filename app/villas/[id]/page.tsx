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
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface Props {
  params: Promise<{ id: string }>
}

export default function VillaDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const { lang } = useLanguage()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => setProperty(d.property ?? null))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false))
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
                <p className="text-dark/70 leading-relaxed">{description}</p>
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

                <p className="text-xs text-dark/40 mb-4">{t.properties.priceIndicative}</p>

                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm"
                >
                  {t.properties.bookNow}
                </a>

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

      <Footer lang={lang} />
      <WhatsAppWidget villaName={property.name} lang={lang} />
    </>
  )
}
