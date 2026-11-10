import { type NextRequest, NextResponse } from 'next/server'
import { getListingQuote, GuestyRateLimitError } from '@/lib/guesty-server'

// Read-only: the total Guesty itself would charge for a stay (nightly fares +
// cleaning + fees + taxes). Whitelisted fields only — no payout/owner data.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = Math.max(1, Number(searchParams.get('guests') ?? '2') || 2)

    if (!listingId || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'listingId, checkIn and checkOut are required' }, { status: 400 })
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      return NextResponse.json({ error: 'checkOut must be after checkIn' }, { status: 400 })
    }

    return NextResponse.json(await getListingQuote(listingId, checkIn, checkOut, guests))
  } catch (err) {
    if (err instanceof GuestyRateLimitError) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    const message = err instanceof Error ? err.message : String(err)
    console.error('[GET /api/guesty/quote]', message)
    return NextResponse.json({ error: 'Failed to fetch quote', details: message }, { status: 500 })
  }
}
