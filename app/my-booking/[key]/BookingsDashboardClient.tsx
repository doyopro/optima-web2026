'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { translations, type Language } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import type { GuestContact, GuestReservation } from '@/lib/guest-auth'

function formatDate(value: string | null, lang: Language) {
  if (!value) return '—'
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function ReservationCard({ contactId, reservation, lang, t }: {
  contactId: string
  reservation: GuestReservation
  lang: Language
  t: { [K in keyof (typeof translations)['en']['guestPortal']['dashboard']]: string }
}) {
  const amount = reservation.currency === 'EUR' ? reservation.amount_eur : reservation.amount_gbp
  const currencySymbol = reservation.currency === 'EUR' ? '€' : '£'

  return (
    <Link
      href={`/my-booking/${contactId}/${reservation.id}`}
      className="block bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 hover:border-orange transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-bold text-dark">{reservation.property_name ?? '—'}</p>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
            reservation.paid ? 'bg-green/10 text-green-700' : 'bg-orange/10 text-orange'
          }`}
        >
          {reservation.paid ? t.paid : t.pending}
        </span>
      </div>
      <p className="text-xs text-dark/60 mb-3">
        {formatDate(reservation.check_in, lang)} → {formatDate(reservation.check_out, lang)}
      </p>
      <div className="flex items-center justify-between">
        {amount != null ? (
          <span className="text-sm font-bold text-dark">
            {currencySymbol}
            {Number(amount).toFixed(2)}
          </span>
        ) : (
          <span />
        )}
        <span className="text-xs font-semibold text-orange">{t.viewDetails}</span>
      </div>
    </Link>
  )
}

export default function BookingsDashboardClient({
  contact,
  reservations,
}: {
  contact: GuestContact
  reservations: GuestReservation[]
}) {
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

  const { upcoming, past } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const upcoming: GuestReservation[] = []
    const past: GuestReservation[] = []
    for (const r of reservations) {
      if (r.check_out && r.check_out < todayStr) {
        past.push(r)
      } else {
        upcoming.push(r)
      }
    }
    // Soonest check-in first for upcoming, most recent stay first for past.
    upcoming.sort((a, b) => (a.check_in ?? '').localeCompare(b.check_in ?? ''))
    past.sort((a, b) => (b.check_in ?? '').localeCompare(a.check_in ?? ''))
    return { upcoming, past }
  }, [reservations])

  const displayName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-2xl font-bold text-dark mb-1">{t.bookingsTitle}</h1>
          {displayName && (
            <p className="text-dark/60 text-sm mb-8">{t.greeting.replace('{name}', displayName)}</p>
          )}

          {reservations.length === 0 && (
            <p className="text-dark/60 text-sm bg-white rounded-2xl border border-neutral-100 p-6 mb-8">
              {t.noReservations}
            </p>
          )}

          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-3">{t.upcoming}</h2>
              <div className="space-y-3">
                {upcoming.map((r) => (
                  <ReservationCard key={r.id} contactId={contact.id} reservation={r} lang={lang} t={t} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-3">{t.past}</h2>
              <div className="space-y-3">
                {past.map((r) => (
                  <ReservationCard key={r.id} contactId={contact.id} reservation={r} lang={lang} t={t} />
                ))}
              </div>
            </div>
          )}

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
      <WhatsAppWidget lang={lang} />
    </>
  )
}
