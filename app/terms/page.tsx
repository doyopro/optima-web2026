'use client'

import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function TermsPage() {
  const { lang } = useLanguage()
  const t = translations[lang].termsPage

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex justify-center mb-8">
            <Image src="/logooptima.png" alt="Optima Villas" width={160} height={49} priority />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-dark mb-4 text-center">{t.title}</h1>
          <p className="text-dark/60 leading-relaxed mb-10 text-center max-w-xl mx-auto">{t.intro}</p>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-10 space-y-8">
            {t.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-lg font-bold text-dark mb-2">{section.heading}</h2>
                <p className="text-dark/70 leading-relaxed whitespace-pre-line">{section.body}</p>
              </div>
            ))}
          </div>

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
