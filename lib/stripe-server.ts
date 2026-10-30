// Server-only. The Stripe client for the website checkout.
//
// Test mode (default) uses the dedicated STRIPE_TEST_* env vars. Live mode is
// opt-in with NEXT_PUBLIC_STRIPE_MODE=live and uses STRIPE_SECRET_KEY. The key
// prefix must match the selected mode, otherwise this refuses to start — a
// misconfigured env var can never charge a real card in test mode, nor send a
// test key to production by mistake.
import Stripe from 'stripe'
import { STRIPE_LIVE } from '@/lib/stripe-mode'

const secretKey = STRIPE_LIVE ? process.env.STRIPE_SECRET_KEY : process.env.STRIPE_TEST_SECRET_KEY
const expectedPrefix = STRIPE_LIVE ? 'sk_live_' : 'sk_test_'

if (secretKey && !secretKey.startsWith(expectedPrefix)) {
  throw new Error(
    `Stripe secret key does not match the selected mode (${STRIPE_LIVE ? 'live' : 'test'} needs a key starting with ${expectedPrefix}) — refusing to start.`,
  )
}

export const stripeConfigured = Boolean(secretKey)

export const stripeWebhookSecret = STRIPE_LIVE
  ? process.env.STRIPE_WEBHOOK_SECRET
  : process.env.STRIPE_TEST_WEBHOOK_SECRET

export const stripeServer = secretKey
  ? new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' })
  : null
