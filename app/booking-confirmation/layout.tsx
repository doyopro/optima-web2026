import { notFound } from 'next/navigation'

// This page only shows hard-coded sample data (a fake booking reference,
// villa and amounts) for design review and is not linked from anywhere. It must
// not be reachable on the live site. The real confirmation is shown at the end
// of the checkout itself. Remove this guard only when the page reads a real
// reservation.
export default function BookingConfirmationLayout({ children }: { children: React.ReactNode }) {
  void children
  notFound()
}
