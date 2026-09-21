import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase-server'

export const GUEST_SESSION_COOKIE = 'guest_session'
const SESSION_TTL_DAYS = 30

// Opaque, DB-backed session token (guest_sessions.token + expires_at) — not
// a signed JWT. Verified server-side on every protected page/route;
// proxy.ts only does a cheap cookie-presence pre-check (Edge runtime, no DB
// access there).
//
// Sessions are now keyed by contact_id (2026-09 redesign: one guest = one
// contact_id, potentially many reservations) rather than a single
// reservation_id. reservation_id is kept as a nullable fallback for the
// ~23% of reservations that predate the contacts CRM sync and have no
// contact_id yet (see requireLegacyReservationSession below) — never both
// set on the same row.
async function insertGuestSession(
  fields: { contactId: string; reservationId?: never } | { reservationId: string; contactId?: never },
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000).toISOString()

  const { error } = await supabaseServer.from('guest_sessions').insert({
    contact_id: fields.contactId ?? null,
    reservation_id: fields.reservationId ?? null,
    token,
    expires_at: expiresAt,
    ip_address: meta.ip ?? null,
    user_agent: meta.userAgent ?? null,
  })
  if (error) throw new Error(error.message)

  return token
}

export function createContactSession(
  contactId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<string> {
  return insertGuestSession({ contactId }, meta)
}

// Legacy path: only used when a reservation matched via the booking-code
// fallback has no contact_id yet (the contacts-sync trigger hadn't run, or
// pre-dates it). Session isn't tied to a contact, so it can only ever
// unlock that one reservation, not a multi-booking dashboard.
export function createLegacyReservationSession(
  reservationId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<string> {
  return insertGuestSession({ reservationId }, meta)
}

export interface GuestReservation {
  id: string
  contact_id: string | null
  property_id: string | null
  property_name: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  check_in: string | null
  check_out: string | null
  nights: number | null
  num_guests: number | null
  status: string | null
  paid: boolean | null
  amount_gbp: number | null
  amount_eur: number | null
  currency: string | null
  payment_method: string | null
}

export interface GuestContact {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

const RESERVATION_COLUMNS =
  'id, contact_id, property_id, property_name, guest_name, guest_email, guest_phone, check_in, check_out, nights, num_guests, status, paid, amount_gbp, amount_eur, currency, payment_method'

// Bookings a guest should actually see. Excludes 'inquiry' (never became a
// real booking), 'canceled', 'declined', 'expired'. 'closed' is ALSO
// excluded deliberately — its real-world meaning wasn't clear from the data
// (sampled rows had future check_out dates and paid=false, which doesn't
// read as "completed stay"); confirm with the team before surfacing it.
const VISIBLE_RESERVATION_STATUSES = ['confirmed', 'reserved']

interface SessionRow {
  contact_id: string | null
  reservation_id: string | null
  expires_at: string
}

async function getValidSession(token: string | undefined | null): Promise<SessionRow | null> {
  if (!token) return null

  const { data: session } = await supabaseServer
    .from('guest_sessions')
    .select('contact_id, reservation_id, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (!session) return null
  if (new Date(session.expires_at).getTime() < Date.now()) return null

  return session as SessionRow
}

async function readSessionFromCookie(): Promise<SessionRow | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  return getValidSession(token)
}

// Verifies the cookie session belongs to `contactId`, and returns that
// contact's basic identity. A logged-in guest can't view a different
// contact's dashboard by editing the URL.
export async function requireGuestContact(contactId: string): Promise<GuestContact | null> {
  const session = await readSessionFromCookie()
  if (!session || session.contact_id !== contactId) return null

  const { data } = await supabaseServer
    .from('contacts')
    .select('id, first_name, last_name, email')
    .eq('id', contactId)
    .maybeSingle()

  return (data as GuestContact) ?? null
}

// All of a contact's real (VISIBLE_RESERVATION_STATUSES) bookings, most
// recent check-in first — callers split into upcoming/past by comparing
// check_in/check_out against today.
export async function getReservationsForContact(contactId: string): Promise<GuestReservation[]> {
  const { data } = await supabaseServer
    .from('reservations')
    .select(RESERVATION_COLUMNS)
    .eq('contact_id', contactId)
    .in('status', VISIBLE_RESERVATION_STATUSES)
    .order('check_in', { ascending: false })

  return (data as GuestReservation[]) ?? []
}

// A single reservation, scoped to the logged-in contact — verifies both
// that the session belongs to `contactId` AND that the reservation itself
// actually belongs to that contact (defence in depth: even if those two
// checks were ever inconsistent, a guest still can't see another contact's
// reservation by guessing a reservation id in the URL).
export async function requireGuestReservation(
  contactId: string,
  reservationId: string,
): Promise<GuestReservation | null> {
  const contact = await requireGuestContact(contactId)
  if (!contact) return null

  const { data } = await supabaseServer
    .from('reservations')
    .select(RESERVATION_COLUMNS)
    .eq('id', reservationId)
    .eq('contact_id', contactId)
    .maybeSingle()

  return (data as GuestReservation) ?? null
}

// Legacy path for a reservation with no contact_id (see
// createLegacyReservationSession) — the session can only unlock that exact
// reservation, there's no dashboard/list for it.
export async function requireLegacyReservationSession(
  reservationId: string,
): Promise<GuestReservation | null> {
  const session = await readSessionFromCookie()
  if (!session || session.contact_id || session.reservation_id !== reservationId) return null

  const { data } = await supabaseServer
    .from('reservations')
    .select(RESERVATION_COLUMNS)
    .eq('id', reservationId)
    .maybeSingle()

  return (data as GuestReservation) ?? null
}

// Used by /api/my-booking/[id]/form: true if the current session grants
// access to this reservation, whether via a contact session (reservation
// belongs to that contact) or a legacy reservation-only session.
export async function guestSessionCanAccessReservation(reservationId: string): Promise<boolean> {
  const session = await readSessionFromCookie()
  if (!session) return false

  if (session.reservation_id === reservationId && !session.contact_id) return true

  if (session.contact_id) {
    const { data } = await supabaseServer
      .from('reservations')
      .select('id')
      .eq('id', reservationId)
      .eq('contact_id', session.contact_id)
      .maybeSingle()
    return Boolean(data)
  }

  return false
}
