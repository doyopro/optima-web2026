import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const SELECT =
  'id, name_en, name_es, description_en, description_es, location, distance_km, sand_type, difficulty, beach_type, amenities, latitude, longitude, image_url, rating, is_published'

// ?all=true (dashboard) returns every row, published or not, including
// is_published itself. The public guide page calls this with no query
// param and keeps getting only published beaches, as before.
export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get('all') === 'true'

    let query = supabaseServer.from('guides_beaches').select(SELECT).order('difficulty', { ascending: true })
    if (!all) query = query.eq('is_published', true)

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return NextResponse.json({ beaches: data ?? [] })
  } catch (err) {
    console.error('[GET /api/guides/beaches]', err)
    return NextResponse.json({ error: 'Failed to fetch beaches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name_en) {
      return NextResponse.json({ error: 'name_en is required' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('guides_beaches')
      .insert({
        name_en: body.name_en,
        name_es: body.name_es ?? '',
        description_en: body.description_en ?? '',
        description_es: body.description_es ?? '',
        location: body.location ?? '',
        distance_km: body.distance_km ?? null,
        sand_type: body.sand_type ?? '',
        difficulty: body.difficulty ?? 1,
        beach_type: body.beach_type ?? {},
        amenities: body.amenities ?? {},
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        image_url: body.image_url ?? null,
        rating: body.rating ?? null,
        is_published: body.is_published ?? false,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ beach: data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/guides/beaches]', err)
    return NextResponse.json({ error: 'Failed to create beach' }, { status: 500 })
  }
}
