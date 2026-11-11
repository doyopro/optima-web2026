'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { pushEvent } from '@/lib/analytics'
import { Check } from 'lucide-react'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

// "Request quotes" conversion: this page is reached only from the GUEST
// enquiry form (/property-enquiry); owner enquiries are a separate on-page
// form. One generate_lead per real submission: the form leaves a one-shot
// flag in sessionStorage which is consumed here, so reloading this page or
// opening it directly never counts again.
function useLeadEvent() {
  useEffect(() => {
    let pending: string | null = null
    try {
      pending = sessionStorage.getItem('optima_pending_lead')
      if (pending) sessionStorage.removeItem('optima_pending_lead')
    } catch {}
    if (pending === 'guest_enquiry') pushEvent({ event: 'generate_lead', lead_type: 'guest_enquiry' })
  }, [])
}

export default function PropertyEnquiryThankYouPage() {
  useLeadEvent()
  const { lang } = useLanguage()
  const t = translations[lang].propertyEnquiry

  return (
    <>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green/10 text-green-600 mb-6">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-dark mb-3">{t.thankYouTitle}</h1>
        <p className="text-dark/60 max-w-md mb-8">{t.thankYouText}</p>
        <Link href="/villas" className="text-orange font-semibold text-sm hover:underline">
          {t.thankYouBack} →
        </Link>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
