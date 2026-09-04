'use client'

import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'

export default function ComingSoon({ title }: { title: string }) {
  const { lang } = useLanguage()
  const t = translations[lang].dashboard

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-dark mb-6">{title}</h1>
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-dark/50">
          {t.comingSoon}
        </div>
      </div>
    </div>
  )
}
