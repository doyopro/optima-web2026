'use client'

import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { VISIBLE_GUIDE_SLUGS } from '@/lib/guides-config'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import GuideDisclaimer from '@/components/GuideDisclaimer'

const SLUG = 'essentials'
const HERO_IMAGE = '/lanzarote2.jpg'
const BUS_URL = 'https://arrecifebus.com'

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function SectionTitle({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-dark mb-4">
      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange/10 text-xl">
        {emoji}
      </span>
      {children}
    </h2>
  )
}

export default function EssentialsGuidePage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const g = t.guidesPage
  const e = g.essentials
  const meta = g.sectionTitles[SLUG]
  const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '34617387171'}`

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="relative h-[260px] sm:h-[340px] w-full overflow-hidden">
          <Image src={HERO_IMAGE} alt={g.heroAlt.index} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 max-w-2xl">{meta.title}</h1>
            <p className="text-white/90 text-base sm:text-lg max-w-xl">{meta.subtitle}</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 py-4 flex-wrap">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-orange">{g.breadcrumbGuides}</Link>
            <span>›</span>
            <span className="text-dark">{meta.title}</span>
          </nav>

          <p className="text-dark/70 leading-relaxed max-w-2xl mb-6">{e.intro}</p>

          {/* Emergency — first and most prominent */}
          <section className="rounded-2xl bg-white border-2 border-orange p-5 sm:p-6 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-dark mb-1">{e.emergency.title}</h2>
                <p className="text-sm text-dark/70 leading-relaxed max-w-xl">{e.emergency.body}</p>
              </div>
              <a
                href="tel:112"
                className="inline-flex items-center justify-center rounded-xl bg-orange px-6 py-3 text-lg font-bold text-white hover:bg-orange/90 transition-colors shrink-0"
              >
                📞 {e.emergency.callLabel}
              </a>
            </div>
          </section>

          {/* Health */}
          <section className="mb-10">
            <SectionTitle emoji="🏥">{e.health.title}</SectionTitle>
            <div className="grid grid-cols-1 gap-4">
              {e.health.items.map((item) => (
                <div key={item.name} className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                  <h3 className="font-bold text-dark mb-1">{item.name}</h3>
                  <p className="text-sm text-dark/70 leading-relaxed">{item.detail}</p>
                  {item.phone && (
                    <a
                      href={telHref(item.phone)}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange hover:underline"
                    >
                      📞 {e.callLabel} {item.phone}
                    </a>
                  )}
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                  <h3 className="font-bold text-dark mb-1">💊 {e.health.pharmacyTitle}</h3>
                  <p className="text-sm text-dark/70 leading-relaxed">{e.health.pharmacyBody}</p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                  <h3 className="font-bold text-dark mb-1">🪪 {e.health.insuranceTitle}</h3>
                  <p className="text-sm text-dark/70 leading-relaxed">{e.health.insuranceBody}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Getting around */}
          <section className="mb-10">
            <SectionTitle emoji="🚌">{e.transport.title}</SectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                <h3 className="font-bold text-dark mb-1">⛴️ {e.transport.ferryTitle}</h3>
                <p className="text-sm text-dark/70 leading-relaxed mb-3">{e.transport.ferryBody}</p>
                <Link href="/guides/ferries" className="text-sm font-semibold text-orange hover:underline">
                  {e.transport.ferryLink} →
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                <h3 className="font-bold text-dark mb-1">🚌 {e.transport.busTitle}</h3>
                <p className="text-sm text-dark/70 leading-relaxed mb-4">{e.transport.busBody}</p>
                <ul className="divide-y divide-neutral-100 mb-4">
                  {e.transport.busRoutes.map((r) => (
                    <li key={r.route} className="flex items-start gap-3 py-3">
                      <span className="shrink-0 rounded-lg bg-orange/10 px-2.5 py-1 text-sm font-bold text-orange min-w-[3rem] text-center">
                        {r.route}
                      </span>
                      <span className="text-sm text-dark/80">
                        <span className="font-medium text-dark">{r.label}</span>
                        <span className="block text-dark/60">{r.note}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-dark/70 leading-relaxed mb-3">{e.transport.busFareNote}</p>
                <a
                  href={BUS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-orange hover:underline"
                >
                  {e.transport.busLinkLabel} ↗
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                  <h3 className="font-bold text-dark mb-1">✈️ {e.transport.airportTitle}</h3>
                  <p className="text-sm text-dark/70 leading-relaxed">{e.transport.airportBody}</p>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                  <h3 className="font-bold text-dark mb-1">🚕 {e.transport.taxiTitle}</h3>
                  <p className="text-sm text-dark/70 leading-relaxed">{e.transport.taxiBody}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Good to know */}
          <section className="mb-8">
            <SectionTitle emoji="☀️">{e.tips.title}</SectionTitle>
            <ul className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-3">
              {e.tips.items.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm text-dark/80 leading-relaxed">
                  <span aria-hidden className="text-orange">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <GuideDisclaimer lang={lang} className="mb-8" />

          <div className="mb-10 text-center">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm"
            >
              {e.askUs} →
            </a>
          </div>

          {/* Related guides */}
          <div className="pb-16">
            <h2 className="text-lg font-bold text-dark mb-4">{g.relatedGuides}</h2>
            <div className="flex flex-wrap gap-3">
              {VISIBLE_GUIDE_SLUGS.filter((slug) => slug !== SLUG).map((slug) => (
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
