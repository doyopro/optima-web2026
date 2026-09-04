'use client'

import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { ferriesGuide as f, guidesChrome as chrome, guidesLanding } from '@/lib/guides-data'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function FerriesGuidePage() {
  const { lang } = useLanguage()
  const nav = translations[lang].nav

  return (
    <>
      <div className="min-h-screen bg-cream">
        {/* Hero */}
        <div className="relative h-[300px] sm:h-[360px] w-full overflow-hidden">
          <Image src={f.hero.image} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 max-w-2xl">{f.hero.title[lang]}</h1>
            <p className="text-white/90 text-base sm:text-lg">{f.hero.subtitle[lang]}</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 py-4 flex-wrap">
            <Link href="/" className="hover:text-orange">{nav.home}</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-orange">{chrome.breadcrumbGuides[lang]}</Link>
            <span>›</span>
            <span className="text-dark">{lang === 'es' ? 'Ferris' : 'Ferries'}</span>
          </nav>

          <div className="space-y-10 pb-6">
            {/* Intro */}
            <section>
              {f.intro.paragraphs.map((p, i) => (
                <p key={i} className="text-dark/70 leading-relaxed mb-3">{p[lang]}</p>
              ))}
            </section>

            {/* Operators */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-2">{f.operatorsHeading[lang]}</h2>
              <p className="text-dark/70 leading-relaxed mb-5">{f.operatorsIntro[lang]}</p>

              <div className="grid grid-cols-1 gap-5">
                {f.operators.map((op) => (
                  <div key={op.name} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-dark mb-2">{op.name}</h3>
                    <p className="text-sm text-dark/70 leading-relaxed mb-4">{op.description[lang]}</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <Fact label={lang === 'es' ? 'Duración' : 'Crossing'} value={op.crossing[lang]} />
                      <Fact label={lang === 'es' ? 'Frecuencia' : 'Frequency'} value={op.frequency[lang]} />
                      <Fact label={lang === 'es' ? 'Vehículos' : 'Vehicles'} value={op.vehicles[lang]} />
                      <Fact label={lang === 'es' ? 'Mascotas' : 'Pets'} value={op.pets[lang]} />
                      <Fact label={lang === 'es' ? 'Equipaje' : 'Luggage'} value={op.luggage[lang]} />
                      {op.checkIn && (
                        <Fact label={lang === 'es' ? 'Facturación' : 'Check-in'} value={op.checkIn[lang]} />
                      )}
                    </dl>
                    {op.note && (
                      <p className="text-xs text-orange font-medium mt-3">{op.note[lang]}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-neutral-100 text-sm">
                      <a href={op.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange hover:underline">
                        {op.website.replace('https://www.', '').replace('https://', '')} ↗
                      </a>
                      <a href={`tel:${op.phone.replace(/\s/g, '')}`} className="text-dark/60 hover:text-orange transition-colors">
                        {op.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-2">{f.pricing.heading[lang]}</h2>
              <p className="text-dark/70 leading-relaxed mb-4">{f.pricing.intro[lang]}</p>
              <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="bg-orange/10 text-dark text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-2.5">{f.pricing.columns.type[lang]}</th>
                      <th className="text-right px-4 py-2.5">{f.pricing.columns.price[lang]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.pricing.rows.map((row) => (
                      <tr key={row.type.en} className="border-t border-neutral-100">
                        <td className="px-4 py-2.5 text-dark">{row.type[lang]}</td>
                        <td className="px-4 py-2.5 text-right text-dark/70">
                          {typeof row.price === 'string' ? row.price : row.price[lang]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-dark/40 mt-2">{f.pricing.note[lang]}</p>
            </section>

            {/* Tips */}
            <section className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-lg font-bold text-dark mb-3">{f.tips.heading[lang]}</h2>
              <ul className="space-y-2 text-sm text-dark/70">
                {f.tips.items.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-orange">•</span>
                    <span>{tip[lang]}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Corralejo */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-3">{f.corralejo.heading[lang]}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {f.corralejo.items.map((item) => (
                  <div key={item.title.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                    <h3 className="font-bold text-dark mb-1.5">{item.title[lang]}</h3>
                    <p className="text-sm text-dark/70 leading-relaxed">{item.body[lang]}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Getting to port */}
            <section className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-lg font-bold text-dark mb-2">{f.gettingToPort.heading[lang]}</h2>
              <p className="text-dark/70 leading-relaxed">{f.gettingToPort.body[lang]}</p>
            </section>

            {/* La Graciosa */}
            <section>
              <h2 className="text-xl font-bold text-dark mb-4">{f.laGraciosa.heading[lang]}</h2>
              <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm mb-4">
                  <Fact label={lang === 'es' ? 'Duración' : 'Duration'} value={f.laGraciosa.facts.duration[lang]} />
                  <Fact label={lang === 'es' ? 'Frecuencia' : 'Frequency'} value={f.laGraciosa.facts.frequency[lang]} />
                  <Fact label={lang === 'es' ? 'Salida' : 'Departure'} value={f.laGraciosa.facts.departure[lang]} />
                  <Fact label={lang === 'es' ? 'Llegada' : 'Arrival'} value={f.laGraciosa.facts.arrival[lang]} />
                  <Fact label={lang === 'es' ? 'Precio' : 'Price'} value={f.laGraciosa.operator.price[lang]} />
                  <Fact label={lang === 'es' ? 'Operador' : 'Operator'} value={f.laGraciosa.operator.name} />
                </dl>
                <a
                  href={f.laGraciosa.operator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-orange hover:underline"
                >
                  {f.laGraciosa.operator.website.replace('https://www.', '')} ↗
                </a>

                <h3 className="font-bold text-dark mt-5 mb-2">{f.laGraciosa.whatToDo.heading[lang]}</h3>
                <ul className="space-y-1.5 text-sm text-dark/70">
                  {f.laGraciosa.whatToDo.items.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-orange">•</span>
                      <span>{item[lang]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Related guides */}
          <div className="pb-16">
            <h2 className="text-lg font-bold text-dark mb-4">{chrome.relatedGuides[lang]}</h2>
            <div className="flex flex-wrap gap-3">
              {guidesLanding.cards
                .filter((card) => card.slug !== 'ferries')
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-dark/40">{label}</dt>
      <dd className="text-dark/80 font-medium">{value}</dd>
    </div>
  )
}
