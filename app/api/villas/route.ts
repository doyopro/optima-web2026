import { type NextRequest, NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabasePublic
      .from('properties')
      .select(
        'id, name, city, region, country, bedrooms, bathrooms, max_guests, description_en, description_es, amenities, images',
      )

    if (error) {
      throw new Error(error.message)
    }

    const villas = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description_en || '',
      description_es: row.description_es || '',
      location: row.city || row.region || row.country || 'Lanzarote',
      bedrooms: row.bedrooms ?? 0,
      bathrooms: row.bathrooms ?? 0,
      guests_max: row.max_guests ?? 0,
      price_per_night_gbp: 0,
      rating: 0,
      reviews_count: 0,
      images: (row.images as string[]) ?? [],
      amenities: (row.amenities as string[]) ?? [],
      is_featured: true,
      slug: row.id,
    }))

    return NextResponse.json({ properties: villas, total: villas.length })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error('Supabase villas fetch error:', errorMessage)

    return NextResponse.json(
      { error: 'Failed to fetch villas', details: errorMessage },
      { status: 500 },
    )
  }
}
