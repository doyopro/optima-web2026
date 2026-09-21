'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { renderMarkdownLite } from '@/lib/markdown-lite'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface SiteContentRow {
  section: string
  key: string
  value_en: string | null
  value_es: string | null
}

interface PrivacySection {
  n: number
  heading: string
  body: string
}

interface PrivacyContent {
  title: string
  lastUpdated: string
  sections: PrivacySection[]
}

// value_es is NULL for every privacy row today (Spanish legal translation is
// pending human review) — fall back to English rather than rendering blank.
function pick(row: SiteContentRow | undefined, lang: 'en' | 'es'): string {
  if (!row) return ''
  return (lang === 'es' && row.value_es) || row.value_en || ''
}

function buildPrivacyContent(rows: SiteContentRow[], lang: 'en' | 'es'): PrivacyContent | null {
  const privacyRows = rows.filter((r) => r.section === 'privacy')
  if (privacyRows.length === 0) return null

  const byKey = new Map(privacyRows.map((r) => [r.key, r]))

  const sections: PrivacySection[] = []
  for (let n = 1; ; n++) {
    const heading = byKey.get(`section${n}.heading`)
    const body = byKey.get(`section${n}.body`)
    if (!heading && !body) break
    sections.push({
      n,
      heading: pick(heading, lang),
      body: pick(body, lang),
    })
  }

  return {
    title: pick(byKey.get('title'), lang),
    lastUpdated: pick(byKey.get('lastUpdated'), lang),
    sections,
  }
}

export default function PrivacyClient() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [rows, setRows] = useState<SiteContentRow[] | null>(null)

  useEffect(() => {
    fetch('/api/site-content')
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .catch(() => setRows([]))
  }, [])

  const content = rows ? buildPrivacyContent(rows, lang) : null

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
          <nav className="flex items-center gap-2 text-sm text-dark/50 mb-6">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <span className="text-dark">{content?.title || t.footer.links.privacy}</span>
          </nav>

          {!rows && (
            <div className="animate-pulse text-dark/40 text-lg py-16 text-center">…</div>
          )}

          {rows && !content && (
            <p className="text-dark/60 text-center py-16">
              We could not load the Privacy Policy right now — please try again shortly.
            </p>
          )}

          {content && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-10 mb-10">
              <h1 className="text-2xl md:text-3xl font-bold text-dark mb-2">{content.title}</h1>
              {content.lastUpdated && (
                <p className="text-sm text-dark/50 mb-10">{content.lastUpdated}</p>
              )}

              <div className="space-y-10">
                {content.sections.map((section) => (
                  <div key={section.n}>
                    <h2 className="text-lg font-bold text-dark mb-3">{section.heading}</h2>
                    <div className="text-dark/70 leading-relaxed space-y-4">
                      {renderMarkdownLite(section.body)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link href="/" className="text-orange font-semibold text-sm hover:underline">
              {t.termsPage.backHome} →
            </Link>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
