'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { type Language, translations, getLanguage } from '@/lib/i18n'
import { type Property } from '@/lib/types'
import PropertyCard from '@/components/PropertyCard'
import PropertySkeleton from '@/components/PropertySkeleton'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

function SearchResults() {
  const router = useRouter()
  const params = useSearchParams()
  const [lang, setLang] = useState<Language>('en')
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const guests = params.get('guests') ?? ''
  const villa = params.get('villa') ?? ''

  useEffect(() => {
    setLang(getLanguage())
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_date: from || undefined,
        to_date: to || undefined,
        guests: guests ? Number(guests) : undefined,
        villa_id: villa || undefined,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        setResults(d.properties ?? [])
        setTotal(d.total ?? 0)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [from, to, guests, villa])

  const t = translations[lang].properties
  const nav = translations[lang].nav

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-dark/60 hover:text-orange transition-colors mb-6"
          >
            ← {nav.back}
          </button>

          {/* Summary bar */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-dark">
              {loading ? t.loading : `${total} ${t.results}`}
              {from && to && (
                <span className="ml-2 text-base font-normal text-dark/50">
                  · {from} → {to}
                </span>
              )}
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <PropertySkeleton key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-2xl mb-3">🏡</p>
              <p className="font-semibold text-dark mb-1">{t.noResults}</p>
              <p className="text-sm text-dark/50 mb-6">{t.tryAgain}</p>
              <button
                type="button"
                onClick={() => router.push('/villas')}
                className="bg-orange text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-orange/90 transition-colors"
              >
                {t.viewAll}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((p) => <PropertyCard key={p.id} property={p} lang={lang} />)}
            </div>
          )}
        </div>
      </div>
      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  )
}
