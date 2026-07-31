'use client'

import { useState } from 'react'
import { type Language, translations } from '@/lib/i18n'

interface Props {
  lang: Language
}

export default function Faq({ lang }: Props) {
  const t = translations[lang].faq
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(i: number) {
    setOpenIndex((prev) => (prev === i ? null : i))
  }

  return (
    <section className="bg-white py-20 md:py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4 tracking-tight">{t.title}</h2>
          <p className="text-dark/60 text-lg">{t.subtitle}</p>
        </div>

        <div className="space-y-3">
          {t.items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={item.q}
                className="border border-neutral-200 rounded-xl overflow-hidden bg-cream/40"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold text-dark hover:text-orange transition-colors"
                >
                  <span>{item.q}</span>
                  <span
                    className={`shrink-0 text-orange transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-dark/70 leading-relaxed">{item.a}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
