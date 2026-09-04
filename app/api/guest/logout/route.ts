import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase-server'
import { GUEST_SESSION_COOKIE } from '@/lib/guest-auth'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(GUEST_SESSION_COOKIE)?.value

  if (token) {
    // Best-effort — clearing the cookie is what actually ends the client's
    // access; deleting the row just avoids leaving stale session rows.
    await supabaseServer.from('guest_sessions').delete().eq('token', token).then(
      () => {},
      () => {}
    )
  }

  const res = NextResponse.json({ success: true })
  res.cookies.delete(GUEST_SESSION_COOKIE)
  return res
}
