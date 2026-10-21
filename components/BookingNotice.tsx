'use client'

import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { CHECKOUT_ENABLED } from '@/lib/features'
import { BOOKING_EMAIL, BOOKING_WHATSAPP_DISPLAY } from '@/lib/contact'

// Visible only while online checkout is switched off.
export default function BookingNotice({ className = '' }: { className?: string }) {
  const { lang } = useLanguage()
  if (CHECKOUT_ENABLED) return null
  const text = translations[lang].propertyEnquiry.bookingNotice
    .replace('{email}', BOOKING_EMAIL)
    .replace('{whatsapp}', BOOKING_WHATSAPP_DISPLAY)
  return (
    <div role="note" className={`rounded-xl border border-orange/30 bg-orange/5 px-4 py-3 text-sm text-dark/80 leading-relaxed ${className}`}>
      {text}
    </div>
  )
}
