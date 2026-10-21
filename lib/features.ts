// Online checkout (Stripe payment + Guesty reservation) is OFF unless
// NEXT_PUBLIC_CHECKOUT_ENABLED is exactly "true". NEXT_PUBLIC_ so the same
// flag is inlined into client components and read by server routes/layouts.
export const CHECKOUT_ENABLED = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === 'true'
