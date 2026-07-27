import { type NextRequest } from 'next/server'
import { MOCK_PROPERTIES } from '@/lib/mock-data'

// TODO: Replace with real Guesty API call:
// const res = await fetch(`${GUESTY_BASE}/availability?listingId=${villa_id}&startDate=${check_in}&endDate=${check_out}`, {
//   headers: { Authorization: `Bearer ${process.env.GUESTY_API_KEY}` }
// })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { villa_id, check_in, check_out } = body as {
      villa_id: string
      check_in: string
      check_out: string
    }

    if (!villa_id || !check_in || !check_out) {
      return Response.json({ error: 'villa_id, check_in, check_out are required' }, { status: 400 })
    }

    const property = MOCK_PROPERTIES.find((p) => p.id === villa_id || p.slug === villa_id)
    if (!property) {
      return Response.json({ error: 'Property not found' }, { status: 404 })
    }

    const inDate = new Date(check_in)
    const outDate = new Date(check_out)

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime()) || outDate <= inDate) {
      return Response.json({ error: 'Invalid dates' }, { status: 400 })
    }

    const nights = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24))

    // Mock: always available for demo
    return Response.json({
      property_id: villa_id,
      check_in,
      check_out,
      available: true,
      price_total: nights * property.price_per_night_gbp,
      nights,
    })
  } catch (err) {
    console.error('[POST /api/availability]', err)
    return Response.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
