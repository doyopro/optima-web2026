'use client'

import Link from 'next/link'
import Image from 'next/image'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

// Placeholder/sample data for design review only — this page isn't wired
// to a real booking yet. Once real payment is connected, this route
// should read an actual reservation (e.g. by a booking reference in the
// URL) instead of these constants.
const SAMPLE_BOOKING = {
  reference: 'OPV-24601',
  villaName: 'Villa del Ajache Grande',
  villaImage:
    'https://assets.guesty.com/image/upload/v1713511802/production/5f297bd907e0840029b8001a/bhszzu9fohwsdgnfilyo.jpg',
  checkIn: '2026-10-12',
  checkOut: '2026-10-19',
  guests: 4,
  amountPaid: 380,
  balanceDue: 1140,
  balanceDueDate: '2026-08-28',
}

function formatDate(dateStr: string, lang: string): string {
  return new Date(dateStr).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BookingConfirmationPage() {
  const { lang } = useLanguage()
  const t = translations[lang].confirmation
  const b = SAMPLE_BOOKING

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-4 py-2.5 mb-8 text-center">
            {t.sampleNotice}
          </div>

          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green/20 text-green text-3xl">
              ✓
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark mb-2">{t.title}</h1>
            <p className="text-dark/60">{t.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="relative aspect-video">
              <Image src={b.villaImage} alt={b.villaName} fill className="object-cover" priority />
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <span className="text-sm text-dark/50">{t.bookingReference}</span>
                <span className="font-mono font-bold text-dark">{b.reference}</span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1">{t.villa}</p>
                <p className="font-bold text-dark">{b.villaName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1">{t.checkIn}</p>
                  <p className="text-dark font-medium text-sm">{formatDate(b.checkIn, lang)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1">{t.checkOut}</p>
                  <p className="text-dark font-medium text-sm">{formatDate(b.checkOut, lang)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1">{t.guests}</p>
                  <p className="text-dark font-medium text-sm">{b.guests}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark/60">{t.amountPaid}</span>
                  <span className="font-bold text-dark">£{b.amountPaid.toFixed(0)}</span>
                </div>
                {b.balanceDue > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-dark/60">
                      {t.balanceDue} · {t.balanceDueBy} {formatDate(b.balanceDueDate, lang)}
                    </span>
                    <span className="font-medium text-dark">£{b.balanceDue.toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mt-6">
            <h2 className="font-bold text-dark mb-2">{t.whatNext}</h2>
            <p className="text-sm text-dark/60 leading-relaxed">{t.whatNextText}</p>
          </div>

          <div className="text-center mt-8">
            <Link href="/villas" className="text-orange font-semibold text-sm hover:underline">
              {t.backToVillas} →
            </Link>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
