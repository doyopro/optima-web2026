import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Public, read-only — guide copy only, nothing sensitive. Served from the
// service-role client (same reasoning as /api/site-content) so the anon
// key never touches guides_content directly.
//
// ?all=true (dashboard) returns every row, published or not, and includes
// is_published. The public guide pages call this with no query param and
// keep getting only published guides, as before.
export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get('all') === 'true'

    let query = supabaseServer.from('guides_content').select('id, slug, section, content_en, content_es, metadata, is_published')
    if (!all) query = query.eq('is_published', true)

    const { data, error } = await query

    if (error) throw new Error(error.message)

    const guides = (data ?? []).slice().sort((a, b) => {
      const orderA = typeof a.metadata?.order === 'number' ? a.metadata.order : 0
      const orderB = typeof b.metadata?.order === 'number' ? b.metadata.order : 0
      return orderA - orderB
    })

    return NextResponse.json({ guides })
  } catch (err) {
    console.error('[/api/guides]', err)
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 })
  }
}
