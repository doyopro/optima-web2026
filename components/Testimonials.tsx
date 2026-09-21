'use client'

import { useEffect, useRef, useState } from 'react'
import { type Language, translations } from '@/lib/i18n'
import TestimonialCard from './TestimonialCard'
import ReviewBadges from './ReviewBadges'

interface Props {
  lang: Language
}

interface PropertyReview {
  id: string
  rating: number
  text: string | null
  author: string | null
  date: string | null
  propertyName: string | null
}

const TRUSTPILOT_URL = 'https://uk.trustpilot.com/review/optimavillaslanzarote.com'

function formatReviewDate(value: string | null, lang: Language): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export default function Testimonials({ lang }: Props) {
  const t = translations[lang].testimonials

  const [reviews, setReviews] = useState<PropertyReview[]>([])

  useEffect(() => {
    fetch('/api/property-reviews')
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]))
  }, [])

  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  function scrollToIndex(i: number) {
    const card = cardRefs.current[i]
    if (!card || !trackRef.current) return
    trackRef.current.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
    setActiveIndex(i)
  }

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' })
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    // Find the card whose left edge is closest to the current scroll position.
    let closest = 0
    let closestDistance = Infinity
    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const distance = Math.abs(card.offsetLeft - track.scrollLeft)
      if (distance < closestDistance) {
        closestDistance = distance
        closest = i
      }
    })
    setActiveIndex(closest)
  }

  // Nothing to show until the Guesty reviews sync has real 5★ rows (see
  // app/api/cron/sync-guesty-reviews) — no fake fallback content, this
  // section just doesn't render rather than show placeholder testimonials.
  if (reviews.length === 0) {
    return (
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-[#F5F5F5]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">{t.title}</h2>
            <p className="text-dark/60 leading-relaxed">{t.description}</p>
          </div>
          <ReviewBadges lang={lang} />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-[#F5F5F5]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">{t.title}</h2>
          <p className="text-dark/60 leading-relaxed">{t.description}</p>
        </div>

        {/* Carousel — side arrows, vertically centered, sit at the track edges */}
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label={t.previous}
            className="absolute left-1 sm:-left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-neutral-200 flex items-center justify-center text-dark hover:border-orange hover:text-orange transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label={t.next}
            className="absolute right-1 sm:-right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-neutral-200 flex items-center justify-center text-dark hover:border-orange hover:text-orange transition-colors"
          >
            →
          </button>

          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review, i) => (
              <div
                key={review.id}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className="snap-start shrink-0 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
              >
                <TestimonialCard
                  rating={review.rating}
                  title={review.propertyName ?? ''}
                  text={review.text ?? ''}
                  author={review.author ?? ''}
                  date={formatReviewDate(review.date, lang)}
                  seeMoreLabel={t.seeMore}
                  seeLessLabel={t.seeLess}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots — mobile & desktop, one per testimonial */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'w-6 bg-orange' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>

        {/* Trustpilot CTA */}
        <div className="text-center mt-8">
          <a
            href={TRUSTPILOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-orange hover:text-dark transition-colors uppercase tracking-wide"
          >
            {t.trustpilotCta} <span className="text-lg">→</span>
          </a>
        </div>

        <ReviewBadges lang={lang} />
      </div>
    </section>
  )
}
