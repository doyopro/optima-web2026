import { NextRequest, NextResponse } from 'next/server'
import { stripeServer, stripeConfigured } from '@/lib/stripe-server'

// BETA — internal testing only. Amount/currency and every booking detail
// used later to create the Guesty reservation are taken from the CLIENT
// here for the beta's simplicity, but re-validated server-side before the
// reservation is ever created (see the webhook handler) — this route only
// creates a Stripe PaymentIntent, it never books anything itself.
export async function POST(req: NextRequest) {
  if (!stripeConfigured || !stripeServer) {
    return NextResponse.json(
      { error: 'Stripe is not configured for this beta (missing STRIPE_TEST_SECRET_KEY).' },
      { status: 503 },
    )
  }

  try {
    const body = await req.json()
    const {
      amountGbp,
      propertyId,
      guestyListingId,
      checkIn,
      checkOut,
      paymentChoice,
      guestName,
      guestEmail,
      guestPhone,
      totalPrice,
    } = body as {
      amountGbp: number
      propertyId: string
      guestyListingId: string
      checkIn: string
      checkOut: string
      paymentChoice: 'deposit' | 'full'
      guestName: string
      guestEmail: string
      guestPhone: string
      totalPrice: number
    }

    if (!amountGbp || amountGbp <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    if (!propertyId || !guestyListingId || !checkIn || !checkOut || !guestName || !guestEmail) {
      return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 })
    }

    const paymentIntent = await stripeServer.paymentIntents.create({
      amount: Math.round(amountGbp * 100), // pence
      currency: 'gbp',
      // Stored on the PaymentIntent so the webhook handler (the only place
      // that ever creates the real Guesty reservation) doesn't need to
      // trust anything from the client at confirmation time.
      metadata: {
        beta: 'true',
        propertyId,
        guestyListingId,
        checkIn,
        checkOut,
        paymentChoice,
        guestName,
        guestEmail,
        guestPhone: guestPhone ?? '',
        totalPrice: String(totalPrice ?? ''),
      },
      receipt_email: guestEmail,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/checkout/create-payment-intent]', message)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
