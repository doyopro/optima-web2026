// Server-only. Test mode by default; live mode only when
// NEXT_PUBLIC_STRIPE_MODE=live (see lib/stripe-config.ts for the variables).
// Each mode refuses a key of the other kind, so a misconfigured variable can
// never charge a real card in test mode or run live with a test key.
import Stripe from 'stripe'
import { STRIPE_LIVE } from '@/lib/stripe-config'

const secretKey = STRIPE_LIVE ? process.env.STRIPE_LIVE_SECRET_KEY : process.env.STRIPE_TEST_SECRET_KEY
const expectedPrefix = STRIPE_LIVE ? 'sk_live_' : 'sk_test_'

if (secretKey && !secretKey.startsWith(expectedPrefix)) {
  throw new Error(
    `Stripe is in ${STRIPE_LIVE ? 'LIVE' : 'TEST'} mode but the secret key does not start with ${expectedPrefix} — refusing to start.`,
  )
}

export const stripeConfigured = Boolean(secretKey)

export const stripeWebhookSecret = STRIPE_LIVE
  ? process.env.STRIPE_LIVE_WEBHOOK_SECRET
  : process.env.STRIPE_TEST_WEBHOOK_SECRET

export const stripeServer = secretKey ? new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' }) : null
