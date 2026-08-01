'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { Share2, MessageCircle, Wrench, FileCheck2, BarChart3, LayoutDashboard, ArrowUpRight } from 'lucide-react'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { type Property } from '@/lib/types'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import ReviewBadges from '@/components/ReviewBadges'

const OWNERS_WHATSAPP_NUMBER = '34617387171'
const TRUSTPILOT_URL = 'https://uk.trustpilot.com/review/optimavillaslanzarote.com'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function OwnersPage() {
  const { lang } = useLanguage()
  const t = translations[lang].owners

  const [form, setForm] = useState({ name: '', email: '', phone: '', propertyLocation: '', message: '' })
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const whatsappUrl = `https://wa.me/${OWNERS_WHATSAPP_NUMBER}?text=${encodeURIComponent(t.hero.whatsappMessage)}`

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitState('submitting')
    try {
      const res = await fetch('/api/owner-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          property_location: form.propertyLocation,
          message: form.message,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSubmitState('success')
      setForm({ name: '', email: '', phone: '', propertyLocation: '', message: '' })
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <>
      <main className="flex min-h-screen flex-col bg-cream">
        {/* --- HERO --- */}
        <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden px-4 py-24 sm:px-6">
          <Image
            src="/lanzarote14.jpg"
            alt="Charco de los Clicos green lagoon, Lanzarote"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-dark/75" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,rgba(226,102,32,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(28,175,230,0.15),transparent_50%)]" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl drop-shadow-lg">
              {t.hero.title}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-200/90 sm:text-xl font-light leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact"
                className="w-full sm:w-auto rounded-xl bg-orange px-8 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-orange/90 hover:shadow-lg text-center"
              >
                {t.hero.ctaContact}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto rounded-xl border border-white/30 bg-white/10 backdrop-blur px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/20 text-center"
              >
                {t.hero.ctaWhatsapp}
              </a>
            </div>
          </div>
        </section>

        {/* --- TRUST BLOCK --- */}
        <section className="bg-white py-16 md:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-dark text-center mb-12">{t.trust.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <TrustPoint icon={<MapPinIcon className="h-7 w-7" />} title={t.trust.localKnowledge} desc={t.trust.localKnowledgeDesc} />
              <TrustPoint icon={<ShieldIcon className="h-7 w-7" />} title={t.trust.noHiddenFees} desc={t.trust.noHiddenFeesDesc} />
              <TrustPoint icon={<StarIcon className="h-7 w-7" />} title={t.trust.reviews} desc={t.trust.reviewsDesc} />
              <TrustPoint icon={<HeadsetIcon className="h-7 w-7" />} title={t.trust.support} desc={t.trust.supportDesc} />
            </div>
          </div>
        </section>

        {/* --- PROPERTY PHOTO STRIP --- */}
        <PropertyPhotoStrip ariaLabel={t.gallery.ariaLabel} />

        {/* --- FOUNDER STORY --- */}
        <section className="bg-neutral-50 py-16 md:py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative aspect-[938/1018] rounded-3xl overflow-hidden shadow-lg order-2 lg:order-1">
              <Image
                src="/sonia-full.jpg"
                alt={t.founder.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-2">{t.founder.title}</h2>
              <p className="text-orange font-semibold mb-1">{t.founder.name}</p>
              <p className="text-dark/50 text-sm mb-6">{t.founder.role}</p>
              <p className="text-dark/70 leading-relaxed whitespace-pre-line">{t.founder.text}</p>
              <a
                href="https://optimaestate.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-dark/50 hover:text-orange transition-colors underline underline-offset-2"
              >
                {t.founder.optimaEstateCta} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* --- OWNER TESTIMONIALS — discreet, text-first quote style, deliberately
             distinct from the homepage's colored testimonial cards --- */}
        <section className="bg-white py-16 md:py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-dark text-center mb-12">{t.testimonials.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
              {t.testimonials.items.map((item) => (
                <div key={item.author}>
                  <span className="block text-5xl leading-none text-orange/30 font-serif mb-2" aria-hidden="true">
                    &ldquo;
                  </span>
                  <p className="text-dark/80 leading-relaxed">{item.text}</p>
                  <div className="mt-4 pt-4 border-t border-neutral-200 text-sm">
                    <span className="font-semibold text-dark">{item.author}</span>
                    <span className="text-dark/40"> · {item.property}</span>
                  </div>
                </div>
              ))}
            </div>
            <ReviewBadges lang={lang} />
          </div>
        </section>

        {/* --- TRUSTPILOT --- */}
        <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
          <Image
            src="/lanzarote14.jpg"
            alt="Volcanic coastline and green lagoon at El Golfo, Lanzarote"
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-dark/70" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-lg text-white/90 mb-4">{t.trustpilot.text}</p>
            <a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-orange hover:text-white transition-colors uppercase tracking-wide"
            >
              {t.trustpilot.cta} <span className="text-lg">→</span>
            </a>
          </div>
        </section>

        {/* --- WHAT'S INCLUDED --- */}
        <section className="bg-white py-16 md:py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-dark text-center mb-12">{t.included.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <IncludedItem icon={<Share2 className="h-6 w-6" strokeWidth={1.8} />} title={t.included.channelDistribution} desc={t.included.channelDistributionDesc} />
              <IncludedItem icon={<MessageCircle className="h-6 w-6" strokeWidth={1.8} />} title={t.included.guestCommunication} desc={t.included.guestCommunicationDesc} />
              <IncludedItem icon={<Wrench className="h-6 w-6" strokeWidth={1.8} />} title={t.included.maintenance} desc={t.included.maintenanceDesc} />
              <IncludedItem icon={<FileCheck2 className="h-6 w-6" strokeWidth={1.8} />} title={t.included.compliance} desc={t.included.complianceDesc} />
              <IncludedItem icon={<BarChart3 className="h-6 w-6" strokeWidth={1.8} />} title={t.included.reports} desc={t.included.reportsDesc} />
              <IncludedItem icon={<LayoutDashboard className="h-6 w-6" strokeWidth={1.8} />} title={t.included.portal} desc={t.included.portalDesc} />
            </div>
          </div>
        </section>

        {/* --- CONTACT FORM --- */}
        <section id="contact" className="bg-neutral-50 py-16 md:py-24 px-4 sm:px-6 scroll-mt-6">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-3">{t.contact.title}</h2>
              <p className="text-dark/60">{t.contact.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                    {t.contact.name}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                    {t.contact.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                    {t.contact.phone}
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                    {t.contact.propertyLocation}
                  </label>
                  <input
                    type="text"
                    value={form.propertyLocation}
                    onChange={(e) => setForm((f) => ({ ...f, propertyLocation: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                  {t.contact.message}
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitState === 'submitting'}
                className="w-full bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50 text-sm"
              >
                {submitState === 'submitting' ? t.contact.submitting : t.contact.submit}
              </button>

              {submitState === 'success' && (
                <p className="text-sm text-center text-green-700 bg-green/20 rounded-lg py-3">{t.contact.success}</p>
              )}
              {submitState === 'error' && (
                <p className="text-sm text-center text-red-700 bg-red-50 rounded-lg py-3">{t.contact.error}</p>
              )}
            </form>
          </div>
        </section>
      </main>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}

const PHOTO_STRIP_COUNT = 14

function PropertyPhotoStrip({ ariaLabel }: { ariaLabel: string }) {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/villas')
      .then((r) => r.json())
      .then((data) => {
        const properties = (data.properties as Property[]) ?? []
        const withPhotos = properties.filter((p) => p.images?.length)

        // Shuffle so the strip draws from different properties, not just the first N.
        const shuffled = [...withPhotos]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        setImages(shuffled.slice(0, PHOTO_STRIP_COUNT).map((p) => p.images[0]))
      })
      .catch(() => setImages([]))
  }, [])

  if (images.length === 0) return null

  // Duplicate the list so the marquee loop is seamless.
  const strip = [...images, ...images]

  return (
    <section className="bg-white py-10 overflow-hidden" aria-label={ariaLabel}>
      <div className="flex w-max animate-marquee gap-4 px-4">
        {strip.map((src, i) => (
          <div key={i} className="relative h-40 w-60 sm:h-48 sm:w-72 shrink-0 rounded-2xl overflow-hidden">
            <Image src={src} alt="" fill sizes="288px" loading="lazy" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  )
}

function TrustPoint({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange/10 text-orange">{icon}</div>
      <h3 className="font-bold text-dark">{title}</h3>
      <p className="text-sm text-dark/60 leading-relaxed">{desc}</p>
    </div>
  )
}

function IncludedItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-dark mb-1">{title}</h3>
        <p className="text-sm text-dark/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5 15 9l7 1-5.2 4.9L18.2 22 12 18.3 5.8 22l1.4-7.1L2 10l7-1 3-6.5Z" />
    </svg>
  )
}

function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
      <path d="M19.5 19v.5a3.5 3.5 0 0 1-3.5 3.5h-3" />
    </svg>
  )
}

