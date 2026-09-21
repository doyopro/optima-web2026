import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old villas/apartments listing pages -> new villas listing
      { source: '/villas/', destination: '/villas', permanent: true },
      { source: '/apartments/', destination: '/villas', permanent: true },

      // Owners
      { source: '/owners/', destination: '/owners', permanent: true },

      // No dedicated "about" section exists yet -> homepage
      { source: '/about/', destination: '/', permanent: true },

      // Blog
      { source: '/blog/', destination: '/blog', permanent: true },

      // Old Lanzarote guide hub -> new guides hub
      { source: '/lanzarote-guide/', destination: '/guides', permanent: true },
      { source: '/lanzarote-guide/ferry/', destination: '/guides/ferries', permanent: true },
      { source: '/lanzarote-guide/weather/', destination: '/guides/climate', permanent: true },
      // PLACEHOLDER REDIRECTS — content backlog, not a code task. Confirmed
      // (2026-09 audit + direct guides_content query) these topics have no
      // page and no unpublished row waiting to be wired up: car-hire,
      // restaurants, excursions, bus-services, marina-rubicon,
      // exploring-yaiza, and healthcare (checked specifically per the claim
      // that healthcare content was already scraped into Supabase — the
      // guides_content table only has beaches/climate/ferries/playa-blanca
      // rows, no healthcare row exists). Update these to the dedicated page
      // once someone writes/migrates the content — do not leave pointing at
      // the generic index forever.
      { source: '/lanzarote-guide/bus-services/', destination: '/guides', permanent: true },
      { source: '/lanzarote-guide/car-hire/', destination: '/guides', permanent: true },
      { source: '/lanzarote-guide/healthcare-in-playa-blanca/', destination: '/guides', permanent: true },
      { source: '/lanzarote-guide/excursions/', destination: '/guides', permanent: true },
      { source: '/lanzarote-guide/restaurants/', destination: '/guides', permanent: true },
      { source: '/lanzarote-guide/marina-rubicon/', destination: '/guides', permanent: true },
      { source: '/lanzarote-guide/exploring-yaiza/', destination: '/guides', permanent: true },

      // Different old URL prefix, same "no dedicated page yet" situation as
      // the /lanzarote-guide/* placeholders above.
      { source: '/travel-information/driving_lanzarote/', destination: '/guides', permanent: true },
      { source: '/travel-information-2/travel-playa-blanca-arrecife-airport/', destination: '/guides', permanent: true },
      { source: '/travel-information-2/bike-hire-playa-blanca/', destination: '/guides', permanent: true },

      // Old FAQ page -> homepage FAQ section
      { source: '/playa-blanca-villa-holidays-faq/', destination: '/#faq', permanent: true },

      // Legal
      { source: '/terms-and-conditions/', destination: '/terms', permanent: true },
      { source: '/privacy-policy/', destination: '/privacy', permanent: true },

      // /property-enquiry now exists (built 2026-09-12) — better match than
      // the homepage fallback this used before.
      { source: '/contact-us/', destination: '/property-enquiry', permanent: true },

      // Real old blog/article content with a topically matching post already
      // live in blog_posts -> redirect straight to that post, not the index.
      { source: '/cesar-manrique/', destination: '/blog/must-see-attractions-lanzarote-cesar-manrique', permanent: true },
      { source: '/more-manrique-magic/', destination: '/blog/must-see-attractions-lanzarote-cesar-manrique', permanent: true },
      { source: '/child-and-toddler-friendly-villas-in-lanzarote/', destination: '/blog/lanzarote-family-holidays-practical-guide', permanent: true },

      // Real old blog/article content with NO topically matching post yet ->
      // blog index, not the homepage, so the visitor stays in the right
      // section. Revisit if/when a replacement post is written.
      { source: '/new-year-on-lanzarote/', destination: '/blog', permanent: true },
      { source: '/the-ultimate-guide-to-celebrating-new-year-in-lanzarote/', destination: '/blog', permanent: true },
      { source: '/shutter-island-a-photographers-guide-to-lanzarote/', destination: '/blog', permanent: true },
      { source: '/villas-in-lanzarote-why-theyre-perfect-for-your-honeymoon/', destination: '/blog', permanent: true },
      { source: '/visit-lanzarotes-film-star/', destination: '/blog', permanent: true },

      // Expired promotional/time-limited content, not worth a specific page.
      { source: '/win-an-optima-villa-holiday/', destination: '/blog', permanent: true },
      { source: '/july-discount-deals-surefire-summer-sun/', destination: '/blog', permanent: true },
      { source: '/lanzarote-fashion-weekend-2018/:path*', destination: '/blog', permanent: true },

      // WordPress orphaned image-attachment pages sampled from Search
      // Console (near-zero SEO value, never meant to be indexed standalone).
      // The general regex catch-all for this whole pattern (numeric WxH
      // suffix, "-unsplash", etc.) lives in middleware.ts since next.config
      // redirects() can't express that heuristic across arbitrary prefixes.
      { source: '/about/no-fees-icon-2/', destination: '/', permanent: true },

      // NOT mapped, intentionally, pending business decision:
      //   /transparency-portal/   - no equivalent section exists
      //
      // /privacy-policy/ -> /privacy is now mapped above: the page was built
      // from site_content (section='privacy') on 2026-09-12. Note the content
      // itself still has [NOTE FOR REVIEW]/bracketed placeholders (legal
      // entity name, retention periods, etc.) pending Sonia/Nico sign-off,
      // and the Spanish translation is pending human review (falls back to
      // English in the meantime) — see app/privacy/PrivacyClient.tsx.
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.guesty.com',
      },
      {
        protocol: 'https',
        hostname: 'guesty-listing-images.s3.amazonaws.com',
      },
    ],
  },
}

export default nextConfig
