import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripeServer, stripeConfigured, stripeWebhookSecret } from '@/lib/stripe-server'
import { createGuestyReservation, registerGuestyPayment, confirmGuestyReservation } from '@/lib/guesty-server'
import { supabaseServer } from '@/lib/supabase-server'

// Audit trail + "needs a human" flag, read by the dashboard (checkout_events).
// Never allowed to break the webhook: a logging failure is only console-logged.
async function logCheckoutEvent(
  event: Stripe.Event,
  paymentIntentId: string,
  outcome: string,
  detail: Record<string, unknown>,
  needsAttention: boolean,
) {
  try {
    const { error } = await supabaseServer.from('checkout_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payment_intent_id: paymentIntentId,
      outcome,
      detail,
      needs_attention: needsAttention,
    })
    if (error) console.error('[stripe webhook] checkout_events insert failed', error.message)
  } catch (e) {
    console.error('[stripe webhook] checkout_events insert threw', e instanceof Error ? e.message : e)
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Guest portal balance payments (app/api/guest/pay-balance) — an EXISTING
// reservation's outstanding balance being paid down, not a new booking.
// Deliberately NOT handled here (2026-09 correction): an existing n8n
// workflow ("Stripe -> Google Sheets (Payments)") already listens to every
// Stripe charge in real time and inserts it into `payments` itself,
// matching against reservations.channel_booking_id. That process dedupes
// by its own `reference` field, not by Stripe's payment_intent id — so this
// webhook must NOT also insert a row for these, or the same real charge
// ends up duplicated in `payments`. This event type is intentionally
// ignored here; the guest-portal balance math (lib/guest-payments.ts)
// reads whatever row n8n puts there, same as it reads every other payment.

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
const webhookSecret = stripeWebhookSecret

export async function POST(req: NextRequest) {
  if (!stripeConfigured || !stripeServer || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 503 })
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

  if (meta.kind === 'guest_balance_payment') {
    // See the comment above imports: n8n's own Stripe webhook records this
    // charge into `payments`, not this route.
    return NextResponse.json({ received: true })
  }

  if (meta.checkout !== 'web' && meta.beta !== 'true') {
    // Not a website-checkout PaymentIntent — ignore.
    return NextResponse.json({ received: true })
  }

  try {
    // Idempotency: Stripe re-delivers events (and retries on our 5xx). The
    // event payload's metadata is a snapshot, so re-read the live
    // PaymentIntent — if a previous delivery already created the Guesty
    // reservation it left its id in metadata, and we must not book twice.
    const live = await stripeServer.paymentIntents.retrieve(paymentIntent.id)
    if (live.metadata?.guesty_reservation_id || live.metadata?.auto_refunded === 'true') {
      return NextResponse.json({ received: true, duplicate: true })
    }

    const [firstName, ...rest] = (meta.guestName || 'Guest').trim().split(' ')
    const reservationInput = {
      guestyListingId: meta.guestyListingId,
      checkInDate: meta.checkIn,
      checkOutDate: meta.checkOut,
      guest: {
        firstName: firstName || 'Guest',
        lastName: rest.join(' ') || '-',
        email: meta.guestEmail,
        phone: meta.guestPhone || undefined,
      },
      source: 'Direct' as const,
    }

    // The guest has already paid. If Guesty cannot create the reservation
    // (dates taken in the meantime, API down) we try once more, and if it
    // still fails we REFUND automatically instead of keeping money for a
    // booking that does not exist. Marked so a later Stripe retry of this
    // same event can never book it for free.
    let reservation: Awaited<ReturnType<typeof createGuestyReservation>>
    try {
      try {
        reservation = await createGuestyReservation(reservationInput)
      } catch {
        await wait(2000)
        reservation = await createGuestyReservation(reservationInput)
      }
    } catch (createErr) {
      const reason = createErr instanceof Error ? createErr.message : 'Unknown error'
      console.error('[POST /api/stripe/webhook] GUESTY RESERVATION CREATION FAILED — refunding', {
        paymentIntentId: paymentIntent.id,
        error: reason,
        metadata: meta,
      })
      try {
        await stripeServer.refunds.create({
          payment_intent: paymentIntent.id,
          reason: 'requested_by_customer',
          metadata: { auto_refund: 'guesty_reservation_failed' },
        })
        try {
          // Marks the payment so a later redelivery of this event can't book it for free.
          await stripeServer.paymentIntents.update(paymentIntent.id, {
            metadata: { auto_refunded: 'true' },
          })
        } catch (markErr) {
          console.error('[stripe webhook] could not mark PaymentIntent as refunded', markErr instanceof Error ? markErr.message : markErr)
        }
        await logCheckoutEvent(event, paymentIntent.id, 'reservation_failed_refunded', { reason, booking: meta }, true)
        return NextResponse.json({ received: true, refunded: true })
      } catch (refundErr) {
        const refundReason = refundErr instanceof Error ? refundErr.message : 'Unknown error'
        console.error('[POST /api/stripe/webhook] AUTO-REFUND FAILED — MANUAL ACTION NEEDED', {
          paymentIntentId: paymentIntent.id,
          error: refundReason,
        })
        await logCheckoutEvent(
          event,
          paymentIntent.id,
          'reservation_failed_refund_failed',
          { reason, refundReason, booking: meta },
          true,
        )
        // Let Stripe retry the delivery; the refund is attempted again.
        return NextResponse.json({ error: 'Reservation failed and refund failed', details: refundReason }, { status: 500 })
      }
    }

    await stripeServer.paymentIntents.update(paymentIntent.id, {
      metadata: { guesty_reservation_id: reservation.id },
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

      // Paid → confirm, so Guesty's "Booking (Direct)" messages fire. A failure
      // here is flagged for a human (the booking and payment themselves are fine).
      let confirmed = false
      let confirmError: string | undefined
      try {
        await confirmGuestyReservation(reservation.id)
        confirmed = true
      } catch (confirmErr) {
        confirmError = confirmErr instanceof Error ? confirmErr.message : String(confirmErr)
        console.error('[POST /api/stripe/webhook] GUESTY CONFIRMATION FAILED', reservation.id, confirmError)
      }

      await logCheckoutEvent(event, paymentIntent.id, confirmed ? 'reservation_created' : 'reservation_created_not_confirmed', {
        reservationId: reservation.id,
        confirmationCode: reservation.confirmationCode,
        paymentChoice: meta.paymentChoice,
        amount: paymentIntent.amount_received / 100,
        confirmed,
        ...(confirmError ? { confirmError } : {}),
      }, !confirmed)
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
      await logCheckoutEvent(event, paymentIntent.id, 'payment_registration_failed', {
        reservationId: reservation.id,
        confirmationCode: reservation.confirmationCode,
        error: message,
      }, true)
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
