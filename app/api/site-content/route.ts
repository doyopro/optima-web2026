import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 300

// Public, read-only — site copy only, nothing sensitive. Served from the
// service-role client (same reasoning as /api/villas) since this route is
// the only thing that ever reads site_content for the live site; the
// dashboard's own Web editor talks to Supabase separately.
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('site_content')
      .select('id, section, key, value_en, value_es, value_es_needs_review')
      .eq('company_id', 'optima')

    if (error) {
      console.error('[/api/site-content]', error.message)
      return NextResponse.json({ rows: [] }, { status: 200 })
    }

    return NextResponse.json({ rows: data ?? [] })
  } catch (err) {
    console.error('[/api/site-content]', err)
    return NextResponse.json({ rows: [] }, { status: 200 })
  }
}
