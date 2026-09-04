import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase-server'

export const GUEST_SESSION_COOKIE = 'guest_session'
const SESSION_TTL_DAYS = 30

// Opaque, DB-backed session token (guest_sessions.token + expires_at) — not
// a signed JWT. Matches the guest_sessions schema as provisioned (a
// token/expiry pair, no JWT secret column) and is simpler to revoke (just
// delete the row). Verified server-side on every protected page/route;
// proxy.ts only does a cheap cookie-presence pre-check (Edge runtime, no DB
// access there).
export async function createGuestSession(
  reservationId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000).toISOString()

  const { error } = await supabaseServer.from('guest_sessions').insert({
    reservation_id: reservationId,
    token,
    expires_at: expiresAt,
    ip_address: meta.ip ?? null,
    user_agent: meta.userAgent ?? null,
  })
  if (error) throw new Error(error.message)

  return token
}

export interface GuestReservation {
  id: string
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

// Validates a raw token against guest_sessions (existence + not expired)
// and returns the reservation it belongs to, or null.
export async function getReservationForToken(token: string | undefined | null): Promise<GuestReservation | null> {
  if (!token) return null

  const { data: session } = await supabaseServer
    .from('guest_sessions')
    .select('reservation_id, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (!session) return null
  if (new Date(session.expires_at).getTime() < Date.now()) return null

  const { data: reservation } = await supabaseServer
    .from('reservations')
    .select(
      'id, property_id, property_name, guest_name, guest_email, guest_phone, check_in, check_out, nights, num_guests, status, paid, amount_gbp, amount_eur, currency, payment_method'
    )
    .eq('id', session.reservation_id)
    .maybeSingle()

  return (reservation as GuestReservation) ?? null
}

// Reads the guest_session cookie (server components / route handlers only)
// and returns the reservation it belongs to, scoped to reservationId — a
// logged-in guest can't view a different reservation by editing the URL.
export async function requireGuestSession(reservationId: string): Promise<GuestReservation | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value
  const reservation = await getReservationForToken(token)
  if (!reservation || reservation.id !== reservationId) return null
  return reservation
}
