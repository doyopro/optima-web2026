// Server-only — imports supabase-server.ts (service-role key), so this file
// must never be imported from a 'use client' component. Kept separate from
// content.ts (the shared merge logic) specifically so LanguageContext.tsx
// can import that file client-side without dragging the service-role client
// into the browser bundle.
import { supabaseServer } from './supabase-server'
import { type SiteContentRow } from './content'

// Deliberately returns rows rather than mutating `translations` itself:
// Next.js compiles Server Components and Client Components into separate
// module graphs, so a mutation made to `lib/i18n.ts` from this
// (server-only) module is invisible to the client-component copy of that
// same file that every page actually renders from — every page here is a
// 'use client' component. The rows are passed down as a prop into
// LanguageProvider (a client component), which applies the overlay to the
// client-graph's copy of `translations` instead, where it's actually read.
export async function fetchSiteContentRows(): Promise<SiteContentRow[]> {
  try {
    const { data, error } = await supabaseServer
      .from('site_content')
      .select('id, section, key, value_en, value_es, value_es_needs_review')
      .eq('company_id', 'optima')

    if (error || !data) {
      console.error('[content-server] site_content fetch failed', error?.message)
      return []
    }
    return data as SiteContentRow[]
  } catch (err) {
    console.error('[content-server]', err)
    return []
  }
}
