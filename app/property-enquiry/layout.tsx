import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enquire About a Stay | Optima Villas',
  description:
    "Tell us what you're looking for and our local team in Lanzarote will get back to you with availability and a quote.",
}

export default function PropertyEnquiryLayout({ children }: { children: React.ReactNode }) {
  return children
}
