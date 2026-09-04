'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface GuideRow {
  slug: string
  section: string
  content_en: string
  content_es: string
  metadata: { icon?: string; order?: number; hero_image?: string }
}

const SLUG = 'climate'
const HERO_IMAGE = '/lanzarote7.jpg'

export default function ClimateGuidePage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const g = t.guidesPage
  const meta = g.sectionTitles[SLUG]

  const [guide, setGuide] = useState<GuideRow | null>(null)
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
      .then((d) => setGuide((d.guides ?? []).find((row: GuideRow) => row.slug === SLUG) ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const body = guide ? (lang === 'es' ? guide.content_es : guide.content_en) : ''

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

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 py-4 flex-wrap">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-orange">{g.breadcrumbGuides}</Link>
            <span>›</span>
            <span className="text-dark">{meta.title}</span>
          </nav>

          <div className="pb-6">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-full bg-neutral-200 rounded" />
                <div className="h-4 w-5/6 bg-neutral-200 rounded" />
                <div className="h-4 w-2/3 bg-neutral-200 rounded" />
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
            ) : !guide ? (
              <p className="text-dark/50">{g.empty}</p>
            ) : (
              <p className="text-dark/70 leading-relaxed whitespace-pre-line">{body}</p>
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
