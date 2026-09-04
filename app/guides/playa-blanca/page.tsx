'use client'

import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { playaBlancaGuide as pb, guidesChrome as chrome, guidesLanding } from '@/lib/guides-data'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function PlayaBlancaGuidePage() {
  const { lang } = useLanguage()
  const nav = translations[lang].nav

  return (
    <>
      <div className="min-h-screen bg-cream">
        {/* Hero */}
        <div className="relative h-[300px] sm:h-[380px] w-full overflow-hidden">
          <Image src={pb.hero.image} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 max-w-2xl">{pb.hero.title[lang]}</h1>
            <p className="text-white/90 text-base sm:text-lg">{pb.hero.subtitle[lang]}</p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 py-4 flex-wrap">
            <Link href="/" className="hover:text-orange">{nav.home}</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-orange">{chrome.breadcrumbGuides[lang]}</Link>
            <span>›</span>
            <span className="text-dark">Playa Blanca</span>
          </nav>

          <div className="lg:grid lg:grid-cols-4 lg:gap-10 pb-6">
            {/* TOC — desktop sticky sidebar, mobile collapsible */}
            <aside className="lg:col-span-1 mb-8 lg:mb-0">
              <details className="lg:hidden bg-white rounded-2xl border border-neutral-100 p-4 mb-6" open={false}>
                <summary className="font-bold text-dark cursor-pointer">
                  {lang === 'es' ? 'Contenido' : 'Contents'}
                </summary>
                <ul className="mt-3 space-y-2 text-sm">
                  {pb.toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="text-dark/60 hover:text-orange transition-colors">
                        {item.label[lang]}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="hidden lg:block sticky top-6 bg-white rounded-2xl border border-neutral-100 p-5">
                <p className="font-bold text-dark mb-3 text-sm uppercase tracking-wide">
                  {lang === 'es' ? 'Contenido' : 'Contents'}
                </p>
                <ul className="space-y-2.5 text-sm">
                  {pb.toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="text-dark/60 hover:text-orange transition-colors">
                        {item.label[lang]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3 space-y-10">
              <section id="where">
                <h2 className="text-xl font-bold text-dark mb-3">{pb.where.heading[lang]}</h2>
                <p className="text-dark/70 leading-relaxed">{pb.where.body[lang]}</p>
              </section>

              <section id="about">
                <h2 className="text-xl font-bold text-dark mb-3">{pb.about.heading[lang]}</h2>
                <p className="text-dark/70 leading-relaxed">{pb.about.body[lang]}</p>
              </section>

              <section id="beaches">
                <h2 className="text-xl font-bold text-dark mb-4">{pb.beaches.heading[lang]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pb.beaches.items.map((beach) => (
                    <div key={beach.name.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                      <h3 className="font-bold text-dark mb-2">{beach.name[lang]}</h3>
                      <ul className="space-y-1.5 text-sm text-dark/70">
                        {beach.points.map((point, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-orange">•</span>
                            <span>{point[lang]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Link href="/guides/beaches" className="inline-block mt-4 text-sm font-semibold text-orange hover:underline">
                  {lang === 'es' ? 'Ver todas las playas de Lanzarote →' : 'See all Lanzarote beaches →'}
                </Link>
              </section>

              <section id="see-do">
                <h2 className="text-xl font-bold text-dark mb-4">{pb.seeDo.heading[lang]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pb.seeDo.items.map((item) => (
                    <div key={item.name.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                      <h3 className="font-bold text-dark mb-1.5">{item.name[lang]}</h3>
                      <p className="text-sm text-dark/70 leading-relaxed">{item.body[lang]}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="shopping">
                <h2 className="text-xl font-bold text-dark mb-4">{pb.shopping.heading[lang]}</h2>

                <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4">
                  <h3 className="font-bold text-dark mb-1.5">{pb.shopping.promenade.title[lang]}</h3>
                  <p className="text-sm text-dark/70 leading-relaxed">{pb.shopping.promenade.body[lang]}</p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4">
                  <h3 className="font-bold text-dark mb-2">{pb.shopping.shopping.title[lang]}</h3>
                  <ul className="space-y-1.5 text-sm text-dark/70">
                    {pb.shopping.shopping.points.map((point, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-orange">•</span>
                        <span>{point[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-100 p-5">
                  <h3 className="font-bold text-dark mb-2">{pb.shopping.restaurants.title[lang]}</h3>
                  <p className="text-sm text-dark/70 mb-2">{pb.shopping.restaurants.intro[lang]}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pb.shopping.restaurants.list.map((name) => (
                      <span key={name} className="text-xs font-semibold bg-orange/10 text-dark px-3 py-1.5 rounded-full">
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-dark/60 italic">{pb.shopping.restaurants.note[lang]}</p>
                </div>
              </section>

              <section id="getting-around">
                <h2 className="text-xl font-bold text-dark mb-4">{pb.gettingAround.heading[lang]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pb.gettingAround.items.map((item) => (
                    <div key={item.title.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                      <h3 className="font-bold text-dark mb-2">{item.title[lang]}</h3>
                      <ul className="space-y-1.5 text-sm text-dark/70">
                        {item.points.map((point, i) => (
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

              <section id="day-trips">
                <h2 className="text-xl font-bold text-dark mb-4">{pb.dayTrips.heading[lang]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pb.dayTrips.items.map((item) => (
                    <div key={item.title.en} className="bg-white rounded-2xl border border-neutral-100 p-5">
                      <h3 className="font-bold text-dark mb-1.5">{item.title[lang]}</h3>
                      <p className="text-sm text-dark/70 leading-relaxed">{item.body[lang]}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link href="/guides/ferries" className="text-sm font-semibold text-orange hover:underline">
                    {lang === 'es' ? 'Ver la guía de ferris →' : 'See the ferries guide →'}
                  </Link>
                </div>
              </section>

              <section id="practical">
                <h2 className="text-xl font-bold text-dark mb-4">{pb.practical.heading[lang]}</h2>
                <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                  {pb.practical.rows.map((row, i) => (
                    <div
                      key={row.label.en}
                      className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-4 text-sm ${
                        i > 0 ? 'border-t border-neutral-100' : ''
                      }`}
                    >
                      <span className="font-bold text-dark shrink-0 sm:w-32">{row.label[lang]}</span>
                      <span className="text-dark/70">{row.value[lang]}</span>
                    </div>
                  ))}
                </div>

                {/* Emergency numbers — factual, EU-wide only */}
                <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-5">
                  <h3 className="font-bold text-dark mb-1">
                    {lang === 'es' ? 'Emergencias' : 'Emergencies'}
                  </h3>
                  <p className="text-sm text-dark/70">
                    {lang === 'es'
                      ? 'Para cualquier emergencia (ambulancia, policía o bomberos), marca el '
                      : 'For any emergency (ambulance, police or fire), dial the EU-wide number '}
                    <span className="font-bold text-red-600">112</span>
                    {lang === 'es' ? '.' : '.'}
                  </p>
                </div>

                {/* Map */}
                <div className="mt-6 rounded-2xl overflow-hidden border border-neutral-200 h-72">
                  <iframe
                    title="Playa Blanca map"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Playa+Blanca,+Lanzarote&output=embed"
                  />
                </div>
              </section>
            </div>
          </div>

          {/* Related guides */}
          <div className="pb-16">
            <h2 className="text-lg font-bold text-dark mb-4">{chrome.relatedGuides[lang]}</h2>
            <div className="flex flex-wrap gap-3">
              {guidesLanding.cards
                .filter((card) => card.slug !== 'playa-blanca')
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
