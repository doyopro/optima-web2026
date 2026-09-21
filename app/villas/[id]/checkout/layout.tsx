import type { Metadata } from 'next'

// Checkout is a transactional step, not content worth ranking — and stops
// this route from silently inheriting the /villas listing's marketing
// title/description.
export const metadata: Metadata = {
  title: 'Complete Your Booking | Optima Villas',
  robots: { index: false, follow: true },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
