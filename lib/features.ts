// Online checkout (Stripe payment + Guesty reservation) is OFF unless
// NEXT_PUBLIC_CHECKOUT_ENABLED is exactly "true". NEXT_PUBLIC_ so the same
// flag is inlined into client components and read by server routes/layouts.
export const CHECKOUT_ENABLED = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === 'true'

// Second, secondary booking path while our own checkout is off: Guesty's
// hosted booking engine (optimavillas.guestybookings.com). OFF unless
// NEXT_PUBLIC_GUESTY_BOOKING_FALLBACK is exactly "true".
export const GUESTY_BOOKING_FALLBACK = process.env.NEXT_PUBLIC_GUESTY_BOOKING_FALLBACK === 'true'
