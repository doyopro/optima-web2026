import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('guides_beaches')
      .select(
        'id, name_en, name_es, description_en, description_es, location, distance_km, sand_type, difficulty, beach_type, amenities, latitude, longitude, image_url, rating',
      )
      .eq('is_published', true)
      .order('difficulty', { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ beaches: data ?? [] })
  } catch (err) {
    console.error('[/api/guides/beaches]', err)
    return NextResponse.json({ error: 'Failed to fetch beaches' }, { status: 500 })
  }
}
