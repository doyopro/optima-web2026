import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CHECKOUT_ENABLED } from '@/lib/features'

// Checkout is a transactional step, not content worth ranking — and stops
// this route from silently inheriting the /villas listing's marketing
// title/description. 404s entirely while online checkout is switched off.
export const metadata: Metadata = {
  title: 'Complete Your Booking | Optima Villas',
  robots: { index: false, follow: true },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  if (!CHECKOUT_ENABLED) notFound()
  return children
}
