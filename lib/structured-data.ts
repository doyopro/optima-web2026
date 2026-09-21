import { type Language, translations } from './i18n'

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://optimavillaslanzarote.com').replace(/\/$/, '')

// All values below are real, currently-published facts pulled from the same
// places they're already displayed on the site — nothing here is invented
// for the schema:
//   - phone/email: as given for LocalBusiness markup
//   - sameAs: components/Footer.tsx (Facebook, Instagram) and
//     components/ReviewBadges.tsx (Trustpilot profile URL)
export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Optima Villas',
    url: SITE_URL,
    telephone: '+44 20 3411 1999',
    email: 'enquiries@optimavillas.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Playa Blanca',
      addressRegion: 'Lanzarote, Canary Islands',
      addressCountry: 'ES',
    },
    sameAs: [
      'https://facebook.com/optimavillas',
      'https://www.instagram.com/optimavillaslanzarote',
      'https://uk.trustpilot.com/review/optimavillaslanzarote.com',
    ],
  }
}

export interface JsonLdReview {
  rating: number
  author: string | null
  text: string | null
  propertyName: string | null
}

// Deliberately NOT built from the Trustpilot/Facebook/Google badge numbers
// shown in components/ReviewBadges.tsx (4.6, 4.9, 4.8) — those are three
// different external platforms' own aggregates, and Google's structured
// data guidelines for review/rating markup require the reviews behind an
// AggregateRating to actually be visible, in full, on the page carrying the
// markup. Badge scores linking out to Trustpilot/Facebook/Google aren't
// that.
//
// As of 2026-09 this is built from the SAME real Guesty reviews
// (property_reviews, via /api/property-reviews) that
// components/Testimonials.tsx renders in full on the homepage — passed in
// by the caller rather than fetched here, since app/page.tsx already fetches
// them once for the visible section. Returns null when there are no real
// reviews yet (e.g. before the Guesty reviews sync has any data) rather
// than emit an AggregateRating for zero actual reviews.
export function buildReviewJsonLd(reviews: JsonLdReview[]) {
  if (reviews.length === 0) return null

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Optima Villas',
    url: SITE_URL,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(average.toFixed(1)),
      reviewCount: reviews.length,
      bestRating: 5,
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author ?? 'Guest' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
      },
      name: r.propertyName ?? undefined,
      reviewBody: r.text ?? undefined,
    })),
  }
}

export function buildFaqJsonLd(lang: Language) {
  const faq = translations[lang].faq

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
