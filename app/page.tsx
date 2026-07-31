'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import SearchWidget from '@/components/SearchWidget'
import Faq from '@/components/Faq'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import PropertyCard from '@/components/PropertyCard'
import PropertySkeleton from '@/components/PropertySkeleton'
import { type Property } from '@/lib/types'

export default function Home() {
  const { lang } = useLanguage()
  const [featured, setFeatured] = useState<Property[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [errorFeatured, setErrorFeatured] = useState<boolean>(false)

  // Fetch seguro de propiedades destacadas
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/villas')
        if (!response.ok) throw new Error('Failed to fetch')

        const data = await response.json()
        const featuredProperties = (data.properties as Property[])
          .filter((p) => p.is_featured)
          .slice(0, 3)

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
      <section className="relative flex h-[75vh] min-h-[600px] items-center justify-center overflow-hidden">
        <Image
          src="/hero-cover.jpg"
          alt="Lanzarote landscapes — caves, volcanoes and beaches"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text legibility over the photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-dark/70" />
        {/* Luces de fondo premium */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,rgba(226,102,32,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(28,175,230,0.15),transparent_50%)]" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center animate-fade-in">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
            {hero.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-200/90 sm:text-xl font-light leading-relaxed">
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* --- SEARCH WIDGET --- */}
      <div className="relative z-20 -mt-16 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SearchWidget />
      </div>

      {/* --- WHY CHOOSE OPTIMA (METRICS) --- */}
      <section className="bg-white py-20 md:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4 tracking-tight">
              {home.whyChoose}
            </h2>
            <p className="text-dark/60 max-w-2xl mx-auto text-lg">
              {home.whyChooseSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {home.metrics.map((m) => (
              <div
                key={m.label}
                className="group flex flex-col items-center bg-cream/50 rounded-3xl p-10 text-center hover:bg-cream hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-neutral-100"
              >
                <p className="text-5xl md:text-6xl font-extrabold text-orange mb-4 tracking-tighter group-hover:scale-105 transition-transform">
                  {m.value}
                </p>
                <h3 className="text-xl font-bold text-dark mb-3">{m.label}</h3>
                <p className="text-dark/65 leading-relaxed font-medium">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DISCOVER LANZAROTE --- */}
      <section className="bg-neutral-50 py-16 md:py-24 px-4 sm:px-6">
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

      {/* --- FEATURED VILLAS --- */}
      <section className="bg-neutral-50 py-20 md:py-28 px-4 sm:px-6">
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
              Array.from({ length: 3 }).map((_, i) => <PropertySkeleton key={i} />)
            ) : errorFeatured ? (
              <div className="col-span-full py-12 text-center text-dark/50 bg-white rounded-2xl border border-neutral-200">
                <p>{home.featuredError}</p>
              </div>
            ) : featured.length === 0 ? (
              <div className="col-span-full py-12 text-center text-dark/50 bg-white rounded-2xl border border-neutral-200">
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

      {/* --- FAQ --- */}
      <Faq lang={lang} />

      {/* --- TESTIMONIALS & FOOTER --- */}
      <Testimonials lang={lang} />
      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </main>
  )
}