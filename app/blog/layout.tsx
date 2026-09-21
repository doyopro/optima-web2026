import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Optima Villas',
  description: 'Stories, guides and news from Óptima Villas and Lanzarote.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
