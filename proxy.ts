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

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/my-booking')) {
    const hasSession = request.cookies.has(GUEST_SESSION_COOKIE)
    if (!hasSession) {
      return NextResponse.redirect(new URL('/guest-login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = { matcher: ['/my-booking/:path*'] }
