'use client'

import { useEffect, useState, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { type Property } from '@/lib/types'
import { LOCATIONS } from '@/lib/mock-data'
import PropertyCard from '@/components/PropertyCard'
import PropertySkeleton from '@/components/PropertySkeleton'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

type SortKey = 'price_asc' | 'price_desc' | 'rating' | 'reviews'

// Checkbox value must match the real string stored in properties.amenities (Supabase).
const AMENITY_FILTERS = [
  { value: 'Hot tub', labelKey: 'amenityHotTub' as const },
  { value: 'Air conditioning', labelKey: 'amenityAirConditioning' as const },
  { value: 'Sea view', labelKey: 'amenitySeaView' as const },
  { value: 'Ping pong table', labelKey: 'amenityTableTennis' as const },
  { value: 'Pool table', labelKey: 'amenityPoolTable' as const },
  { value: 'Private pool', labelKey: 'amenityPrivatePool' as const },
]

export default function VillasPage() {
  const { lang } = useLanguage()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [location, setLocation] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [guests, setGuests] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('rating')
  const [filtersOpen, setFiltersOpen] = useState(false)

  function toggleAmenity(value: string) {
    setAmenities((prev) => (prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]))
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/villas')
      const data = await res.json()
      let props: Property[] = data.properties ?? []

      // Client-side filtering (Guesty doesn't support our filter params)
      if (location) props = props.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()))
      if (minPrice) props = props.filter((p) => (p.price_per_night_gbp ?? 0) >= Number(minPrice))
      if (maxPrice) props = props.filter((p) => (p.price_per_night_gbp ?? 0) <= Number(maxPrice))
      if (bedrooms) props = props.filter((p) => (p.bedrooms ?? 0) >= Number(bedrooms))
      if (guests) props = props.filter((p) => (p.guests_max ?? 0) >= Number(guests))
      if (bathrooms) props = props.filter((p) => (p.bathrooms ?? 0) >= Number(bathrooms))
      if (amenities.length) {
        props = props.filter((p) => amenities.every((a) => (p.amenities ?? []).includes(a)))
      }

      setProperties(props)
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [location, minPrice, maxPrice, bedrooms, guests, bathrooms, amenities])

  useEffect(() => {
    load()
  }, [load])

  function reset() {
    setLocation('')
    setMinPrice('')
    setMaxPrice('')
    setBedrooms('')
    setGuests('')
    setBathrooms('')
    setAmenities([])
  }

  const sorted = [...properties].sort((a, b) => {
    if (sort === 'price_asc') return a.price_per_night_gbp - b.price_per_night_gbp
    if (sort === 'price_desc') return b.price_per_night_gbp - a.price_per_night_gbp
    if (sort === 'rating') return b.rating - a.rating
    return b.reviews_count - a.reviews_count
  })

  const t = translations[lang].properties

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-2">
          {t.location}
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:border-orange focus:outline-none"
        >
          <option value="">{t.allLocations}</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-2">
          {t.priceRange}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t.minPrice}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
          />
          <input
            type="number"
            placeholder={t.maxPrice}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-2">
          {t.minBedrooms}
        </label>
        <select
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:border-orange focus:outline-none"
        >
          <option value="">{t.anyBedrooms}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-2">
          {t.minBathrooms}
        </label>
        <select
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:border-orange focus:outline-none"
        >
          <option value="">{t.anyBathrooms}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </div>

      {/* Guests */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-2">
          {t.minGuests}
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:border-orange focus:outline-none"
        >
          <option value="">{t.anyGuests}</option>
          {[1, 2, 4, 6, 8, 10].map((n) => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-2">
          {t.amenities}
        </label>
        <div className="space-y-2">
          {AMENITY_FILTERS.map(({ value, labelKey }) => (
            <label key={value} className="flex items-center gap-2 text-sm text-dark/70 cursor-pointer">
              <input
                type="checkbox"
                checked={amenities.includes(value)}
                onChange={() => toggleAmenity(value)}
                className="rounded border-neutral-300 text-orange focus:ring-orange"
              />
              {t[labelKey]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={load}
          className="flex-1 bg-orange text-white text-sm font-semibold py-2 rounded-lg hover:bg-orange/90 transition-colors"
        >
          {t.apply}
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-4 border border-neutral-200 text-sm text-dark/60 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          {t.reset}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-dark">
                {loading ? t.loading : `${sorted.length} ${t.results}`}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="md:hidden flex items-center gap-2 border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium text-dark bg-white"
              >
                ⚙ {t.filters}
              </button>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="border border-neutral-200 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:border-orange"
              >
                <option value="rating">{t.sortBy}: {t.sortRating}</option>
                <option value="price_asc">{t.sortPrice} ↑</option>
                <option value="price_desc">{t.sortPrice} ↓</option>
                <option value="reviews">{t.sortReviews}</option>
              </select>
            </div>
          </div>

          {/* Mobile filter panel */}
          {filtersOpen && (
            <div className="md:hidden bg-white rounded-2xl p-6 mb-6 shadow-md">
              <FilterPanel />
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar filters — desktop */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <h2 className="font-bold text-dark mb-5">{t.filters}</h2>
                <FilterPanel />
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <PropertySkeleton key={i} />)}
                </div>
              ) : sorted.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-2xl mb-3">🏡</p>
                  <p className="text-dark font-semibold mb-1">{t.noResults}</p>
                  <p className="text-dark/50 text-sm">{t.tryAgain}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sorted.map((p) => (
                    <PropertyCard key={p.id} property={p} lang={lang} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
