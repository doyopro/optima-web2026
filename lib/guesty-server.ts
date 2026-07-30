// Server-only. Reads GUESTY_CLIENT_ID / GUESTY_CLIENT_SECRET — never import
// this file from a 'use client' component, only from route handlers.

const GUESTY_API_BASE = 'https://open-api.guesty.com/v1'

interface CachedToken {
  token: string
  expiresAt: number
}

// Module-level cache: survives across requests within the same server
// instance/lambda, so we don't re-authenticate with Guesty on every call.
let cachedToken: CachedToken | null = null

async function getGuestyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

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

  if (!res.ok) {
    throw new Error(`Guesty OAuth token request failed: ${res.status}`)
  }

  const data = await res.json()
  const token = data.access_token as string
  if (!token) {
    throw new Error('Guesty OAuth response had no access_token')
  }

  // Guesty client_credentials tokens last ~24h; cache for 50 min to stay
  // well within that while still refreshing periodically.
  cachedToken = { token, expiresAt: Date.now() + 50 * 60 * 1000 }
  return token
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
  // Guesty's docs show a single day-object schema for this endpoint but
  // it returns one entry per date in the range — defensively handle a
  // bare array, or a { data / days / result: [...] } wrapper, since the
  // exact envelope isn't 100% confirmed without a live test call.
  const days: CalendarDay[] = Array.isArray(raw)
    ? raw
    : (raw.data ?? raw.days ?? raw.result ?? [])

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
}

export interface GuestyReservation {
  id: string
  confirmationCode: string
  status: string
}

/**
 * Creates a real reservation in Guesty (POST /v1/reservations).
 *
 * ⚠️ NOT WIRED UP ANYWHERE YET. This function exists and is ready to use,
 * but nothing in the current checkout flow calls it — there's no real
 * payment happening yet (see app/villas/[id]/checkout/page.tsx's payment
 * step, which is a disabled placeholder).
 *
 * Once Stripe is connected: call this function from the Stripe webhook
 * handler (e.g. app/api/stripe/webhook/route.ts, on a successful
 * `payment_intent.succeeded` / `checkout.session.completed` event) —
 * NOT from the client, and NOT before payment has actually been
 * confirmed by Stripe. That webhook handler doesn't exist yet; this is
 * the function it should call once it does.
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
    }),
  })

  if (!res.ok) {
    throw new Error(`Guesty reservation creation failed: ${res.status}`)
  }

  const data = await res.json()
  return {
    id: data._id as string,
    confirmationCode: data.confirmationCode as string,
    status: data.status as string,
  }
}
