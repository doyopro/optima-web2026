import { type NextRequest } from 'next/server'
import { MOCK_PROPERTIES } from '@/lib/mock-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const property = MOCK_PROPERTIES.find((p) => p.id === id || p.slug === id)

    if (!property) {
      return Response.json({ error: 'Property not found' }, { status: 404 })
    }

    return Response.json({ property })
  } catch (err) {
    console.error('[GET /api/properties/[id]]', err)
    return Response.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}
