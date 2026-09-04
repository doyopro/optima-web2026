'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function GuestLoginPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang].guestPortal.login

  const [bookingCode, setBookingCode] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/guest/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode, lastName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      router.push(`/my-booking/${data.reservationId}`)
    } catch {
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange/10 text-orange text-2xl">
              📋
            </div>
            <h1 className="text-2xl font-bold text-dark mb-2">{t.title}</h1>
            <p className="text-dark/60 text-sm">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1.5">
                {t.bookingCodeLabel}
              </label>
              <input
                type="text"
                required
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-orange/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1.5">
                {t.lastNameLabel}
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-orange/40"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 disabled:opacity-50 transition-colors text-sm"
            >
              {loading ? t.loading : t.submit}
            </button>
          </form>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
