import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Admin list for the /web/properties dashboard tab — id/name/flags only,
// not the full public villa payload /api/villas returns.
export async function GET() {
  const { data, error } = await supabaseServer
    .from('properties')
    .select('id, name, status, is_featured, is_bookable, is_tina_partner, guesty_synced_at')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ properties: data ?? [] })
}
