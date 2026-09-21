import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js 16 renamed `middleware.ts` to `proxy.ts` — see AGENTS.md.
//
// Guards /my-booking/* with a cheap, Edge-safe check only (cookie
// presence) — no DB access here. Real validation (token exists in
// guest_sessions, not expired, matches the reservation in the URL) happens
// server-side in each /my-booking page via requireGuestSession(), which is
// what actually gates the data. This layer just avoids serving the page
// shell to a request with no session cookie at all.
//
// Inlined rather than imported from lib/guest-auth.ts — that module also
// pulls in supabaseServer and Node's crypto (randomBytes), neither of which
// belong in the Edge-run proxy bundle. Keep this string in sync with
// GUEST_SESSION_COOKIE there.
const GUEST_SESSION_COOKIE = 'guest_session'

// Old WordPress image-attachment pages: the site auto-generated a standalone
// page for every image, using the image's own filename as the slug. These
// were never meant to be indexed as content and have near-zero SEO value.
// Heuristic covers the two patterns seen in the Search Console sample
// (dimension suffix like "-960-720", and stock-photo naming like
// "-unsplash"/"-shutterstock") without hand-listing every one of the ~235
// indexed URLs as they're discovered.
const WORDPRESS_IMAGE_ATTACHMENT_PATTERN = /-\d{2,4}x?-?\d{2,4}\/?$|-(unsplash|shutterstock|istockphoto|pexels)(-\d+)?\/?$/i

// Routes behind guest auth: personal booking data (name, dates, payment
// status/amount) must never be indexed or cached by a crawler, even if
// hit before any in-page noindex meta tag would apply. The X-Robots-Tag
// header is enforced before the response body is ever generated, so it
// covers this case that a <meta> tag alone can't.
const GUEST_PORTAL_PREFIXES = ['/guest-login', '/my-booking']

// /web is the internal staff dashboard (Guides CMS, and more tabs planned)
// — it has no auth yet (see app/web/layout.tsx), but regardless of that, it
// has no business being indexed by a search engine. Its layout is a client
// component so it can't export `metadata` itself; enforced here instead.
const INTERNAL_DASHBOARD_PREFIX = '/web'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const host = request.headers.get('host') || ''

  if (WORDPRESS_IMAGE_ATTACHMENT_PATTERN.test(pathname)) {
    return NextResponse.redirect(new URL('/blog', request.url), 308)
  }

  if (pathname.startsWith('/my-booking')) {
    const hasSession = request.cookies.has(GUEST_SESSION_COOKIE)
    if (!hasSession) {
      return NextResponse.redirect(new URL('/guest-login', request.url))
    }
  }

  const response = NextResponse.next()

  const isGuestPortal = GUEST_PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  const isInternalDashboard =
    pathname === INTERNAL_DASHBOARD_PREFIX || pathname.startsWith(`${INTERNAL_DASHBOARD_PREFIX}/`)

  // Any *.vercel.app preview/production alias — the real domain isn't
  // connected yet, so this is the only host these deployments are ever
  // reachable on today. Once the custom domain goes live, requests there
  // won't match this and won't carry the header.
  const isVercelStagingHost = host.endsWith('.vercel.app')

  if (isGuestPortal || isInternalDashboard || isVercelStagingHost) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
}
