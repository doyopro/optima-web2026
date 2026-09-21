import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property Management in Lanzarote | Optima Villas',
  description:
    'Full-service villa management in Lanzarote — bookings, guest care, cleaning and maintenance handled by a local team, with clear monthly reports.',
}

export default function OwnersLayout({ children }: { children: React.ReactNode }) {
  return children
}
