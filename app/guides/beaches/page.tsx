'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { beaches, beachesGuide as bg, type BeachCategory, guidesChrome as chrome, guidesLanding } from '@/lib/guides-data'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

const FILTERS: (BeachCategory | 'all')[] = ['all', 'family', 'surf', 'scenic', 'secluded']

export default function BeachesGuidePage() {
  const { lang } = useLanguage()
  const nav = translations[lang].nav
  const [filter, setFilter] = useState<BeachCategory | 'all'>('all')

  const filteredBeaches = filter === 'all' ? beaches : beaches.filter((b) => b.categories.includes(filter))

  return (
    <>
      <div className="min-h-screen bg-cream">
        {/* Hero */}
        <div className="relative h-[300px] sm:h-[360px] w-full overflow-hidden">
          <Image src={bg.hero.image} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 max-w-2xl">{bg.hero.title[lang]}</h1>
            <p className="text-white/90 text-base sm:text-lg">{bg.hero.subtitle[lang]}</p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 py-4 flex-wrap">
            <Link href="/" className="hover:text-orange">{nav.home}</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-orange">{chrome.breadcrumbGuides[lang]}</Link>
            <span>›</span>
            <span className="text-dark">{lang === 'es' ? 'Playas' : 'Beaches'}</span>
          </nav>

          <p className="text-dark/70 leading-relaxed max-w-2xl mb-6">{bg.overview[lang]}</p>

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
                {bg.filters[key][lang]}
              </button>
            ))}
          </div>

          {/* Beach cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredBeaches.map((beach) => (
              <div
                key={beach.id}
                className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="relative h-40 w-full">
                  <Image src={beach.image} alt="" fill className="object-cover" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 text-xs font-bold text-dark">
                    {'⭐'.repeat(Math.round(beach.rating))} {beach.rating}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-dark mb-0.5">{beach.name[lang]}</h3>
                  <p className="text-xs font-semibold text-orange uppercase tracking-wide mb-3">
                    {beach.tagline[lang]}
                  </p>
                  <dl className="space-y-1.5 text-sm text-dark/70 mb-3">
                    <div><span className="font-medium text-dark">{lang === 'es' ? 'Ubicación: ' : 'Location: '}</span>{beach.location[lang]}</div>
                    <div><span className="font-medium text-dark">{lang === 'es' ? 'Distancia: ' : 'Distance: '}</span>{beach.distance[lang]}</div>
                    <div><span className="font-medium text-dark">{lang === 'es' ? 'Arena: ' : 'Sand: '}</span>{beach.sand[lang]}</div>
                    <div><span className="font-medium text-dark">{lang === 'es' ? 'Agua: ' : 'Water: '}</span>{beach.water[lang]}</div>
                    {beach.facts.map((fact) => (
                      <div key={fact.label.en}>
                        <span className="font-medium text-dark">{fact.label[lang]}: </span>
                        {fact.value[lang]}
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-dark/50 leading-relaxed mt-auto pt-3 border-t border-neutral-100">
                    {beach.tips[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-dark mb-4">{lang === 'es' ? 'Mapa de playas' : 'Beach map'}</h2>
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

          {/* Quick picks */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-dark mb-4">{bg.quickPicks.heading[lang]}</h2>
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-3">
              {bg.quickPicks.items.map((item) => (
                <div key={item.label.en} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-sm">
                  <span className="font-bold text-dark shrink-0 sm:w-56">{item.label[lang]}</span>
                  <span className="text-dark/70">{item.value[lang]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Practical tips */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-dark mb-4">{bg.practicalTips.heading[lang]}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[bg.practicalTips.whatToBring, bg.practicalTips.safety, bg.practicalTips.timing].map((group) => (
                <div key={group.title.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                  <h3 className="font-bold text-dark mb-2">{group.title[lang]}</h3>
                  <ul className="space-y-1.5 text-sm text-dark/70">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-orange">•</span>
                        <span>{item[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Seasonal */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-dark mb-4">{bg.seasonal.heading[lang]}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bg.seasonal.items.map((item) => (
                <div key={item.season.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                  <h3 className="font-bold text-dark mb-1.5">{item.season[lang]}</h3>
                  <p className="text-sm text-dark/70">{item.body[lang]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related guides */}
          <div className="pb-16">
            <h2 className="text-lg font-bold text-dark mb-4">{chrome.relatedGuides[lang]}</h2>
            <div className="flex flex-wrap gap-3">
              {guidesLanding.cards
                .filter((card) => card.slug !== 'beaches')
                .map((card) => (
                  <Link
                    key={card.slug}
                    href={`/guides/${card.slug}`}
                    className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm font-semibold text-dark hover:border-orange hover:text-orange transition-colors"
                  >
                    {card.emoji} {card.title[lang]}
                  </Link>
                ))}
            </div>
            <Link href="/guides" className="inline-block mt-6 text-sm text-dark/50 hover:text-orange transition-colors">
              ← {chrome.backToGuides[lang]}
            </Link>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
