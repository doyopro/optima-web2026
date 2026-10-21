import { NextRequest, NextResponse } from 'next/server'
import { CHECKOUT_ENABLED } from '@/lib/features'
import { stripeServer, stripeConfigured } from '@/lib/stripe-server'
import { supabaseServer } from '@/lib/supabase-server'
import { getListingPricing, GuestyRateLimitError } from '@/lib/guesty-server'
import { getPaymentOptions } from '@/lib/booking'
import { rangeOverlapsBooking } from '@/lib/availability'

// BETA — internal testing only (test-mode Stripe, see lib/stripe-server.ts).
//
// The amount charged is NEVER taken from the client: the browser only says
// which villa, which dates and "deposit" or "full". Everything else —
// listing id, availability, minimum stay, total price, deposit amount — is
// recomputed here from Supabase + live Guesty pricing, using the same
// getPaymentOptions() rule the checkout page shows. A tampered `amountGbp`
// or `totalPrice` in the request body is simply ignored.
const BLOCKING_STATUSES = ['confirmed', 'reserved', 'closed']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

export async function POST(req: NextRequest) {
  if (!CHECKOUT_ENABLED) return new NextResponse(null, { status: 404 })

  if (!stripeConfigured || !stripeServer) {
    return bad('Stripe is not configured for this beta (missing STRIPE_TEST_SECRET_KEY).', 503)
  }

  try {
    const body = await req.json()
    const propertyId = String(body.propertyId ?? '')
    const checkIn = String(body.checkIn ?? '')
    const checkOut = String(body.checkOut ?? '')
    const paymentChoice = body.paymentChoice === 'deposit' ? 'deposit' : 'full'
    const guestName = String(body.guestName ?? '').trim().slice(0, 120)
    const guestEmail = String(body.guestEmail ?? '').trim().slice(0, 200)
    const guestPhone = String(body.guestPhone ?? '').trim().slice(0, 40)

    if (!propertyId || !DATE_RE.test(checkIn) || !DATE_RE.test(checkOut) || !guestName || !EMAIL_RE.test(guestEmail)) {
      return bad('Missing or invalid booking details')
    }
    const today = new Date().toISOString().slice(0, 10)
    if (checkIn < today || checkOut <= checkIn) {
      return bad('Invalid dates')
    }

    const { data: property } = await supabaseServer
      .from('properties')
      .select('id, guesty_listing_id, status, is_bookable')
      .eq('id', propertyId)
      .maybeSingle()

    if (!property || property.status !== 'active' || property.is_bookable === false || !property.guesty_listing_id) {
      return bad('This villa is not available for online booking', 404)
    }

    // Our own reservations mirror — catches a stay Guesty's calendar call
    // below might not reflect yet (sync lag).
    const { data: overlapping } = await supabaseServer
      .from('reservations')
      .select('check_in, check_out')
      .eq('property_id', property.id)
      .in('status', BLOCKING_STATUSES)
      .lt('check_in', checkOut)
      .gt('check_out', checkIn)
    if (rangeOverlapsBooking(checkIn, checkOut, (overlapping ?? []).map((r) => ({ checkIn: r.check_in, checkOut: r.check_out })))) {
      return bad('These dates are no longer available', 409)
    }

    const pricing = await getListingPricing(property.guesty_listing_id, checkIn, checkOut)
    if (!pricing.available) return bad('These dates are no longer available', 409)
    if (pricing.minNights > 0 && pricing.nights < pricing.minNights) {
      return bad(`Minimum stay is ${pricing.minNights} nights`, 422)
    }
    if (!(pricing.totalPrice > 0)) return bad('Could not price this stay', 422)

    const options = getPaymentOptions(checkIn, pricing.totalPrice)
    if (paymentChoice === 'deposit' && !options.depositAllowed) {
      return bad('Deposit payment is not available for this check-in date')
    }
    const amountGbp = paymentChoice === 'deposit' ? options.depositAmount : options.fullAmount

    const paymentIntent = await stripeServer.paymentIntents.create({
      amount: Math.round(amountGbp * 100), // pence
      currency: 'gbp',
      // Read back by the webhook (the only place a Guesty reservation is
      // created) — written by the server, so trustworthy at that point.
      metadata: {
        beta: 'true',
        propertyId: property.id,
        guestyListingId: property.guesty_listing_id,
        checkIn,
        checkOut,
        paymentChoice,
        guestName,
        guestEmail,
        guestPhone,
        totalPrice: String(pricing.totalPrice),
      },
      receipt_email: guestEmail,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    if (err instanceof GuestyRateLimitError) {
      return bad('Pricing is temporarily unavailable, please try again in a minute', 503)
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/checkout/create-payment-intent]', message)
    return bad('Failed to create payment intent', 500)
  }
}
