import { type NextRequest, NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const { data, error } = await supabasePublic
      .from('properties')
      .select(
        'id, name, city, region, country, bedrooms, bathrooms, max_guests, description_en, description_es, amenities, images',
      )
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const property = {
      id: data.id,
      name: data.name,
      description: data.description_en || '',
      description_es: data.description_es || '',
      location: data.city || data.region || data.country || 'Lanzarote',
      bedrooms: data.bedrooms ?? 0,
      bathrooms: data.bathrooms ?? 0,
      guests_max: data.max_guests ?? 0,
      price_per_night_gbp: 0,
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
