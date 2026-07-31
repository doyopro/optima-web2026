import { type NextRequest, NextResponse } from 'next/server'
import { getListingPricing, GuestyRateLimitError } from '@/lib/guesty-server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')

    if (!listingId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'listingId, checkIn and checkOut are required' },
        { status: 400 },
      )
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return NextResponse.json({ error: 'checkOut must be after checkIn' }, { status: 400 })
    }

    const pricing = await getListingPricing(listingId, checkIn, checkOut)

    return NextResponse.json(pricing)
  } catch (err) {
    if (err instanceof GuestyRateLimitError) {
      console.error('[GET /api/guesty/pricing] rate limited by Guesty')
      return NextResponse.json(
        { error: 'rate_limited', details: 'Guesty pricing is temporarily unavailable, please use the Book Now link.' },
        { status: 429 },
      )
    }

    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[GET /api/guesty/pricing]', errorMessage)
    return NextResponse.json({ error: 'Failed to fetch pricing', details: errorMessage }, { status: 500 })
  }
}
