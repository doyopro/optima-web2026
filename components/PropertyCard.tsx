import Image from 'next/image'
import Link from 'next/link'
import { type Language, translations } from '@/lib/i18n'
import { type Property } from '@/lib/types'
import { getGuestyPropertyUrl } from '@/lib/guesty'

interface Props {
  property: Property
  lang: Language
}

export default function PropertyCard({ property, lang }: Props) {
  const t = translations[lang].properties
  const bedroomsLabel = property.bedrooms === 1 ? t.bedroom : t.bedrooms
  const bathroomsLabel = property.bathrooms === 1 ? t.bathroom : t.bathrooms
  const description = (lang === 'es' && property.description_es) || property.description || ''
  const bookingUrl = getGuestyPropertyUrl(property.guesty_listing_id)

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden">
      <Link href={`/villas/${property.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-dark shadow">
            £{property.price_per_night_gbp}
            <span className="text-xs font-normal text-dark/60"> {t.perNight}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5">
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
          <div className="flex items-center gap-3 text-xs text-dark/60 mb-3">
            <span>{property.bedrooms} {bedroomsLabel}</span>
            <span className="text-dark/30">·</span>
            <span>{property.bathrooms} {bathroomsLabel}</span>
            <span className="text-dark/30">·</span>
            <span>{property.guests_max} {t.guests}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <span className="text-orange text-sm">★</span>
            <span className="text-sm font-semibold text-dark">{property.rating.toFixed(1)}</span>
            <span className="text-xs text-dark/50">({property.reviews_count})</span>
          </div>
        </div>
      </Link>

      {/* Book Now — external link to the Guesty Booking Engine, opens in a new tab */}
      <div className="px-5 pb-5 pt-3">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-sm font-semibold text-white bg-orange hover:bg-orange/90 transition-colors rounded-lg py-2.5"
        >
          {t.bookNow} →
        </a>
      </div>
    </div>
  )
}
