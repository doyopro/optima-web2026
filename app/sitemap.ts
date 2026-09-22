import { type MetadataRoute } from 'next'
import { supabaseServer } from '@/lib/supabase-server'

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://optimavillaslanzarote.com').replace(/\/$/, '')
}

// Static, real content pages only. Deliberately excludes:
//   - /guest-login, /my-booking/*, /manage-booking  (Task 3: personal guest
//     data behind auth, noindex'd via proxy.ts)
//   - /web/*                                        (internal dashboard,
//     noindex'd via proxy.ts)
//   - /booking-confirmation                         (unwired design
//     placeholder with hardcoded sample data, not a real page yet)
//   - /property-enquiry-thank-you                   (thank-you page,
//     noindex'd via its own layout.tsx)
//   - /villas/[id]/checkout                         (transactional step,
//     noindex'd via its own layout.tsx)
const STATIC_ROUTES = [
  '',
  '/villas',
  '/owners',
  '/blog',
  '/guides',
  '/guides/playa-blanca',
  '/guides/climate',
  '/guides/ferries',
  '/guides/beaches',
  '/property-enquiry',
  '/privacy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  // Villa detail pages — clean URLs only (no query-param variants: those
  // are noindex'd per Task 2's generateMetadata in app/villas/[id]/page.tsx,
  // and a sitemap entry never carries a query string in the first place).
  //
  // Uses the service-role client, not supabasePublic: RLS on `properties`
  // doesn't grant the anon role a plain id/status read (same situation
  // already handled in /api/properties/[id]/route.ts) — confirmed by this
  // returning zero rows against supabasePublic in testing, while
  // /api/villas (which uses supabaseServer) returns all 79. This is
  // server-only code, never shipped to the browser, so service-role here is
  // fine.
  const { data: properties } = await supabaseServer
    .from('properties')
    .select('id')
    .eq('status', 'active')
    .eq('is_bookable', true)

  const villaEntries: MetadataRoute.Sitemap = (properties || []).map((p) => ({
    url: `${base}/villas/${p.id}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const { data: posts } = await supabaseServer.from('blog_posts').select('slug, published_at')

  const blogEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...villaEntries, ...blogEntries]
}
