import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Public, read-only — guide copy only, nothing sensitive. Served from the
// service-role client (same reasoning as /api/site-content) so the anon
// key never touches guides_content directly.
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('guides_content')
      .select('id, slug, section, content_en, content_es, metadata')
      .eq('is_published', true)

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
