'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Star, MapPin, ShieldCheck, Smile } from 'lucide-react'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import SearchWidget from '@/components/SearchWidget'
import Faq from '@/components/Faq'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import PropertyCard from '@/components/PropertyCard'
import PropertySkeleton from '@/components/PropertySkeleton'
import { VillaIcon, VolcanoIcon, HeartIcon } from '@/components/icons/OptimaDifferenceIcons'
import { TRUSTPILOT_REVIEW_COUNT } from '@/lib/marketing'
import { type Property } from '@/lib/types'

// Curated picks for the homepage — chosen deliberately, not derived from
// is_featured (every property currently has that flag set to true).
// Featured Villas is a brand/trust surface: only genuine Optima-owned
// properties belong here, never Tina/SunBeach partner-managed ones (unlike
// /villas, which lists partner properties too, just demoted to the end —
// guests can still book them there). Villa Valhalla was previously listed
// here despite is_tina_partner = true; swapped for Casa Amorosa. The
// is_tina_partner filter below is a second, defensive line against this
// list ever including a partner property again.
const FEATURED_PROPERTY_IDS = [
  '03fd7cce-a54d-422c-a07e-3a21d9027ceb', // Casa Amorosa
  'bbaf4612-dead-4449-9853-5a438068af65', // Casa Piscina
  '0e7b2121-21fd-4e05-aa2e-4538e6083e5b', // Casa Azul
  'fa7da782-64f3-4cb1-9a1a-cd126cd56c86', // Casa Bluebird
  '7bff6d00-e653-40d3-8b51-adc929a4b0f7', // Casa Cielo Azul
  '5fd591a5-7b42-4fbd-84e2-e789534932f8', // Casa Corfe
]

// Hero rotation — all four already live in /public (hero-pool.jpg is the
// real Optima villa used elsewhere on this page's Featured Villas request;
// the other three are the exact files "Discover Lanzarote" already uses
// below), not new/invented images. Order mirrors the villa → coast →
// volcanic → architecture sequence originally asked for.
const HERO_IMAGES = [
  { src: '/hero-pool.jpg', alt: 'Optima Villas — private pool villa in Lanzarote' },
  { src: '/lanzarote9.jpg', alt: 'Papagayo beach, Lanzarote' },
  { src: '/lanzarote10.jpg', alt: 'Volcanic landscape of Timanfaya, Lanzarote' },
  { src: '/lanzarote8.jpg', alt: 'Traditional white Lanzarote architecture' },
]
const HERO_ROTATION_MS = 6000

// The hero title is CMS-editable (site_content), so this can't hardcode
// "line 1"/"line 2" — it splits on sentence boundaries instead, e.g. "Your
// Villa. Your Lanzarote." → ["Your Villa", "Your Lanzarote"], forcing a
// deliberate line break instead of letting the browser wrap wherever the
// viewport happens to break, and dropping the trailing periods (cleaner at
// hero-title scale — see each line rendered in its own block). Falls back
// to a single line if the copy is ever written without that two-sentence
// shape.
function splitHeroLines(title: string): string[] {
  return title
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function Home() {
  const { lang } = useLanguage()
  const [featured, setFeatured] = useState<Property[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [errorFeatured, setErrorFeatured] = useState<boolean>(false)
  const [heroIndex, setHeroIndex] = useState(0)

  // Hero crossfade — plain interval advancing the index; each image is
  // absolutely stacked and only its opacity changes (see render), so this
  // never swaps the actual <Image> mounted, just which one is visible.
  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length)
    }, HERO_ROTATION_MS)
    return () => clearInterval(id)
  }, [])

  // Fetch seguro de propiedades destacadas
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/villas')
        if (!response.ok) throw new Error('Failed to fetch')

        const data = await response.json()
        const byId = new Map((data.properties as Property[]).map((p) => [p.id, p]))
        const featuredProperties = FEATURED_PROPERTY_IDS.map((id) => byId.get(id))
          .filter((p): p is Property => Boolean(p))
          .filter((p) => !p.is_tina_partner)

        setFeatured(featuredProperties)
      } catch (error) {
        console.error('Error fetching featured properties:', error)
        setErrorFeatured(true)
      } finally {
        setLoadingFeatured(false)
      }
    }

    fetchFeatured()
  }, [])

  const hero = translations[lang].hero
  const prop = translations[lang].properties
  const home = translations[lang].home

  return (
    <main className="flex min-h-screen flex-col">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {/* --- HERO SECTION --- */}
      {/* Crossfades through HERO_IMAGES every HERO_ROTATION_MS — all four
          <Image> stay mounted the whole time, stacked absolutely, only
          opacity changes (see heroIndex). That avoids any re-mount/reload
          flicker a naive src-swap would cause. hero-pool.jpg is a real
          Optima villa (Casa Piscina); the other three are the exact files
          "Discover Lanzarote" already uses below — nothing new. */}
      <section className="relative flex h-[75vh] min-h-[640px] items-center justify-center overflow-hidden">
        {HERO_IMAGES.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-[1500ms] ease-in-out ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        {/* Bottom-heavy dark overlay — darkest where the text/search widget
            sit, fading to nearly clear at the top so the photo still reads.
            Capped around 40% black at its strongest. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/22 to-black/10" />
        {/* Luces de fondo premium */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,rgba(226,102,32,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(28,175,230,0.15),transparent_50%)]" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold tracking-normal text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
            {splitHeroLines(hero.title).map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl text-neutral-100 sm:text-2xl font-medium leading-relaxed drop-shadow-sm">
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* --- SEARCH WIDGET --- */}
      {/* Overlaps the hero's bottom edge — the widget got visibly shorter
          once it went thin/translucent, so the old -mt-10 no longer bit
          into the photo at all, it just sat in the white space below.
          Bumped enough to clearly sit on top of the image again. */}
      <div className="relative z-20 -mt-24 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SearchWidget />
      </div>

      {/* --- FEATURED VILLAS --- */}
      <section className="bg-white py-20 md:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3 tracking-tight">
                {prop.featured}
              </h2>
              <p className="text-dark/60 text-lg">{prop.featuredSub}</p>
            </div>
            <Link
              href="/villas"
              className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-orange hover:text-dark transition-colors uppercase tracking-wide"
            >
              {prop.viewAll} <span className="text-lg">→</span>
            </Link>
          </div>

          {/* Manejo de estados: Carga, Error o Datos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingFeatured && !errorFeatured ? (
              Array.from({ length: 6 }).map((_, i) => <PropertySkeleton key={i} />)
            ) : errorFeatured ? (
              <div className="col-span-full py-12 text-center text-dark/50 bg-neutral-50 rounded-2xl border border-neutral-200">
                <p>{home.featuredError}</p>
              </div>
            ) : featured.length === 0 ? (
              <div className="col-span-full py-12 text-center text-dark/50 bg-neutral-50 rounded-2xl border border-neutral-200">
                <p>{home.featuredEmpty}</p>
              </div>
            ) : (
              featured.map((p) => <PropertyCard key={p.id} property={p} lang={lang} />)
            )}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/villas"
              className="inline-flex items-center justify-center w-full bg-white border border-neutral-200 rounded-xl py-4 text-sm font-bold text-dark hover:border-orange hover:text-orange transition-colors"
            >
              {prop.viewAll} →
            </Link>
          </div>
        </div>
      </section>

      {/* --- THE OPTIMA DIFFERENCE --- */}
      <section className="relative overflow-hidden bg-neutral-50 py-20 md:py-28 px-4 sm:px-6">
        {/* Very soft blue wash behind everything — no dot pattern, just the
            tint. Cards sit above it (z-10). */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue/[0.04] via-transparent to-blue/[0.04] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark tracking-tight">
              {home.optimaDifference.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {home.optimaDifference.items.map((item, i) => {
              const Icon = [VillaIcon, VolcanoIcon, HeartIcon][i]
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-center bg-white rounded-3xl border-t-4 border-blue p-10 text-center shadow-xl shadow-black/[0.06] hover:shadow-2xl hover:shadow-black/[0.09] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue/25 to-blue/10 mb-6">
                    <Icon className="h-14 w-14 text-blue" />
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-dark/65 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>

          {/* Stat row — 5 items. Font shrinks at lg so all 5 fit on one
              line on desktop without feeling cramped; below lg it wraps to
              2 clean centered lines instead of squeezing. */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:flex-nowrap lg:gap-x-4 xl:gap-x-6 text-sm sm:text-base lg:text-[13px] xl:text-sm font-medium text-dark/70">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="h-4 w-4 lg:h-4 lg:w-4 text-blue shrink-0" aria-hidden="true" />
              {home.optimaDifference.stats.experience}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Star className="h-4 w-4 text-blue shrink-0" aria-hidden="true" />
              {home.optimaDifference.stats.reviews.replace('{count}', String(TRUSTPILOT_REVIEW_COUNT))}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Smile className="h-4 w-4 text-blue shrink-0" aria-hidden="true" />
              {home.optimaDifference.stats.happyStays}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <MapPin className="h-4 w-4 text-blue shrink-0" aria-hidden="true" />
              {home.optimaDifference.stats.localTeam}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <ShieldCheck className="h-4 w-4 text-blue shrink-0" aria-hidden="true" />
              {home.optimaDifference.stats.secureBooking}
            </span>
          </div>
        </div>
      </section>

      {/* --- DISCOVER LANZAROTE --- */}
      <section className="bg-white py-16 md:py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="grid grid-cols-2 gap-3 h-[420px] order-2 lg:order-1">
            <div className="relative row-span-2 rounded-2xl overflow-hidden">
              <Image
                src="/lanzarote10.jpg"
                alt={home.discover.volcanicAlt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/lanzarote9.jpg"
                alt={home.discover.coastAlt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/lanzarote8.jpg"
                alt={home.discover.architectureAlt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6 tracking-tight">
              {home.discover.title}
            </h2>
            <p className="text-dark/70 leading-relaxed">{home.discover.text}</p>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <Testimonials lang={lang} />

      {/* --- FAQ & FOOTER --- */}
      <Faq lang={lang} />
      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </main>
  )
}