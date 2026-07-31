import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Reservation statuses that actually occupy the calendar. Excluded:
// canceled, declined, expired (never happened / fell through) and inquiry
// (a guest enquiry, not a held booking) — confirmed against real data,
// see distinct status values in the commit message / PR description.
const BLOCKING_STATUSES = ['confirmed', 'reserved', 'closed']

export interface BookedRange {
  checkIn: string
  checkOut: string
}

/**
 * Real booked date ranges for a property, from Supabase reservations —
 * independent of Guesty pricing, so this still works while pricing is
 * rate-limited.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
    }

    const today = new Date().toISOString().slice(0, 10)

    const { data, error } = await supabaseServer
      .from('reservations')
      .select('check_in, check_out')
      .eq('property_id', propertyId)
      .in('status', BLOCKING_STATUSES)
      .gte('check_out', today)

    if (error) {
      console.error('[GET /api/availability]', error.message)
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
    }

    const bookedRanges: BookedRange[] = (data ?? []).map((r) => ({
      checkIn: r.check_in,
      checkOut: r.check_out,
    }))

    return NextResponse.json({ propertyId, bookedRanges })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[GET /api/availability]', errorMessage)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
