import { redirect } from 'next/navigation'

// Superseded by the real guest login/self-service portal at /guest-login —
// this route stays only so any existing bookmarks/links still resolve.
export default function ManageBookingPage() {
  redirect('/guest-login')
}
