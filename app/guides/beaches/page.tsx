'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface BeachRow {
  id: string
  name_en: string
  name_es: string
  description_en: string
  description_es: string
  location: string
  distance_km: string | number
  sand_type: string
  difficulty: number
  beach_type: Record<string, boolean>
  amenities: Record<string, boolean>
  image_url: string | null
  rating: string | number
}

type FilterKey = 'all' | 'family' | 'surfer' | 'scenic' | 'secluded'

const FILTERS: FilterKey[] = ['all', 'family', 'surfer', 'scenic', 'secluded']

// beach_type keys observed in Supabase that map onto each filter bucket.
const FILTER_KEYS: Record<Exclude<FilterKey, 'all'>, string[]> = {
  family: ['family', 'children', 'toddlers', 'calm'],
  surfer: ['surfer', 'active', 'windsurfing'],
  scenic: ['scenic', 'pristine', 'photography', 'unique'],
  secluded: ['secluded', 'wild', 'adventurous'],
}

// image_url is null for every row today — fall back to a local image keyed
// by beach name until real photos are uploaded to Supabase.
const FALLBACK_IMAGE: Record<string, string> = {
  'Playa de Papagayo': '/lanzarote4.jpg',
  'Playa de Famara': '/lanzarote9.jpg',
  'Playa Dorada': '/lanzarote3.jpg',
  'Playa Flamingo': '/lanzarote6.jpg',
  'Playa Mujeres': '/lanzarote4.jpg',
  'Playa Grande': '/lanzarote13.jpg',
  'Playa de las Conchas': '/lanzarote14.jpg',
  'Caletón Blanco': '/lanzarote16.jpg',
  'Playa de la Cantería': '/lanzarote17.jpg',
  'Playa Blanca Beach': '/lanzarote2.jpg',
}

const SLUG = 'beaches'
const HERO_IMAGE = '/lanzarote4.jpg'

export default function BeachesGuidePage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const g = t.guidesPage
  const meta = g.sectionTitles[SLUG]

  const [beaches, setBeaches] = useState<BeachRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<FilterKey>('all')

  function load() {
    setLoading(true)
    setError(false)
    fetch('/api/guides/beaches')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((d) => setBeaches(d.beaches ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredBeaches = useMemo(() => {
    if (filter === 'all') return beaches
    const keys = FILTER_KEYS[filter]
    return beaches.filter((b) => keys.some((k) => b.beach_type?.[k]))
  }, [beaches, filter])

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="relative h-[300px] sm:h-[360px] w-full overflow-hidden">
          <Image src={HERO_IMAGE} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 max-w-2xl">{meta.title}</h1>
            <p className="text-white/90 text-base sm:text-lg">{meta.subtitle}</p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 py-4 flex-wrap">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-orange">{g.breadcrumbGuides}</Link>
            <span>›</span>
            <span className="text-dark">{meta.title}</span>
          </nav>

          <p className="text-dark/70 leading-relaxed max-w-2xl mb-6">{g.beachesOverview}</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  filter === key
                    ? 'bg-orange text-white border-orange'
                    : 'bg-white text-dark border-neutral-200 hover:border-orange hover:text-orange'
                }`}
              >
                {g.filters[key]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-white border border-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-dark/60 mb-4">{g.loadError}</p>
              <button
                type="button"
                onClick={load}
                className="bg-orange text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-orange/90 transition-colors text-sm"
              >
                {g.retry}
              </button>
            </div>
          ) : beaches.length === 0 ? (
            <p className="text-center text-dark/50 py-12">{g.empty}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredBeaches.map((beach) => {
                const name = lang === 'es' ? beach.name_es || beach.name_en : beach.name_en
                const description = lang === 'es' ? beach.description_es : beach.description_en
                const image = beach.image_url || FALLBACK_IMAGE[beach.name_en] || '/lanzarote4.jpg'
                const amenityKeys = Object.keys(beach.amenities ?? {}).filter((k) => beach.amenities[k] && k !== 'none')
                return (
                  <div key={beach.id} className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="relative h-40 w-full">
                      <Image src={image} alt="" fill className="object-cover" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 text-xs font-bold text-dark">
                        {'⭐'.repeat(Math.round(Number(beach.rating)))} {beach.rating}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-dark mb-2">{name}</h3>
                      <dl className="space-y-1.5 text-sm text-dark/70 mb-3">
                        <div><span className="font-medium text-dark">{g.locationLabel}: </span>{beach.location}</div>
                        <div><span className="font-medium text-dark">{g.distanceLabel}: </span>{beach.distance_km} km</div>
                        <div><span className="font-medium text-dark">{g.sandLabel}: </span>{beach.sand_type}</div>
                      </dl>
                      {amenityKeys.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {amenityKeys.map((key) => (
                            <span key={key} className="text-[11px] font-medium bg-neutral-100 text-dark/60 px-2 py-0.5 rounded-full">
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-dark/50 leading-relaxed mt-auto pt-3 border-t border-neutral-100">
                        {description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Map */}
          {!loading && !error && beaches.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-dark mb-4">{g.mapTitle}</h2>
              <div className="rounded-2xl overflow-hidden border border-neutral-200 h-80">
                <iframe
                  title="Lanzarote beaches map"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Lanzarote+beaches&output=embed"
                />
              </div>
            </section>
          )}

          {/* Related guides */}
          <div className="pb-16">
            <h2 className="text-lg font-bold text-dark mb-4">{g.relatedGuides}</h2>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(g.sectionTitles) as (keyof typeof g.sectionTitles)[])
                .filter((slug) => slug !== SLUG)
                .map((slug) => (
                  <Link
                    key={slug}
                    href={`/guides/${slug}`}
                    className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm font-semibold text-dark hover:border-orange hover:text-orange transition-colors"
                  >
                    {g.sectionTitles[slug].title}
                  </Link>
                ))}
            </div>
            <Link href="/guides" className="inline-block mt-6 text-sm text-dark/50 hover:text-orange transition-colors">
              ← {g.backToGuides}
            </Link>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
