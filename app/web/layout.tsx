'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'

// Internal dashboard shell — no PIN/auth yet (see app/web/guides/page.tsx),
// that lands dashboard-wide in a later phase.

const TABS = ['faqs', 'properties', 'guides', 'content'] as const

export default function WebLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage()
  const t = translations[lang].dashboard
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="text-lg font-bold text-dark pt-5 pb-3">{t.title}</h1>
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {TABS.map((key) => {
              const href = `/web/${key}`
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={key}
                  href={href}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    active ? 'border-orange text-orange' : 'border-transparent text-dark/50 hover:text-dark'
                  }`}
                >
                  {t.tabs[key]}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  )
}
