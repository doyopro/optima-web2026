import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireGuestSession } from '@/lib/guest-auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reservation = await requireGuestSession(id)
  if (!reservation) return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('guest_form_data')
    .select('guest_number, full_name, age, nationality, passport_number, email, phone')
    .eq('reservation_id', id)
    .order('guest_number', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reservation = await requireGuestSession(id)
  if (!reservation) return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })

  try {
    const body = await req.json()
    const guestNumber = Number(body.guest_number)
    if (!guestNumber || guestNumber < 1 || guestNumber > 10) {
      return NextResponse.json({ error: 'Invalid guest_number' }, { status: 400 })
    }

    const fullName = guestNumber === 1 ? reservation.guest_name ?? null : body.full_name || null

    // Compare against the reservation's contact info in normalized form —
    // raw strict equality misses "duplicates" that only differ by case,
    // surrounding whitespace, or phone punctuation/spacing — so those were
    // slipping through and getting stored again instead of deduped.
    const normalizeEmail = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : '')
    // Strip everything but digits (including a leading "+") so
    // "+353 89 603 8307" and "353896038307" compare as the same number.
    const normalizePhone = (v: unknown) => (typeof v === 'string' ? v.replace(/\D/g, '') : '')

    const rawEmail = typeof body.email === 'string' ? body.email.trim() : ''
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : ''

    const email = rawEmail && normalizeEmail(rawEmail) !== normalizeEmail(reservation.guest_email) ? rawEmail : null
    const phone = rawPhone && normalizePhone(rawPhone) !== normalizePhone(reservation.guest_phone) ? rawPhone : null

    const { data, error } = await supabaseServer
      .from('guest_form_data')
      .upsert(
        {
          reservation_id: id,
          guest_number: guestNumber,
          full_name: fullName,
          age: body.age ? Number(body.age) : null,
          nationality: body.nationality ?? null,
          passport_number: body.passport_number ?? null,
          email,
          phone,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'reservation_id,guest_number' }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, entry: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
