'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type Language, translations } from '@/lib/i18n'
import { type Property } from '@/lib/types'
import { useCurrency } from '@/lib/CurrencyContext'
import { formatPrice } from '@/lib/currency'

interface Props {
  property: Property
  lang: Language
}

const SWIPE_THRESHOLD_PX = 40

export default function PropertyCard({ property, lang }: Props) {
  const t = translations[lang].properties
  const { currency, gbpToEurRate } = useCurrency()
  const bedroomsLabel = property.bedrooms === 1 ? t.bedroom : t.bedrooms
  const bathroomsLabel = property.bathrooms === 1 ? t.bathroom : t.bathrooms
  const description = (lang === 'es' && property.description_es) || property.description || ''

  const [imgIdx, setImgIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const images = property.images

  function goTo(next: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx((next + images.length) % images.length)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      setImgIdx((i) => (delta < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length))
    }
    touchStartX.current = null
  }

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden">
      <Link href={`/villas/${property.id}`} className="block">
        {/* Image carousel */}
        <div
          className="relative aspect-[4/3] overflow-hidden bg-neutral-100"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[imgIdx]}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => goTo(imgIdx - 1, e)}
                aria-label={t.carouselPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-dark" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => goTo(imgIdx + 1, e)}
                aria-label={t.carouselNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-dark" aria-hidden="true" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-dark shadow">
            <span className="text-xs font-normal text-dark/60">{t.fromPrice} </span>
            {formatPrice(property.price_per_night_gbp, currency, gbpToEurRate)}
            <span className="text-xs font-normal text-dark/60"> {t.perNight}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          {/* Location */}
          <p className="text-xs font-semibold uppercase tracking-wide text-orange mb-1">
            {property.location}
          </p>

          {/* Name */}
          <h3 className="text-lg font-bold text-dark mb-2 leading-snug group-hover:text-orange transition-colors">
            {property.name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-dark/60 leading-relaxed mb-3 line-clamp-2">{description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-dark/60">
            <span>{property.bedrooms} {bedroomsLabel}</span>
            <span className="text-dark/30">·</span>
            <span>{property.bathrooms} {bathroomsLabel}</span>
            <span className="text-dark/30">·</span>
            <span>{property.guests_max} {t.guests}</span>
          </div>
        </div>
      </Link>

      {/* Book Now — routes to the same villa detail page as clicking the
          name/photo (previously jumped straight to the external Guesty
          Booking Engine listing, which could show a shorter/different
          synced description — two routes to "the same villa" rendering
          different content). Now both entry points always hit the exact
          same component, so content can never diverge. Actual booking
          still happens via the page's own Book Now / Continue flow once
          dates are selected. */}
      <div className="px-5 pb-5 pt-3">
        <Link
          href={`/villas/${property.id}`}
          className="block w-full text-center text-sm font-semibold text-white bg-orange hover:bg-orange/90 transition-colors rounded-lg py-2.5"
        >
          {t.bookNow} →
        </Link>
      </div>
    </div>
  )
}
