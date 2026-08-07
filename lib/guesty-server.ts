// Server-only. Reads GUESTY_CLIENT_ID / GUESTY_CLIENT_SECRET — never import
// this file from a 'use client' component, only from route handlers.

import { supabaseServer } from './supabase-server'

const GUESTY_API_BASE = 'https://open-api.guesty.com/v1'

// Thrown when Guesty itself rate-limits the OAuth token request (429), so
// callers can distinguish "Guesty is throttling us" from other failures and
// fall back gracefully (e.g. the external Guesty booking link).
export class GuestyRateLimitError extends Error {
  constructor() {
    super('Guesty OAuth token request was rate limited (429)')
    this.name = 'GuestyRateLimitError'
  }
}

// Guesty's OAuth token actually lasts 24h (confirmed live: the token
// response's own expires_in is 86400 seconds) — this was previously
// hardcoded to a wrong ~1h assumption, which refreshed the token roughly
// 24x more often than necessary. That's very likely what was tripping
// Guesty's own OAuth rate limit and causing intermittent pricing lookup
// failures on genuinely available dates: every request that landed on an
// (incorrectly) "expired" cached token triggered a fresh OAuth call, and a
// burst of those (e.g. several villa pages/checkouts loading pricing
// around the same time) could exceed Guesty's issuance rate limit even
// though the previously-issued token was still perfectly valid. Used only
// as a fallback if Guesty's response is ever missing expires_in.
const FALLBACK_TOKEN_TTL_MS = 55 * 60 * 1000
const REFRESH_MARGIN_MS = 5 * 60 * 1000

interface StoredToken {
  access_token: string
  expires_at: string
}

async function getStoredToken(): Promise<StoredToken | null> {
  const { data, error } = await supabaseServer
    .from('guesty_oauth_token')
    .select('access_token, expires_at')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.error('[guesty-server] failed to read cached token', error.message)
    return null
  }
  return data
}

async function storeToken(token: string, expiresAt: number): Promise<void> {
  const { error } = await supabaseServer.from('guesty_oauth_token').upsert({
    id: 1,
    access_token: token,
    fetched_at: new Date().toISOString(),
    expires_at: new Date(expiresAt).toISOString(),
  })

  if (error) {
    // Non-fatal: we still have a valid token in hand for this request, we
    // just won't have persisted it for the next invocation to reuse.
    console.error('[guesty-server] failed to persist token', error.message)
  }
}

async function fetchNewGuestyToken(): Promise<string> {
  // Guesty's OAuth2 token endpoint requires application/x-www-form-urlencoded,
  // not JSON — a JSON body here returns 400.
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'open-api',
    client_id: process.env.GUESTY_CLIENT_ID ?? '',
    client_secret: process.env.GUESTY_CLIENT_SECRET ?? '',
  })

  const res = await fetch('https://open-api.guesty.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  })

  if (res.status === 429) {
    throw new GuestyRateLimitError()
  }

  if (!res.ok) {
    throw new Error(`Guesty OAuth token request failed: ${res.status}`)
  }

  const data = await res.json()
  const token = data.access_token as string
  if (!token) {
    throw new Error('Guesty OAuth response had no access_token')
  }

  const expiresInMs = typeof data.expires_in === 'number' ? data.expires_in * 1000 : FALLBACK_TOKEN_TTL_MS
  const expiresAt = Date.now() + expiresInMs
  await storeToken(token, expiresAt)
  return token
}

async function getGuestyToken(): Promise<string> {
  const stored = await getStoredToken()
  if (stored && Date.now() < new Date(stored.expires_at).getTime() - REFRESH_MARGIN_MS) {
    return stored.access_token
  }

  return fetchNewGuestyToken()
}

async function guestyFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getGuestyToken()
  return fetch(`${GUESTY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}

export interface CalendarDay {
  date: string
  price: number
  currency: string
  status: string
  minNights: number
}

export interface PricingResult {
  available: boolean
  currency: string
  nights: number
  totalPrice: number
  nightlyAverage: number
  minNights: number
  days: CalendarDay[]
}

/**
 * Real per-night pricing + availability for a Guesty listing over a date
 * range, via GET /availability-pricing/api/calendar/listings/{id}.
 * checkOutDate itself is not a booked night (standard hotel-nights
 * convention) — only [checkInDate, checkOutDate) nights are summed.
 */
export async function getListingPricing(
  guestyListingId: string,
  checkInDate: string,
  checkOutDate: string,
): Promise<PricingResult> {
  const res = await guestyFetch(
    `/availability-pricing/api/calendar/listings/${guestyListingId}?startDate=${checkInDate}&endDate=${checkOutDate}`,
  )

  if (!res.ok) {
    throw new Error(`Guesty pricing lookup failed: ${res.status}`)
  }

  const raw = await res.json()
  // Confirmed real shape via a live call: { status, message, data: { days: [...] } }.
  const days: CalendarDay[] = raw.data?.days ?? []

  // checkOutDate is the departure day, not a booked night — exclude it.
  const nights = days.filter((d) => d.date < checkOutDate)

  const available = nights.length > 0 && nights.every((d) => d.status === 'available')
  const totalPrice = nights.reduce((sum, d) => sum + (d.price ?? 0), 0)
  const minNights = nights.reduce((max, d) => Math.max(max, d.minNights ?? 0), 0)

  return {
    available,
    currency: nights[0]?.currency ?? 'GBP',
    nights: nights.length,
    totalPrice,
    nightlyAverage: nights.length > 0 ? totalPrice / nights.length : 0,
    minNights,
    days: nights,
  }
}

export interface GuestyGuestInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

/**
 * Creates (or, per Guesty's own dedup-by-email behavior, reconciles with an
 * existing) guest record. Needed as a prerequisite for createReservation's
 * guestId field.
 *
 * NOT currently called from anywhere in the app — see createReservation.
 */
export async function createGuestyGuest(guest: GuestyGuestInput): Promise<string> {
  const res = await guestyFetch('/guests-crud', {
    method: 'POST',
    body: JSON.stringify(guest),
  })

  if (!res.ok) {
    throw new Error(`Guesty guest creation failed: ${res.status}`)
  }

  const data = await res.json()
  const guestId = data._id as string
  if (!guestId) {
    throw new Error('Guesty guest creation response had no _id')
  }
  return guestId
}

export interface CreateReservationInput {
  guestyListingId: string
  checkInDate: string
  checkOutDate: string
  guest: GuestyGuestInput
  // Guesty's reservation source is case-sensitive and drives which
  // automations fire (confirmed: "Direct" is an existing source in this
  // account, wired to the "Booking (Direct)" automation — 11 messages).
  // Typing it any other way (e.g. "direct") creates a distinct, unrelated
  // source in Guesty and would silently skip that automation.
  source: string
}

export interface GuestyReservation {
  id: string
  confirmationCode: string
  status: string
}

/**
 * Creates a real reservation in Guesty (POST /v1/reservations).
 *
 * Called from app/api/stripe/webhook/route.ts on a confirmed
 * `payment_intent.succeeded` event only — never from the client, and never
 * before Stripe has actually confirmed payment.
 *
 * Root cause of a real failed beta test (confirmed live): this legacy
 * `/v1/reservations` endpoint enforces the listing's minNights/maxNights
 * itself and rejects a too-short stay with 422 "minNights or maxNights
 * terms not applicable" — a real 6-night test against a 7-night-minimum
 * listing correctly failed. (Note: `ignoreTerms`/`ignoreCalendar`/
 * `ignoreBlocks` are NOT valid fields on this legacy endpoint — that's
 * documented for the newer v1/reservations-v3 endpoint instead; sending
 * them here causes its own 400 "should not exist" error, confirmed live.)
 * The actual fix is validating stay length client-side before payment —
 * see app/villas/[id]/checkout/page.tsx's stayTooShort check, which now
 * blocks payment entirely for a stay shorter than the listing's minimum.
 */
export async function createGuestyReservation(
  input: CreateReservationInput,
): Promise<GuestyReservation> {
  const guestId = await createGuestyGuest(input.guest)

  const res = await guestyFetch('/reservations', {
    method: 'POST',
    body: JSON.stringify({
      listingId: input.guestyListingId,
      checkInDateLocalized: input.checkInDate,
      checkOutDateLocalized: input.checkOutDate,
      status: 'reserved',
      guestId,
      source: input.source,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Guesty reservation creation failed: ${res.status} — ${body}`)
  }

  const data = await res.json()
  return {
    id: data._id as string,
    confirmationCode: data.confirmationCode as string,
    status: data.status as string,
  }
}
