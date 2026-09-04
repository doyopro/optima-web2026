'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { translations, type Language } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import type { GuestReservation } from '@/lib/guest-auth'

function formatDate(value: string | null, lang: Language) {
  if (!value) return '—'
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function MyBookingClient({ reservation }: { reservation: GuestReservation }) {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang].guestPortal.dashboard
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/guest/logout', { method: 'POST' })
    } finally {
      router.push('/guest-login')
    }
  }

  const amount = reservation.currency === 'EUR' ? reservation.amount_eur : reservation.amount_gbp
  const currencySymbol = reservation.currency === 'EUR' ? '€' : '£'

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-2xl font-bold text-dark mb-6">{t.title}</h1>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-5 mb-6">
            <Row label={t.property} value={reservation.property_name ?? '—'} />
            <div className="grid grid-cols-2 gap-4">
              <Row label={t.checkIn} value={formatDate(reservation.check_in, lang)} />
              <Row label={t.checkOut} value={formatDate(reservation.check_out, lang)} />
            </div>
            <Row label={t.guests} value={reservation.num_guests != null ? String(reservation.num_guests) : '—'} />
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-dark/40 uppercase tracking-wide font-semibold">{t.paymentStatus}</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  reservation.paid ? 'bg-green/10 text-green-700' : 'bg-orange/10 text-orange'
                }`}
              >
                {reservation.paid ? t.paid : t.pending}
              </span>
            </div>
            {amount != null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark/40 uppercase tracking-wide font-semibold">{t.amount}</span>
                <span className="text-sm font-bold text-dark">
                  {currencySymbol}
                  {Number(amount).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <Link
            href={`/my-booking/${reservation.id}/form`}
            className="block bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 hover:border-orange transition-colors mb-6"
          >
            <p className="text-sm font-bold text-dark mb-1">{t.formLink}</p>
            <p className="text-xs text-dark/60">{t.formSub}</p>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs text-dark/40 hover:text-orange transition-colors"
          >
            {t.logout}
          </button>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} villaName={reservation.property_name ?? undefined} />
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-dark/40 uppercase tracking-wide font-semibold mb-1">{label}</p>
      <p className="text-sm text-dark font-medium">{value}</p>
    </div>
  )
}
