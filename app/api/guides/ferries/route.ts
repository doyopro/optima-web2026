import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('guides_ferries')
      .select(
        'id, name, name_es, route_from, route_to, duration_minutes, frequency_daily, price_eur, website, contact_phone, amenities, luggage_limit_kg, notes_en, notes_es',
      )
      .eq('is_published', true)

    if (error) throw new Error(error.message)

    return NextResponse.json({ ferries: data ?? [] })
  } catch (err) {
    console.error('[/api/guides/ferries]', err)
    return NextResponse.json({ error: 'Failed to fetch ferries' }, { status: 500 })
  }
}
