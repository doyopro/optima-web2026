import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Holiday Villas in Lanzarote | Optima Villas',
  description:
    'Browse our full range of holiday villas in Lanzarote — private pools, stunning views and personalised service. Book direct with Optima Villas.',
}

export default function VillasLayout({ children }: { children: React.ReactNode }) {
  return children
}
