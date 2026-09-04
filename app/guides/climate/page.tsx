'use client'

import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { climateGuide as c, guidesChrome as chrome, guidesLanding } from '@/lib/guides-data'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function ClimateGuidePage() {
  const { lang } = useLanguage()
  const nav = translations[lang].nav

  return (
    <>
      <div className="min-h-screen bg-cream">
        {/* Hero */}
        <div className="relative h-[300px] sm:h-[360px] w-full overflow-hidden">
          <Image src={c.hero.image} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 max-w-2xl">{c.hero.title[lang]}</h1>
            <p className="text-white/90 text-base sm:text-lg">{c.hero.subtitle[lang]}</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 py-4 flex-wrap">
            <Link href="/" className="hover:text-orange">{nav.home}</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-orange">{chrome.breadcrumbGuides[lang]}</Link>
            <span>›</span>
            <span className="text-dark">{climateGuideTitle(lang)}</span>
          </nav>

          <div className="space-y-10 pb-6">
            {/* Overview */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-3">{c.overview.heading[lang]}</h2>
              {c.overview.paragraphs.map((p, i) => (
                <p key={i} className="text-dark/70 leading-relaxed mb-3">{p[lang]}</p>
              ))}
            </section>

            {/* Monthly table */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-3">{c.monthlyTable.heading[lang]}</h2>
              <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-orange/10 text-dark text-xs uppercase tracking-wide">
                      <th className="text-left px-3 py-2.5">{c.monthlyTable.columns.month[lang]}</th>
                      <th className="text-right px-3 py-2.5">{c.monthlyTable.columns.high[lang]}</th>
                      <th className="text-right px-3 py-2.5">{c.monthlyTable.columns.low[lang]}</th>
                      <th className="text-right px-3 py-2.5">{c.monthlyTable.columns.sun[lang]}</th>
                      <th className="text-right px-3 py-2.5">{c.monthlyTable.columns.rain[lang]}</th>
                      <th className="text-right px-3 py-2.5">{c.monthlyTable.columns.sea[lang]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.monthlyTable.rows.map((row) => (
                      <tr key={row.month.en} className="border-t border-neutral-100">
                        <td className="px-3 py-2 font-semibold text-dark">{row.month[lang]}</td>
                        <td className="px-3 py-2 text-right text-dark/70">{row.high}°C</td>
                        <td className="px-3 py-2 text-right text-dark/70">{row.low}°C</td>
                        <td className="px-3 py-2 text-right text-dark/70">{row.sun}h</td>
                        <td className="px-3 py-2 text-right text-dark/70">{row.rain}mm</td>
                        <td className="px-3 py-2 text-right text-dark/70">{row.sea}°C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-dark/40 mt-2">{c.monthlyTable.source[lang]}</p>
            </section>

            {/* Best time to visit */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-2">{c.bestTime.heading[lang]}</h2>
              <p className="text-dark/70 leading-relaxed mb-4">{c.bestTime.intro[lang]}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {c.bestTime.seasons.map((season) => (
                  <div key={season.title.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                    <h3 className="font-bold text-dark mb-2">{season.title[lang]}</h3>
                    <ul className="space-y-1.5 text-sm text-dark/70">
                      {season.points.map((point, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-orange">•</span>
                          <span>{point[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Microclimate */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-3">{c.microclimate.heading[lang]}</h2>
              {c.microclimate.paragraphs.map((p, i) => (
                <p key={i} className="text-dark/70 leading-relaxed mb-3">{p[lang]}</p>
              ))}
            </section>

            {/* Wind & calima */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-3">{c.wind.heading[lang]}</h2>
              {c.wind.paragraphs.map((p, i) => (
                <p key={i} className="text-dark/70 leading-relaxed mb-3">{p[lang]}</p>
              ))}
            </section>

            {/* Packing */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-3">{c.packing.heading[lang]}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {c.packing.items.map((item) => (
                  <div key={item.title.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                    <h3 className="font-bold text-dark mb-1.5">{item.title[lang]}</h3>
                    <p className="text-sm text-dark/70 leading-relaxed">{item.body[lang]}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Forecast */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-3">{c.forecast.heading[lang]}</h2>
              {c.forecast.paragraphs.map((p, i) => (
                <p key={i} className="text-dark/70 leading-relaxed mb-3">{p[lang]}</p>
              ))}
              <div className="flex flex-wrap gap-3 mt-2">
                {c.forecast.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-orange hover:underline"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </section>

            {/* Timezone */}
            <section className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-lg font-bold text-dark mb-2">{c.timezone.heading[lang]}</h2>
              <p className="text-dark/70 leading-relaxed">{c.timezone.body[lang]}</p>
            </section>
          </div>

          {/* Related guides */}
          <div className="pb-16">
            <h2 className="text-lg font-bold text-dark mb-4">{chrome.relatedGuides[lang]}</h2>
            <div className="flex flex-wrap gap-3">
              {guidesLanding.cards
                .filter((card) => card.slug !== 'climate')
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

function climateGuideTitle(lang: 'en' | 'es') {
  return lang === 'es' ? 'Clima' : 'Climate'
}
