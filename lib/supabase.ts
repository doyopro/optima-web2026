import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Public, read-only client. Uses the anon key only — RLS on the `properties` and
// `property_guest_content` tables restricts this to public-safe columns/rows.
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)
