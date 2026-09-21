import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { stripeServer, stripeConfigured } from '@/lib/stripe-server'
import { guestSessionCanAccessReservation } from '@/lib/guest-auth'
import { getPaymentSummary } from '@/lib/guest-payments'

// Lets a logged-in guest pay any amount up to their remaining balance — not
// just the fixed 20%/100% choice the new-booking checkout offers
// (app/villas/[id]/checkout), since a guest paying off an existing deposit
// in installments needs an arbitrary amount each time.
export async function POST(req: NextRequest) {
  if (!stripeConfigured || !stripeServer) {
    return NextResponse.json({ error: 'Stripe is not configured for this beta.' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const reservationId = String(body.reservationId ?? '').trim()
    const amount = Number(body.amount)

    if (!reservationId) {
      return NextResponse.json({ error: 'reservationId is required' }, { status: 400 })
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Never trust a client-sent balance — re-derive it server-side from the
    // same session check and payment math the guest portal itself uses.
    const canAccess = await guestSessionCanAccessReservation(reservationId)
    if (!canAccess) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })
    }

    const { data: reservation } = await supabaseServer
      .from('reservations')
      .select(
        'id, contact_id, channel_booking_id, property_id, property_name, guest_name, guest_email, guest_phone, check_in, check_out, nights, num_guests, status, paid, amount_gbp, amount_eur, currency, payment_method',
      )
      .eq('id', reservationId)
      .maybeSingle()

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    const summary = await getPaymentSummary(reservation)
    if (amount > summary.balanceDueGbp + 0.005) {
      return NextResponse.json(
        { error: `Amount exceeds the remaining balance of £${summary.balanceDueGbp.toFixed(2)}` },
        { status: 400 },
      )
    }

    // This endpoint only creates the PaymentIntent and hands the
    // client_secret back — it does NOT write to `payments` itself (2026-09
    // correction). An existing n8n workflow ("Stripe -> Google Sheets
    // (Payments)") already listens to every Stripe charge in real time and
    // inserts it into `payments`, matched against
    // reservations.channel_booking_id. That process dedupes by its own
    // `reference` field, not Stripe's payment_intent id, so an insert from
    // here too would duplicate the same real charge into two rows.
    //
    // `description` must be EXACTLY reservation.channel_booking_id —
    // nothing else, no prefix/suffix (2026-09 correction). n8n matches it
    // against reservations.channel_booking_id with an exact `=`, not a
    // substring search, so any extra text ("Balance payment - ...") breaks
    // the match. Anything identifying this as a balance payment (vs. the
    // reservation's original payment) belongs in `metadata` instead, never
    // in `description` — see payment_type below.
    const paymentIntent = await stripeServer.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'gbp',
      metadata: {
        kind: 'guest_balance_payment',
        payment_type: 'balance',
        reservation_id: reservation.id,
        channel_booking_id: reservation.channel_booking_id ?? '',
        contact_id: reservation.contact_id ?? '',
      },
      receipt_email: reservation.guest_email ?? undefined,
      description: reservation.channel_booking_id ?? '',
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/guest/pay-balance]', message)
    return NextResponse.json({ error: 'Failed to start payment' }, { status: 500 })
  }
}
