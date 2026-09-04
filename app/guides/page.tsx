'use client'

import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { guidesLanding } from '@/lib/guides-data'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function GuidesLandingPage() {
  const { lang } = useLanguage()
  const t = translations[lang].nav
  const g = guidesLanding

  return (
    <>
      <div className="min-h-screen bg-cream">
        {/* Hero */}
        <div className="relative">
          <div className="relative h-[380px] sm:h-[440px] w-full overflow-hidden">
            <Image src="/lanzarote2.jpg" alt="" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 max-w-3xl">
              {g.hero.title[lang]}
            </h1>
            <p className="text-white/90 text-base sm:text-lg max-w-xl">{g.hero.subtitle[lang]}</p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-dark/50 pt-4">
            <Link href="/" className="hover:text-orange">{t.home}</Link>
            <span>›</span>
            <span className="text-dark">{t.guides}</span>
          </nav>
        </div>

        {/* Quick stats */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-4 sm:mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-8">
            {g.stats.map((stat) => (
              <div
                key={stat.label[lang]}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 text-center"
              >
                <p className="text-3xl font-bold text-orange mb-1">{stat.value}</p>
                <p className="text-sm text-dark/60">{stat.label[lang]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main guide cards */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {g.cards.map((card) => (
              <Link
                key={card.slug}
                href={`/guides/${card.slug}`}
                className="group relative rounded-2xl overflow-hidden shadow-sm border border-neutral-100 bg-white hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <p className="text-2xl mb-1">{card.emoji}</p>
                  <h2 className="text-lg font-bold text-dark mb-1">{card.title[lang]}</h2>
                  <p className="text-sm text-dark/60">{card.description[lang]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bonus section */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          <h2 className="text-xl font-bold text-dark mb-5">{g.bonus.title[lang]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {g.bonus.items.map((item) => (
              <div
                key={item.title[lang]}
                className="bg-white rounded-2xl border border-neutral-100 p-5"
              >
                <p className="text-2xl mb-2">{item.emoji}</p>
                <h3 className="font-bold text-dark mb-1">{item.title[lang]}</h3>
                <p className="text-sm text-dark/60">{item.description[lang]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 text-center">
          <div className="bg-orange/10 rounded-2xl p-8">
            <p className="text-dark font-semibold mb-3">{g.bottomCta.text[lang]}</p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34617387171'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm"
            >
              {g.bottomCta.cta[lang]} →
            </a>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
