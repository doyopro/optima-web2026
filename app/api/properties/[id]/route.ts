import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { extractVvLicense } from '@/lib/property'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // overview_en/es, highlights_en/es and the_space_en/es aren't in the
    // anon role's granted columns yet (same situation already handled in
    // /api/villas/route.ts for owner_name) — service role bypasses that,
    // safe here since none of this is sensitive, it's the same public
    // villa copy the anon client already exposes for every other column.
    const { data, error } = await supabaseServer
      .from('properties')
      .select(
        'id, guesty_listing_id, name, type, city, region, country, latitude, longitude, bedrooms, bathrooms, max_guests, description_en, description_es, overview_en, overview_es, highlights_en, highlights_es, the_space_en, the_space_es, amenities, images, base_price_gbp',
      )
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const en = extractVvLicense(data.description_en || '')
    const es = extractVvLicense(data.description_es || '')
    const overviewEn = data.overview_en ? extractVvLicense(data.overview_en) : null
    const overviewEs = data.overview_es ? extractVvLicense(data.overview_es) : null

    const property = {
      id: data.id,
      name: data.name,
      description: en.text,
      description_es: es.text,
      overview: overviewEn?.text || undefined,
      overview_es: overviewEs?.text || undefined,
      highlights: data.highlights_en || undefined,
      highlights_es: data.highlights_es || undefined,
      the_space: data.the_space_en || undefined,
      the_space_es: data.the_space_es || undefined,
      vv_license: en.license || es.license || overviewEn?.license || overviewEs?.license || undefined,
      guesty_listing_id: data.guesty_listing_id || undefined,
      type: data.type || undefined,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      location: data.city || data.region || data.country || 'Lanzarote',
      bedrooms: data.bedrooms ?? 0,
      bathrooms: data.bathrooms ?? 0,
      guests_max: data.max_guests ?? 0,
      price_per_night_gbp: data.base_price_gbp ?? 0,
      rating: 0,
      reviews_count: 0,
      images: (data.images as string[]) ?? [],
      amenities: (data.amenities as string[]) ?? [],
      is_featured: true,
      slug: data.id,
    }

    return NextResponse.json({ property })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[GET /api/properties/[id]]', errorMessage)
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}
