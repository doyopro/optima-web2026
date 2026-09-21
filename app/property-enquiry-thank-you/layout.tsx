import type { Metadata } from 'next'

// A thank-you page has no content of its own worth ranking, and indexing it
// would let it show up in search disconnected from actually submitting the
// form — standard practice to keep it out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function PropertyEnquiryThankYouLayout({ children }: { children: React.ReactNode }) {
  return children
}
