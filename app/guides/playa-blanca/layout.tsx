import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playa Blanca Guide: Beaches & Things to Do | Optima Villas',
  description:
    'Beaches, things to do and practical info for Playa Blanca, Lanzarote — from the local team at Optima Villas.',
}

export default function PlayaBlancaGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
