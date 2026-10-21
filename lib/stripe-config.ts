// Stripe mode switch. Default is TEST. Live is only used when
// NEXT_PUBLIC_STRIPE_MODE is exactly "live" (NEXT_PUBLIC_ so the browser
// picks the matching publishable key). Key prefixes are checked on both
// sides, so a test key can never be used in live mode or vice versa.
//
// TEST (default):  STRIPE_TEST_SECRET_KEY, NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY,
//                  STRIPE_TEST_WEBHOOK_SECRET
// LIVE:            NEXT_PUBLIC_STRIPE_MODE=live, STRIPE_LIVE_SECRET_KEY,
//                  NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY, STRIPE_LIVE_WEBHOOK_SECRET
export const STRIPE_LIVE = process.env.NEXT_PUBLIC_STRIPE_MODE === 'live'

export const STRIPE_PUBLISHABLE_KEY = STRIPE_LIVE
  ? (process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY ?? '')
  : (process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY ?? '')

export const STRIPE_PUBLISHABLE_KEY_VALID = STRIPE_PUBLISHABLE_KEY.startsWith(STRIPE_LIVE ? 'pk_live_' : 'pk_test_')
