import { type NextRequest } from 'next/server'
import { MOCK_PROPERTIES } from '@/lib/mock-data'
import { type Property, type SearchParams } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const params = (await request.json()) as SearchParams

    let properties: Property[] = MOCK_PROPERTIES

    if (params.villa_id) {
      properties = properties.filter((p) => p.id === params.villa_id || p.slug === params.villa_id)
    }
    if (params.location) {
      properties = properties.filter(
        (p) => p.location.toLowerCase() === params.location!.toLowerCase(),
      )
    }
    if (params.guests) {
      properties = properties.filter((p) => p.guests_max >= params.guests!)
    }
    if (params.min_price) {
      properties = properties.filter((p) => p.price_per_night_gbp >= params.min_price!)
    }
    if (params.max_price) {
      properties = properties.filter((p) => p.price_per_night_gbp <= params.max_price!)
    }
    if (params.bedrooms) {
      properties = properties.filter((p) => p.bedrooms >= params.bedrooms!)
    }

    // TODO: Filter by actual availability from Guesty when check_in / check_out provided

    return Response.json({ properties, total: properties.length, params })
  } catch (err) {
    console.error('[POST /api/search]', err)
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
