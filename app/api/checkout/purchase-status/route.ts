import { NextRequest, NextResponse } from 'next/server'
import { stripeServer, stripeConfigured } from '@/lib/stripe-server'

// Read by the checkout page after the card payment succeeds, to learn the
// outcome of the server-side booking (the Stripe webhook creates the Guesty
// reservation) so ONE 'Purchase' analytics event can be sent per RESERVATION,
// with the reservation code as transaction_id and the amount Stripe really
// charged. Returns only non-sensitive fields, and only for website-checkout
// PaymentIntents.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('pi') ?? ''
  if (!/^pi_[A-Za-z0-9]+$/.test(id)) return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  if (!stripeConfigured || !stripeServer) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  try {
    const pi = await stripeServer.paymentIntents.retrieve(id)
    const meta = pi.metadata ?? {}
    if (meta.checkout !== 'web' || pi.status !== 'succeeded') {
      return NextResponse.json({ status: 'unknown' }, { status: 404 })
    }
    if (meta.auto_refunded === 'true') return NextResponse.json({ status: 'refunded' })

    const code = meta.guesty_confirmation_code || (meta.guesty_reservation_id ? pi.description : null)
    if (!meta.guesty_reservation_id || !code) return NextResponse.json({ status: 'pending' })

    return NextResponse.json({
      status: 'ready',
      transactionId: code,
      value: pi.amount_received / 100,
      currency: pi.currency.toUpperCase(),
      paymentChoice: meta.paymentChoice === 'deposit' ? 'deposit' : 'full',
      bookingTotal: Number.isFinite(Number(meta.totalPrice)) ? Number(meta.totalPrice) : null,
      propertyId: meta.propertyId ?? null,
    })
  } catch (err) {
    if ((err as { code?: string }).code === 'resource_missing') return NextResponse.json({ status: 'unknown' }, { status: 404 })
    console.error('[GET /api/checkout/purchase-status]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
