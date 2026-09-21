import { type MetadataRoute } from 'next'

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://optimavillaslanzarote.com').replace(/\/$/, '')
}

// Not host-conditional (e.g. blocking everything on *.vercel.app): this file
// is statically generated once and served identically everywhere, so it
// can't reliably branch on the request host. The staging-domain noindex
// requirement (Task 5) is already covered more reliably by the
// X-Robots-Tag response header set in proxy.ts, which runs per-request.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/guest-login', '/my-booking/', '/manage-booking', '/web/', '/api/'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
