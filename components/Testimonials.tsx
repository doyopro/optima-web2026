'use client'

import { useRef, useState } from 'react'
import { type Language, translations } from '@/lib/i18n'
import TestimonialCard from './TestimonialCard'

interface Props {
  lang: Language
}

const TRUSTPILOT_URL = 'https://uk.trustpilot.com/review/optimavillaslanzarote.com'

export default function Testimonials({ lang }: Props) {
  const t = translations[lang].testimonials
  const testimonialsData = translations[lang].testimonialsData

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

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
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
            {testimonialsData.map((testimonial, i) => (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className="snap-start shrink-0 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
              >
                <TestimonialCard {...testimonial} seeMoreLabel={t.seeMore} seeLessLabel={t.seeLess} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots — mobile & desktop, one per testimonial */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonialsData.map((_, i) => (
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
      </div>
    </section>
  )
}
