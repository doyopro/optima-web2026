import type { Metadata } from 'next'

// Every route under here shows a specific guest's personal booking data
// (name, dates, payment status/amount) gated behind requireGuestSession().
// Belt-and-suspenders with the X-Robots-Tag header set in middleware.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MyBookingLayout({ children }: { children: React.ReactNode }) {
  return children
}
