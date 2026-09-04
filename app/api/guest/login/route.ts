import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createGuestSession, GUEST_SESSION_COOKIE } from '@/lib/guest-auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const bookingCode = String(body.bookingCode ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()

    if (!bookingCode || !lastName) {
      return NextResponse.json({ error: 'Booking code and last name are required' }, { status: 400 })
    }

    // Exact match on the booking code (case-insensitive — channel booking
    // codes aren't case-sensitive in practice), then confirm the guest's
    // last name appears in guest_name (also case-insensitive) rather than
    // requiring an exact full-name match, since guest_name is a free-text
    // "First Last" field from the booking channel.
    const { data: reservation, error } = await supabaseServer
      .from('reservations')
      .select('id, guest_name')
      .ilike('channel_booking_id', bookingCode)
      .maybeSingle()

    if (error) throw new Error(error.message)

    const nameMatches = reservation?.guest_name
      ? reservation.guest_name.toLowerCase().includes(lastName.toLowerCase())
      : false

    if (!reservation || !nameMatches) {
      // Deliberately generic — don't reveal whether the code or the name
      // was the mismatch.
      return NextResponse.json({ error: 'No booking found matching those details' }, { status: 401 })
    }

    const token = await createGuestSession(reservation.id, {
      ip: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
    })

    const res = NextResponse.json({ success: true, reservationId: reservation.id })
    res.cookies.set(GUEST_SESSION_COOKIE, token, {
      path: '/',
      maxAge: 30 * 86_400,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
