import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Optima Villas',
  description: 'The terms and conditions that apply when you book a holiday villa with Optima Villas.',
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
