// Server-only. BETA checkout — internal testing only, no real guest is sent
// here (the site's "Book Now" buttons still point at Guesty's real booking
// engine, untouched). This file is deliberately wired to TEST-MODE-ONLY,
// dedicated env vars (STRIPE_TEST_SECRET_KEY), never the existing
// STRIPE_SECRET_KEY (which is a live key already in use elsewhere) — and it
// refuses to start if that key isn't actually a test key, so a
// misconfigured env var can never let this beta code path charge a real
// card.
import Stripe from 'stripe'

const secretKey = process.env.STRIPE_TEST_SECRET_KEY

if (secretKey && !secretKey.startsWith('sk_test_')) {
  throw new Error(
    'STRIPE_TEST_SECRET_KEY is set but is not a Stripe TEST key (must start with sk_test_) — refusing to start to avoid ever charging a real card from the beta checkout.',
  )
}

export const stripeConfigured = Boolean(secretKey)

export const stripeServer = secretKey
  ? new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' })
  : null
