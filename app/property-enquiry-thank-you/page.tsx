'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

// NOT wired yet, deliberately (per 2026-09 decision): the "Request quotes"
// Google Ads conversion needs its exact trigger confirmed against this real
// guest-facing form first (this page/form didn't exist before), so pushing
// a dataLayer event here is a follow-up task, not part of building the form
// itself. Once confirmed, the shape should mirror the Purchases event in
// components/StripeCheckoutForm.tsx:
//
// useEffect(() => {
//   window.dataLayer = window.dataLayer || []
//   window.dataLayer.push({ event: 'property_enquiry_submitted' })
// }, [])

export default function PropertyEnquiryThankYouPage() {
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
