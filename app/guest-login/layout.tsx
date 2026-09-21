import type { Metadata } from 'next'

// Login entry point to the guest portal — no personal data itself, but
// keeping it out of the index avoids surfacing a "log in with your
// booking code" form in search results. Belt-and-suspenders with the
// X-Robots-Tag header set in middleware.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function GuestLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
