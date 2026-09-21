import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { getListingReviews, GuestyRateLimitError } from '@/lib/guesty-server'

// Guesty Reviews -> property_reviews sync. Only keeps rating >= 4 (this is
// a marketing surface — testimonials on the homepage — not a full review
// archive; see app/page.tsx / components/Testimonials.tsx).
//
// BLOCKED as of 2026-09: Guesty returns a permission error for this
// account's API credentials (see lib/guesty-server.ts:getListingReviews for
// the full story and what was tried). This route is otherwise complete and
// will start working the moment Guesty grants the Reviews API scope — no
// code change needed then, just start calling this on a schedule.
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: properties, error } = await supabaseServer
    .from('properties')
    .select('id, guesty_listing_id')
    .not('guesty_listing_id', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let inserted = 0
  const failures: { id: string; error: string }[] = []

  for (const property of properties ?? []) {
    try {
      const reviews = await getListingReviews(property.guesty_listing_id as string)
      const keep = reviews.filter((r) => r.rating != null && r.rating >= 4 && r.id)

      if (keep.length === 0) continue

      const { error: upsertError } = await supabaseServer.from('property_reviews').upsert(
        keep.map((r) => ({
          guesty_review_id: r.id,
          property_id: property.id,
          channel: r.channel,
          rating: r.rating,
          review_text: r.reviewText,
          author_name: r.authorName,
          review_date: r.reviewDate,
        })),
        { onConflict: 'guesty_review_id' },
      )

      if (upsertError) throw new Error(upsertError.message)
      inserted += keep.length
    } catch (err) {
      // Same reasoning as sync-guesty-properties: an OAuth rate limit means
      // the whole account is throttled, not just this listing — stop
      // immediately rather than repeat the same failure ~125 times.
      if (err instanceof GuestyRateLimitError) {
        failures.push({ id: property.id, error: err.message })
        break
      }

      const message = err instanceof Error ? err.message : 'Unknown error'
      failures.push({ id: property.id, error: message })
      // Not console.error-ing per-property here: while the known Guesty
      // permission block is active, this would log ~125 identical errors
      // every run. The aggregate failure count in the response is enough;
      // see the route-level comment above for the real story.
    }
  }

  return NextResponse.json({
    total: properties?.length ?? 0,
    reviewsUpserted: inserted,
    failed: failures.length,
    failures: failures.slice(0, 5),
  })
}
