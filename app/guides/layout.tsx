import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lanzarote Travel Guides | Optima Villas',
  description:
    'Everything you need to know about Playa Blanca, Lanzarote and the Canary Islands: beaches, climate, ferries and more, from our local team.',
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children
}
