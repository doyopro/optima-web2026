import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const FIELDS = [
  'name', 'name_es', 'route_from', 'route_to', 'duration_minutes', 'frequency_daily',
  'price_eur', 'website', 'contact_phone', 'amenities', 'luggage_limit_kg',
  'notes_en', 'notes_es', 'is_published',
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
      .from('guides_ferries')
      .update(pickUpdate(body))
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return NextResponse.json({ error: 'Ferry not found' }, { status: 404 })

    return NextResponse.json({ ferry: data })
  } catch (err) {
    console.error('[PATCH /api/guides/ferries/[id]]', err)
    return NextResponse.json({ error: 'Failed to update ferry' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabaseServer.from('guides_ferries').delete().eq('id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/guides/ferries/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete ferry' }, { status: 500 })
  }
}
