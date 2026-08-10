import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripeServer, stripeConfigured } from '@/lib/stripe-server'
import { createGuestyReservation, registerGuestyPayment } from '@/lib/guesty-server'

// BETA — internal testing only. This is the ONLY place a Guesty reservation
// is ever created from the beta checkout: server-side, only after Stripe
// has itself confirmed the charge via a verified webhook event, using the
// booking details stored on the PaymentIntent's metadata (never trusting
// anything sent directly from the client at "confirm payment" time).
//
// Every reservation created here is tagged source: 'Direct' (case-sensitive
// — see lib/guesty-server.ts) so it triggers the account's existing
// "Booking (Direct)" automation, the same one real future direct bookings
// will use.
const webhookSecret = process.env.STRIPE_TEST_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!stripeConfigured || !stripeServer || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured for this beta.' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = stripeServer.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/stripe/webhook] signature verification failed', message)
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const meta = paymentIntent.metadata

  if (meta.beta !== 'true') {
    // Not a beta-checkout PaymentIntent — ignore.
    return NextResponse.json({ received: true })
  }

  try {
    const [firstName, ...rest] = (meta.guestName || 'Guest').trim().split(' ')
    const reservation = await createGuestyReservation({
      guestyListingId: meta.guestyListingId,
      checkInDate: meta.checkIn,
      checkOutDate: meta.checkOut,
      guest: {
        firstName: firstName || 'Guest',
        lastName: rest.join(' ') || '-',
        email: meta.guestEmail,
        phone: meta.guestPhone || undefined,
      },
      source: 'Direct',
    })

    console.log(
      '[POST /api/stripe/webhook] BETA reservation created',
      reservation.id,
      reservation.confirmationCode,
    )

    try {
      // amount_received is in pence (Stripe minor units for GBP) — Guesty
      // expects major currency units.
      await registerGuestyPayment({
        reservationId: reservation.id,
        amount: paymentIntent.amount_received / 100,
        note: `Stripe PaymentIntent ${paymentIntent.id}`,
      })
      console.log('[POST /api/stripe/webhook] BETA payment registered in Guesty', reservation.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      // The reservation itself was created successfully — a failure here
      // means it exists in Guesty but is still tagged "Not paid" and the
      // paid-gated automation won't fire, which needs a human to notice
      // and register the payment manually. Logged loudly, not swallowed.
      console.error('[POST /api/stripe/webhook] GUESTY PAYMENT REGISTRATION FAILED after reservation was created', {
        reservationId: reservation.id,
        paymentIntentId: paymentIntent.id,
        error: message,
      })
    }

    return NextResponse.json({ received: true, reservationId: reservation.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // Payment already succeeded at this point — a failure here means a
    // paid beta test that didn't get a Guesty reservation, which needs a
    // human to notice and create it manually. Logged loudly, not silently
    // swallowed.
    console.error('[POST /api/stripe/webhook] GUESTY RESERVATION CREATION FAILED after successful payment', {
      paymentIntentId: paymentIntent.id,
      error: message,
      metadata: meta,
    })
    return NextResponse.json({ error: 'Reservation creation failed', details: message }, { status: 500 })
  }
}
