'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface FerryRow {
  id: string
  name: string
  name_es: string
  route_from: string
  route_to: string
  duration_minutes: number
  frequency_daily: number
  price_eur: string | number
  website: string
  contact_phone: string
  amenities: Record<string, boolean>
  luggage_limit_kg: number
  notes_en: string
  notes_es: string
}

const SLUG = 'ferries'
const HERO_IMAGE = '/lanzarote11.jpg'

function websiteUrl(website: string) {
  return website.startsWith('http') ? website : `https://${website}`
}

export default function FerriesGuidePage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const g = t.guidesPage
  const meta = g.sectionTitles[SLUG]

  const [ferries, setFerries] = useState<FerryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function load() {
    setLoading(true)
    setError(false)
    fetch('/api/guides/ferries')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((d) => setFerries(d.ferries ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 py-4 flex-wrap">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-orange">{g.breadcrumbGuides}</Link>
            <span>›</span>
            <span className="text-dark">{meta.title}</span>
          </nav>

          <div className="pb-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-white border border-neutral-100 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-dark/60 mb-4">{g.loadError}</p>
                <button
                  type="button"
                  onClick={load}
                  className="bg-orange text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-orange/90 transition-colors text-sm"
                >
                  {g.retry}
                </button>
              </div>
            ) : ferries.length === 0 ? (
              <p className="text-dark/50">{g.empty}</p>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {ferries.map((ferry) => {
                  const name = lang === 'es' ? ferry.name_es || ferry.name : ferry.name
                  const notes = lang === 'es' ? ferry.notes_es : ferry.notes_en
                  const amenityKeys = Object.keys(ferry.amenities ?? {}).filter((k) => ferry.amenities[k])
                  return (
                    <div key={ferry.id} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-dark">{name}</h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-orange bg-orange/10 px-2.5 py-1 rounded-full">
                          {ferry.route_from} → {ferry.route_to}
                        </span>
                      </div>
                      {notes && <p className="text-sm text-dark/70 leading-relaxed mb-4">{notes}</p>}
                      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-sm mb-4">
                        <Fact label={g.crossing} value={`${ferry.duration_minutes} min`} />
                        <Fact label={g.frequency} value={`${ferry.frequency_daily}/day`} />
                        <Fact label={g.price} value={`€${ferry.price_eur}`} />
                        <Fact label={g.luggage} value={`${ferry.luggage_limit_kg} kg`} />
                      </dl>
                      {amenityKeys.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {amenityKeys.map((key) => (
                            <span key={key} className="text-xs font-medium bg-neutral-100 text-dark/70 px-2.5 py-1 rounded-full">
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-100 text-sm">
                        <a href={websiteUrl(ferry.website)} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange hover:underline">
                          {ferry.website} ↗
                        </a>
                        <a href={`tel:${ferry.contact_phone.replace(/\s/g, '')}`} className="text-dark/60 hover:text-orange transition-colors">
                          {ferry.contact_phone}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-dark/40">{label}</dt>
      <dd className="text-dark/80 font-medium">{value}</dd>
    </div>
  )
}
