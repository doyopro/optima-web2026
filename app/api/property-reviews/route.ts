import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Public, read-only — real 5★ Guesty reviews for the homepage testimonials
// section (replaces the old hardcoded site_content.testimonialsData). The
// sync job keeps rating >= 4 rows (see app/api/cron/sync-guesty-reviews),
// this endpoint narrows to exactly 5 for the homepage's "genuine 5-star
// reviews" framing.
//
// Uses the service-role client for the properties(name) join — same
// reasoning as /api/villas and /api/properties/[id]: the anon role's column
// grants on `properties` are already known to be incomplete for other
// columns, and this is a server-only route, so there's no reason to risk
// hitting that gap here too.
export async function GET() {
  const { data, error } = await supabaseServer
    .from('property_reviews')
    .select('id, rating, review_text, author_name, review_date, property_id, properties(name)')
    .eq('rating', 5)
    .not('review_text', 'is', null)
    .order('review_date', { ascending: false })
    .limit(12)

  if (error) {
    console.error('[/api/property-reviews]', error.message)
    return NextResponse.json({ reviews: [] }, { status: 200 })
  }

  const reviews = (data ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    text: row.review_text,
    author: row.author_name,
    date: row.review_date,
    propertyName: (row.properties as unknown as { name: string } | null)?.name ?? null,
  }))

  return NextResponse.json({ reviews })
}
