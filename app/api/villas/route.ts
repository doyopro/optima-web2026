import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { extractVvLicense } from '@/lib/property'
import { type BookedRange, rangeOverlapsBooking } from '@/lib/availability'

// Same blocking statuses established for the villa-detail-page availability
// check: confirmed/reserved/closed hold the calendar, canceled/declined/
// expired/inquiry don't.
const BLOCKING_STATUSES = ['confirmed', 'reserved', 'closed']

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')

    // owner_name isn't in the anon role's granted columns (needed here for
    // the SunBeach sort demotion), so this uses the service-role client —
    // safe since it's server-side only and nothing secret is exposed to
    // the client beyond what was already public.
    // Service role bypasses RLS entirely, so the "active only" restriction
    // the anon client got for free from RLS has to be applied explicitly here.
    const { data, error } = await supabaseServer
      .from('properties')
      .select(
        'id, guesty_listing_id, name, city, region, country, bedrooms, bathrooms, max_guests, description_en, description_es, amenities, images, base_price_gbp, owner_name, is_tina_partner',
      )
      .eq('status', 'active')

    if (error) {
      throw new Error(error.message)
    }

    let villas = (data || []).map((row) => {
      const en = extractVvLicense(row.description_en || '')
      const es = extractVvLicense(row.description_es || '')

      return {
        id: row.id,
        name: row.name,
        description: en.text,
        description_es: es.text,
        vv_license: en.license || es.license || undefined,
        guesty_listing_id: row.guesty_listing_id || undefined,
        location: row.city || row.region || row.country || 'Lanzarote',
        bedrooms: row.bedrooms ?? 0,
        bathrooms: row.bathrooms ?? 0,
        guests_max: row.max_guests ?? 0,
        price_per_night_gbp: row.base_price_gbp ?? 0,
        rating: 0,
        reviews_count: 0,
        images: (row.images as string[]) ?? [],
        amenities: (row.amenities as string[]) ?? [],
        is_featured: true,
        slug: row.id,
        owner_name: row.owner_name ?? null,
        is_tina_partner: row.is_tina_partner ?? false,
      }
    })

    // Only filter by availability when both dates are present — default
    // browsing (no dates) must stay exactly as fast/unfiltered as before.
    if (checkIn && checkOut) {
      const propertyIds = villas.map((v) => v.id)

      const { data: overlapping, error: reservationsError } = await supabaseServer
        .from('reservations')
        .select('property_id, check_in, check_out')
        .in('property_id', propertyIds)
        .in('status', BLOCKING_STATUSES)
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)

      if (reservationsError) {
        throw new Error(reservationsError.message)
      }

      const rangesByProperty = new Map<string, BookedRange[]>()
      for (const r of overlapping ?? []) {
        const ranges = rangesByProperty.get(r.property_id) ?? []
        ranges.push({ checkIn: r.check_in, checkOut: r.check_out })
        rangesByProperty.set(r.property_id, ranges)
      }

      villas = villas.filter((v) => {
        const ranges = rangesByProperty.get(v.id)
        if (!ranges) return true
        return !rangeOverlapsBooking(checkIn, checkOut, ranges)
      })
    }

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
