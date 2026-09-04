import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const SELECT =
  'id, name, name_es, route_from, route_to, duration_minutes, frequency_daily, price_eur, website, contact_phone, amenities, luggage_limit_kg, notes_en, notes_es, is_published'

// ?all=true (dashboard) returns every row, published or not. The public
// guide page calls this with no query param and keeps getting only
// published ferries, as before.
export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get('all') === 'true'

    let query = supabaseServer.from('guides_ferries').select(SELECT)
    if (!all) query = query.eq('is_published', true)

    const { data, error } = await query

    if (error) throw new Error(error.message)

    return NextResponse.json({ ferries: data ?? [] })
  } catch (err) {
    console.error('[GET /api/guides/ferries]', err)
    return NextResponse.json({ error: 'Failed to fetch ferries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('guides_ferries')
      .insert({
        name: body.name,
        name_es: body.name_es ?? '',
        route_from: body.route_from ?? '',
        route_to: body.route_to ?? '',
        duration_minutes: body.duration_minutes ?? null,
        frequency_daily: body.frequency_daily ?? null,
        price_eur: body.price_eur ?? null,
        website: body.website ?? '',
        contact_phone: body.contact_phone ?? '',
        amenities: body.amenities ?? {},
        luggage_limit_kg: body.luggage_limit_kg ?? null,
        notes_en: body.notes_en ?? '',
        notes_es: body.notes_es ?? '',
        is_published: body.is_published ?? false,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ ferry: data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/guides/ferries]', err)
    return NextResponse.json({ error: 'Failed to create ferry' }, { status: 500 })
  }
}
