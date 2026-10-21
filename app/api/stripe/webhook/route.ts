import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripeServer, stripeConfigured, stripeWebhookSecret } from '@/lib/stripe-server'
import { recordCheckoutEvent, sendCheckoutAlert } from '@/lib/checkout-alerts'
import { createGuestyReservation, registerGuestyPayment, findActiveGuestyReservation } from '@/lib/guesty-server'

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

// Events to register on the Stripe endpoint (test AND live):
//   payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
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

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    if (pi.metadata.beta !== 'true') return NextResponse.json({ received: true })
    const err = pi.last_payment_error
    await recordCheckoutEvent({
      stripeEventId: event.id,
      type: event.type,
      paymentIntentId: pi.id,
      outcome: 'payment_failed',
      detail: {
        code: err?.code ?? null,
        decline_code: err?.decline_code ?? null,
        message: err?.message ?? null,
        amount_gbp: pi.amount / 100,
        villa: pi.metadata.propertyId,
        check_in: pi.metadata.checkIn,
        check_out: pi.metadata.checkOut,
      },
    })
    return NextResponse.json({ received: true })
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
    const pi = piId ? await stripeServer.paymentIntents.retrieve(piId) : null
    if (!pi || pi.metadata.beta !== 'true') return NextResponse.json({ received: true })
    // Our own automatic refund (Guesty failed) is already alerted below; any
    // OTHER refund (dashboard, dispute handling) leaves a Guesty reservation
    // that nobody cancelled — a human must look.
    const auto = pi.metadata.checkout_auto_refund === '1'
    const result = await recordCheckoutEvent({
      stripeEventId: event.id,
      type: event.type,
      paymentIntentId: pi.id,
      outcome: auto ? 'refunded_automatically' : 'refunded_manually',
      needsAttention: !auto,
      detail: {
        amount_refunded_gbp: charge.amount_refunded / 100,
        guesty_reservation_id: pi.metadata.guesty_reservation_id ?? null,
        guest_email: pi.metadata.guestEmail,
      },
    })
    if (!auto && result === 'recorded') {
      await sendCheckoutAlert(
        'Optima: a booking payment was refunded — check the Guesty reservation',
        `PaymentIntent ${pi.id} was refunded (£${charge.amount_refunded / 100}).\nGuesty reservation: ${pi.metadata.guesty_reservation_id ?? 'none'}\nGuest: ${pi.metadata.guestName} <${pi.metadata.guestEmail}>\nDates: ${pi.metadata.checkIn} to ${pi.metadata.checkOut}\nThe reservation is NOT cancelled automatically — cancel it in Guesty if needed.`,
      )
    }
    return NextResponse.json({ received: true })
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

  if (meta.beta !== 'true') {
    // Not a checkout PaymentIntent — ignore.
    return NextResponse.json({ received: true })
  }

  // Idempotency: Stripe re-delivers events (and retries on our 5xx). The
  // event payload's metadata is a snapshot, so re-read the live
  // PaymentIntent — if a previous delivery already created the Guesty
  // reservation (or already refunded this payment) we must not act twice.
  const live = await stripeServer.paymentIntents.retrieve(paymentIntent.id)
  if (live.metadata?.guesty_reservation_id || live.metadata?.checkout_auto_refund === '1') {
    return NextResponse.json({ received: true, duplicate: true })
  }

  const [firstName, ...rest] = (meta.guestName || 'Guest').trim().split(' ')
  const createInput = {
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
  }

  // One quick retry for a transient Guesty error before giving up.
  let reservation: Awaited<ReturnType<typeof createGuestyReservation>> | null = null
  let guestyError = ''
  for (let attempt = 1; attempt <= 2 && !reservation; attempt++) {
    try {
      reservation = await createGuestyReservation(createInput)
    } catch (err) {
      guestyError = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[POST /api/stripe/webhook] Guesty reservation attempt ${attempt} failed`, guestyError)
      if (attempt === 1) await new Promise((r) => setTimeout(r, 1500))
    }
  }

  if (!reservation) {
    // Before refunding, make sure this is a REAL failure and not a race with
    // another delivery/endpoint of the same event that already booked it
    // (seen in testing: a second handler got "dates not available" precisely
    // because the first had just created the reservation, and refunded a
    // paid, booked guest). Give a concurrent handler a moment to finish, then
    // check the PaymentIntent marker and Guesty itself.
    await new Promise((r) => setTimeout(r, 3000))
    const recheck = await stripeServer.paymentIntents.retrieve(paymentIntent.id)
    if (recheck.metadata?.guesty_reservation_id) {
      return NextResponse.json({ received: true, duplicate: true })
    }
    let existing: Awaited<ReturnType<typeof findActiveGuestyReservation>> = null
    try {
      existing = await findActiveGuestyReservation(meta.guestyListingId, meta.guestEmail, meta.checkIn)
    } catch (lookupErr) {
      console.error('[POST /api/stripe/webhook] Guesty lookup before refund failed', lookupErr)
    }
    if (existing) {
      await stripeServer.paymentIntents.update(paymentIntent.id, { metadata: { guesty_reservation_id: existing.id } })
      await recordCheckoutEvent({
        stripeEventId: event.id,
        type: event.type,
        paymentIntentId: paymentIntent.id,
        outcome: 'reservation_already_existed',
        needsAttention: true,
        detail: { guesty_reservation_id: existing.id, confirmation_code: existing.confirmationCode, note: 'another delivery booked it; NOT refunded — verify the payment is registered in Guesty' },
      })
      await sendCheckoutAlert(
        'Optima: duplicate booking attempt skipped — verify payment in Guesty',
        `PaymentIntent ${paymentIntent.id} already has Guesty reservation ${existing.confirmationCode}. No refund was issued. Check that the £${paymentIntent.amount_received / 100} payment is registered on it.`,
      )
      return NextResponse.json({ received: true, duplicate: true })
    }

    // Stripe charged the guest but Guesty refused the booking. Never leave
    // the guest charged for nothing: refund automatically, record it, alert.
    // The marker is written BEFORE the refund so the charge.refunded event
    // that follows is recognised as ours.
    try {
      await stripeServer.paymentIntents.update(paymentIntent.id, { metadata: { checkout_auto_refund: '1' } })
      await stripeServer.refunds.create({ payment_intent: paymentIntent.id, metadata: { reason: 'guesty_reservation_failed' } })
    } catch (refundErr) {
      const refundMessage = refundErr instanceof Error ? refundErr.message : 'Unknown error'
      await recordCheckoutEvent({
        stripeEventId: `${event.id}:refund_failed`,
        type: event.type,
        paymentIntentId: paymentIntent.id,
        outcome: 'guesty_failed_REFUND_FAILED',
        needsAttention: true,
        detail: { guesty_error: guestyError, refund_error: refundMessage, guest_email: meta.guestEmail },
      })
      await sendCheckoutAlert(
        'URGENT Optima: guest charged, Guesty booking failed AND refund failed',
        `PaymentIntent ${paymentIntent.id} (£${paymentIntent.amount / 100}) was charged but the Guesty reservation failed (${guestyError}) and the automatic refund also failed (${refundMessage}).\nGuest: ${meta.guestName} <${meta.guestEmail}> ${meta.guestPhone}\nDates: ${meta.checkIn} to ${meta.checkOut}\nRefund or book manually NOW.`,
      )
      // 500 so Stripe retries the event.
      return NextResponse.json({ error: 'Guesty failed and refund failed' }, { status: 500 })
    }
    await recordCheckoutEvent({
      stripeEventId: event.id,
      type: event.type,
      paymentIntentId: paymentIntent.id,
      outcome: 'guesty_failed_refunded',
      needsAttention: true,
      detail: { guesty_error: guestyError, amount_gbp: paymentIntent.amount / 100, guest_email: meta.guestEmail, villa: meta.propertyId, check_in: meta.checkIn, check_out: meta.checkOut },
    })
    await sendCheckoutAlert(
      'Optima: online booking failed in Guesty — guest was refunded automatically',
      `The guest was charged £${paymentIntent.amount / 100} but Guesty rejected the reservation (${guestyError}). The payment was REFUNDED automatically.\nGuest: ${meta.guestName} <${meta.guestEmail}> ${meta.guestPhone}\nVilla: ${meta.propertyId}\nDates: ${meta.checkIn} to ${meta.checkOut}\nPaymentIntent: ${paymentIntent.id}\nYou may want to contact the guest.`,
    )
    return NextResponse.json({ received: true, refunded: true })
  }

  await stripeServer.paymentIntents.update(paymentIntent.id, {
    metadata: { guesty_reservation_id: reservation.id },
  })

  let paymentRegistered = true
  try {
    // amount_received is in pence — Guesty expects major currency units.
    await registerGuestyPayment({
      reservationId: reservation.id,
      amount: paymentIntent.amount_received / 100,
      note: `Stripe PaymentIntent ${paymentIntent.id}`,
    })
  } catch (err) {
    paymentRegistered = false
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/stripe/webhook] GUESTY PAYMENT REGISTRATION FAILED after reservation was created', message)
    await sendCheckoutAlert(
      'Optima: booking created in Guesty but payment NOT registered',
      `Reservation ${reservation.confirmationCode} (${reservation.id}) exists in Guesty but the £${paymentIntent.amount_received / 100} Stripe payment ${paymentIntent.id} could not be recorded (${message}). Register it manually; the "Booking (Direct)" automation will not fire until paid.`,
    )
  }

  await recordCheckoutEvent({
    stripeEventId: event.id,
    type: event.type,
    paymentIntentId: paymentIntent.id,
    outcome: paymentRegistered ? 'reservation_created' : 'reservation_created_payment_not_registered',
    needsAttention: !paymentRegistered,
    detail: {
      guesty_reservation_id: reservation.id,
      confirmation_code: reservation.confirmationCode,
      amount_gbp: paymentIntent.amount_received / 100,
      payment_choice: meta.paymentChoice,
    },
  })

  return NextResponse.json({ received: true, reservationId: reservation.id })
}
