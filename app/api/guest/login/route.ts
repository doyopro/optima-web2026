import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createContactSession, createLegacyReservationSession, GUEST_SESSION_COOKIE } from '@/lib/guest-auth'


// ilike treats % and _ as wildcards. Without escaping, an "email" such as
// "a%@gmail.com" would match many contacts, and a pattern narrow enough to
// match exactly one would log the caller in without knowing the address.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`)
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// The typed last name must be the whole stored last name or one whole word of
// the stored name (so "De la Cruz" and "Cruz" both work). A bare substring such
// as one letter must not match.
function lastNameMatches(stored: string | null | undefined, typed: string): boolean {
  if (!stored) return false
  const input = normalizeName(typed)
  if (input.length < 2) return false
  const full = normalizeName(stored)
  if (full === input) return true
  const words = full.split(/[\s-]+/).filter(Boolean)
  if (words.includes(input)) return true
  return full.endsWith(` ${input}`)
}

// Best-effort brute-force brake. Serverless instances do not share memory, so
// this only slows down a single instance; it is not a substitute for a shared
// rate limiter.
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60_000

function tooManyAttempts(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_ATTEMPTS
}

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
  const { data: contacts, error } = await supabaseServer
    .from('contacts')
    .select('id, last_name')
    .ilike('email', escapeLike(email.toLowerCase()))
    .limit(10)

  if (error) throw new Error(error.message)

  const contact = (contacts ?? []).find((c) => lastNameMatches(c.last_name, lastName))

  if (!contact) {
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
  const { data: reservations, error } = await supabaseServer
    .from('reservations')
    .select('id, guest_name, contact_id')
    .ilike('channel_booking_id', escapeLike(bookingCode))
    .limit(5)

  if (error) throw new Error(error.message)

  const reservation = (reservations ?? []).find((r) => lastNameMatches(r.guest_name, lastName))

  if (!reservation) {
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
    const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
    if (tooManyAttempts(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

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
    // Never echo database/internal error text back to an unauthenticated caller.
    console.error('[POST /api/guest/login]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
