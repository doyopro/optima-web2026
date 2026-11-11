'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import GuideDisclaimer from '@/components/GuideDisclaimer'
import { isGuideHidden } from '@/lib/guides-config'

interface GuideRow {
  id: string
  slug: string
  section: string
  content_en: string
  content_es: string
  metadata: { icon?: string; order?: number; hero_image?: string }
}

// Local fallbacks — the hero_image paths stored in Supabase metadata don't
// correspond to any file actually shipped in /public yet.
const FALLBACK_IMAGE: Record<string, string> = {
  'playa-blanca': '/lanzarote2.jpg',
  climate: '/lanzarote7.jpg',
  ferries: '/lanzarote14.jpg',
  beaches: '/lanzarote9.jpg',
}

export default function GuidesLandingPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const g = t.guidesPage

  const [guides, setGuides] = useState<GuideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function load() {
    setLoading(true)
    setError(false)
    fetch('/api/guides')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((d) => setGuides(d.guides ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  const visibleGuides = useMemo(() => guides.filter((guide) => !isGuideHidden(guide.slug)), [guides])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="min-h-screen bg-cream">
        {/* Hero */}
        <div className="relative">
          <div className="relative h-[380px] sm:h-[440px] w-full overflow-hidden">
            <Image src="/lanzarote10.jpg" alt={g.heroAlt.index} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 max-w-3xl">{g.hero.title}</h1>
            <p className="text-white/90 text-base sm:text-lg max-w-xl">{g.hero.subtitle}</p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-dark/50 pt-4">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <span className="text-dark">{g.breadcrumbGuides}</span>
          </nav>
        </div>

        {/* Quick stats */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-4 sm:mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-8">
            {g.stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 text-center">
                <p className="text-3xl font-bold text-orange mb-1">{stat.value}</p>
                <p className="text-sm text-dark/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guide cards: the static essentials guide first, then the published
            guides from Supabase (guides_content). Guides listed in
            HIDDEN_GUIDE_SLUGS are not shown. */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/guides/essentials"
              className="group relative rounded-2xl overflow-hidden shadow-sm border border-neutral-100 bg-white hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 w-full">
                <Image
                  src="/lanzarote8.jpg"
                  alt={g.heroAlt.essentials}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <p className="text-2xl mb-1">🧭</p>
                <h2 className="text-lg font-bold text-dark mb-1">{g.sectionTitles.essentials.title}</h2>
                <p className="text-sm text-dark/60 line-clamp-2">{g.sectionTitles.essentials.subtitle}</p>
              </div>
            </Link>

            {loading
              ? [0, 1].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-neutral-100 bg-white animate-pulse">
                    <div className="h-48 w-full bg-neutral-200" />
                    <div className="p-5 space-y-2">
                      <div className="h-4 w-1/3 bg-neutral-200 rounded" />
                      <div className="h-3 w-2/3 bg-neutral-200 rounded" />
                    </div>
                  </div>
                ))
              : visibleGuides.map((guide) => {
                  const meta = g.sectionTitles[guide.slug as keyof typeof g.sectionTitles]
                  const blurb = lang === 'es' ? guide.content_es : guide.content_en
                  return (
                    <Link
                      key={guide.slug}
                      href={`/guides/${guide.slug}`}
                      className="group relative rounded-2xl overflow-hidden shadow-sm border border-neutral-100 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={FALLBACK_IMAGE[guide.slug] ?? '/lanzarote2.jpg'}
                          alt={meta?.title ?? guide.section}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-2xl mb-1">{guide.metadata?.icon}</p>
                        <h2 className="text-lg font-bold text-dark mb-1">{meta?.title ?? guide.section}</h2>
                        <p className="text-sm text-dark/60 line-clamp-2">{meta?.subtitle || blurb}</p>
                      </div>
                    </Link>
                  )
                })}
          </div>

          {!loading && error && (
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
          )}
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
          <GuideDisclaimer lang={lang} />
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 text-center">
          <div className="bg-orange/10 rounded-2xl p-8">
            <p className="text-dark font-semibold mb-3">{g.bottomCta.text}</p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34617387171'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm"
            >
              {g.bottomCta.cta} →
            </a>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
