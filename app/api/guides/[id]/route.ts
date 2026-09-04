import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// No auth check yet — the dashboard this serves has none either. Both will
// gain PIN/auth together in a later phase.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const update: Record<string, unknown> = {}
    if (typeof body.content_en === 'string') update.content_en = body.content_en
    if (typeof body.content_es === 'string') update.content_es = body.content_es
    if (typeof body.is_published === 'boolean') update.is_published = body.is_published

    const { data, error } = await supabaseServer
      .from('guides_content')
      .update(update)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return NextResponse.json({ error: 'Guide not found' }, { status: 404 })

    return NextResponse.json({ guide: data })
  } catch (err) {
    console.error('[PATCH /api/guides/[id]]', err)
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabaseServer.from('guides_content').delete().eq('id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/guides/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 })
  }
}
