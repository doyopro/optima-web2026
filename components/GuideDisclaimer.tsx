import { translations, type Language } from '@/lib/i18n'

// Shown on every guide that lists third-party services (ferries, buses,
// clinics, taxis...). The guides are information for guests only: Optima
// Villas does not operate, sell or take responsibility for any of them.
export default function GuideDisclaimer({ lang, className = '' }: { lang: Language; className?: string }) {
  const d = translations[lang].guidesPage.disclaimer
  return (
    <aside
      role="note"
      className={`rounded-2xl border border-orange/30 bg-orange/5 px-4 py-4 sm:px-5 text-sm leading-relaxed text-dark/80 ${className}`}
    >
      <p className="font-semibold text-dark mb-1">{d.title}</p>
      <p>{d.body}</p>
    </aside>
  )
}
