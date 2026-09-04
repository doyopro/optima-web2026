import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const FIELDS = [
  'name_en', 'name_es', 'description_en', 'description_es', 'location',
  'distance_km', 'sand_type', 'difficulty', 'beach_type', 'amenities',
  'latitude', 'longitude', 'image_url', 'rating', 'is_published',
] as const

function pickUpdate(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {}
  for (const field of FIELDS) {
    if (body[field] !== undefined) update[field] = body[field]
  }
  return update
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseServer
      .from('guides_beaches')
      .update(pickUpdate(body))
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return NextResponse.json({ error: 'Beach not found' }, { status: 404 })

    return NextResponse.json({ beach: data })
  } catch (err) {
    console.error('[PATCH /api/guides/beaches/[id]]', err)
    return NextResponse.json({ error: 'Failed to update beach' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabaseServer.from('guides_beaches').delete().eq('id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/guides/beaches/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete beach' }, { status: 500 })
  }
}
