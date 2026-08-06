import { translations } from './i18n'

export interface SiteContentRow {
  id: string
  section: string
  key: string
  value_en: string | null
  value_es: string | null
  value_es_needs_review: boolean
}

// `translations` is declared `as const` for type-safety everywhere it's read
// (`translations[lang].search.from` etc across ~19 files) — that's a
// TypeScript-only readonly guarantee, not a runtime one, so mutating the
// same object in place here is what lets every one of those call sites pick
// up database-backed content without themselves needing to change: they all
// already re-read `translations[lang]` on every render (via useLanguage()),
// so once this overlay mutates the shared object and LanguageProvider forces
// a re-render, the new values just show up.
const mutableTranslations = translations as unknown as Record<'en' | 'es', Record<string, unknown>>

function setByPath(node: Record<string, unknown>, path: string[], value: string): void {
  let cursor: Record<string, unknown> = node
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i]
    if (cursor[segment] === undefined || cursor[segment] === null) {
      const nextIsIndex = /^\d+$/.test(path[i + 1])
      cursor[segment] = nextIsIndex ? [] : {}
    }
    cursor = cursor[segment] as Record<string, unknown>
  }
  const lastSegment = path[path.length - 1]
  const existing = cursor[lastSegment]
  // Preserve numeric fields (e.g. testimonialsData[].rating) as numbers —
  // site_content stores everything as text.
  if (typeof existing === 'number') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) cursor[lastSegment] = parsed
    return
  }
  cursor[lastSegment] = value
}

// Only overwrites paths that have a real, non-empty value in the database —
// a missing/blank row leaves the static lib/i18n.ts default in place, so the
// site can never render blank text because of a missing/failed fetch.
export function applyContentOverlay(rows: SiteContentRow[]): void {
  for (const row of rows) {
    const path = [row.section, ...row.key.split('.')]
    if (row.value_en) setByPath(mutableTranslations.en, path, row.value_en)
    if (row.value_es) setByPath(mutableTranslations.es, path, row.value_es)
  }
}

export async function fetchAndApplySiteContent(): Promise<void> {
  try {
    const res = await fetch('/api/site-content')
    if (!res.ok) return
    const data = (await res.json()) as { rows: SiteContentRow[] }
    applyContentOverlay(data.rows ?? [])
  } catch {
    // Network failure — static lib/i18n.ts defaults remain in place.
  }
}
