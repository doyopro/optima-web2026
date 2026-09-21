import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lanzarote Climate & Weather Guide | Optima Villas',
  description:
    'Monthly temperatures and the best time to visit Lanzarote — 300+ days of sunshine a year and mild winters, explained by our local team.',
}

export default function ClimateGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
