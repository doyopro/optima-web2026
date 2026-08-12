// METRICS and TESTIMONIALS content now live in lib/i18n.ts (translations[lang].home.metrics
// and translations[lang].testimonialsData) so they're available in both EN and ES.

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/optimavillas',
  whatsapp: 'https://wa.me/4648944',
}

// Single source of truth for the Trustpilot review count shown in
// ReviewBadges and reused in the homepage "Optima Difference" stats row —
// update here when the real count changes, never invent a number elsewhere.
export const TRUSTPILOT_REVIEW_COUNT = 615
