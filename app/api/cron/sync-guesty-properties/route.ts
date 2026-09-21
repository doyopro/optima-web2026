import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { getListingDetails, GuestyRateLimitError } from '@/lib/guesty-server'

// 125 sequential Guesty calls comfortably exceeds the 10s default Vercel
// function timeout; this account's Pro plan allows up to 300s for cron.
export const maxDuration = 300

// Guesty Listings -> properties sync: name, active/inactive status,
// amenities. Runs on the same 10-minute cadence as the reservations sync
// (see vercel.json) — that sync lives outside this repo, this is the first
// properties sync this codebase has ever had (guesty_synced_at was NULL on
// all 125 rows before this).
//
// Protected by CRON_SECRET so this can't be triggered by anyone hitting the
// URL (each run makes up to ~125 Guesty API calls — real rate-limit
// exposure if left open).
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: properties, error } = await supabaseServer
    .from('properties')
    .select('id, guesty_listing_id, name, status')
    .not('guesty_listing_id', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let updated = 0
  const failures: { id: string; error: string }[] = []
  let abortedByRateLimit = false

  for (const property of properties ?? []) {
    try {
      const details = await getListingDetails(property.guesty_listing_id as string)

      const { error: updateError } = await supabaseServer
        .from('properties')
        .update({
          name: details.title || property.name,
          status: details.active ? 'active' : 'inactive',
          amenities: details.amenities,
          guesty_synced_at: new Date().toISOString(),
        })
        .eq('id', property.id)

      if (updateError) throw new Error(updateError.message)
      updated++
    } catch (err) {
      // A rate limit on the OAuth token means Guesty is throttling this
      // account entirely — every remaining listing would fail the exact
      // same way. Retrying 124 more times wastes the run and, worse, keeps
      // re-hammering an endpoint that's already telling us to back off.
      // Stop immediately and let the next scheduled run pick up where this
      // one left off (properties not yet updated this run keep their old
      // guesty_synced_at, so nothing is silently skipped forever).
      if (err instanceof GuestyRateLimitError) {
        failures.push({ id: property.id, error: err.message })
        abortedByRateLimit = true
        break
      }

      const message = err instanceof Error ? err.message : 'Unknown error'
      failures.push({ id: property.id, error: message })
      console.error('[cron/sync-guesty-properties] failed for property', property.id, message)
    }
  }

  return NextResponse.json({
    total: properties?.length ?? 0,
    updated,
    failed: failures.length,
    abortedByRateLimit,
    failures: failures.slice(0, 20),
  })
}
