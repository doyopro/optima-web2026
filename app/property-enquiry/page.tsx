'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

type SubmitState = 'idle' | 'submitting' | 'error'

export default function PropertyEnquiryPage() {
  const { lang } = useLanguage()
  const t = translations[lang].propertyEnquiry
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    propertyInterest: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    message: '',
  })
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitState('submitting')
    try {
      const res = await fetch('/api/property-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          property_interest: form.propertyInterest,
          check_in: form.checkIn || undefined,
          check_out: form.checkOut || undefined,
          guests: form.guests ? Number(form.guests) : undefined,
          message: form.message,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      router.push('/property-enquiry-thank-you')
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-dark mb-3">{t.title}</h1>
            <p className="text-dark/60">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                  {t.name}
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
                  {t.email}
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
                  {t.phone}
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
                  {t.propertyInterest}
                </label>
                <input
                  type="text"
                  placeholder={t.propertyInterestPlaceholder}
                  value={form.propertyInterest}
                  onChange={(e) => setForm((f) => ({ ...f, propertyInterest: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                  {t.checkIn}
                </label>
                <input
                  type="date"
                  value={form.checkIn}
                  onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                  {t.checkOut}
                </label>
                <input
                  type="date"
                  value={form.checkOut}
                  onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                  {t.guests}
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.guests}
                  onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-orange focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-dark/60 mb-1.5">
                {t.message}
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
              {submitState === 'submitting' ? t.submitting : t.submit}
            </button>

            {submitState === 'error' && (
              <p className="text-sm text-center text-red-700 bg-red-50 rounded-lg py-3">{t.error}</p>
            )}
          </form>

          <div className="text-center mt-10">
            <Link href="/" className="text-orange font-semibold text-sm hover:underline">
              {t.backHome} →
            </Link>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
