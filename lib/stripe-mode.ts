// Single switch for Stripe test vs live. OFF (test) unless
// NEXT_PUBLIC_STRIPE_MODE is exactly "live". NEXT_PUBLIC_ so the browser form
// and the server routes always agree on the mode.
//
// Test mode: STRIPE_TEST_SECRET_KEY, STRIPE_TEST_WEBHOOK_SECRET,
//            NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY (sk_test_ / pk_test_).
// Live mode: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (sk_live_ / pk_live_).
export const STRIPE_LIVE = process.env.NEXT_PUBLIC_STRIPE_MODE === 'live'
