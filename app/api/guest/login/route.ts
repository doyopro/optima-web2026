import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createContactSession, createLegacyReservationSession, GUEST_SESSION_COOKIE } from '@/lib/guest-auth'

function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(GUEST_SESSION_COOKIE, token, {
    path: '/',
    maxAge: 30 * 86_400,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

// Primary path: email + last name. Looks up the contact directly, so one
// login covers every reservation linked to that contact_id (2026-09
// redesign — see lib/guest-auth.ts), not just one specific booking.
async function loginWithEmail(req: NextRequest, email: string, lastName: string): Promise<NextResponse> {
  const { data: contact, error } = await supabaseServer
    .from('contacts')
    .select('id, last_name')
    .ilike('email', email)
    .maybeSingle()

  if (error) throw new Error(error.message)

  const nameMatches = contact?.last_name
    ? contact.last_name.toLowerCase().includes(lastName.toLowerCase())
    : false

  if (!contact || !nameMatches) {
    return NextResponse.json({ error: 'No booking found matching those details' }, { status: 401 })
  }

  const token = await createContactSession(contact.id, {
    ip: req.headers.get('x-forwarded-for'),
    userAgent: req.headers.get('user-agent'),
  })

  const res = NextResponse.json({ success: true, contactId: contact.id })
  setSessionCookie(res, token)
  return res
}

// Fallback path: booking code + last name — for a guest who doesn't want to
// give an email, or who lands here from a link tied to one specific
// reservation. Kept exactly as it worked before this redesign; the only
// change is that it now also tries to attach the resulting session to that
// reservation's contact_id, so the guest still gets the unified dashboard
// when possible. About 23% of reservations predate the contacts sync and
// have no contact_id yet — those fall back to a legacy, reservation-only
// session (see createLegacyReservationSession).
async function loginWithBookingCode(req: NextRequest, bookingCode: string, lastName: string): Promise<NextResponse> {
  const { data: reservation, error } = await supabaseServer
    .from('reservations')
    .select('id, guest_name, contact_id')
    .ilike('channel_booking_id', bookingCode)
    .maybeSingle()

  if (error) throw new Error(error.message)

  const nameMatches = reservation?.guest_name
    ? reservation.guest_name.toLowerCase().includes(lastName.toLowerCase())
    : false

  if (!reservation || !nameMatches) {
    return NextResponse.json({ error: 'No booking found matching those details' }, { status: 401 })
  }

  const meta = { ip: req.headers.get('x-forwarded-for'), userAgent: req.headers.get('user-agent') }

  if (reservation.contact_id) {
    const token = await createContactSession(reservation.contact_id, meta)
    const res = NextResponse.json({ success: true, contactId: reservation.contact_id })
    setSessionCookie(res, token)
    return res
  }

  const token = await createLegacyReservationSession(reservation.id, meta)
  const res = NextResponse.json({ success: true, reservationId: reservation.id, legacy: true })
  setSessionCookie(res, token)
  return res
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body.email ?? '').trim()
    const bookingCode = String(body.bookingCode ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()

    if (!lastName || (!email && !bookingCode)) {
      return NextResponse.json(
        { error: 'Last name and either an email or a booking code are required' },
        { status: 400 },
      )
    }

    // Deliberately generic error messages throughout — don't reveal which
    // specific field was the mismatch.
    if (email) {
      return await loginWithEmail(req, email, lastName)
    }
    return await loginWithBookingCode(req, bookingCode, lastName)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
