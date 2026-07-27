import { type Language, translations } from '@/lib/i18n'
import { TESTIMONIALS } from '@/lib/marketing'
import TestimonialCard from './TestimonialCard'

interface Props {
  lang: Language
}

export default function Testimonials({ lang }: Props) {
  const t = translations[lang].testimonials

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-start justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">{t.title}</h2>
            <p className="text-dark/60 leading-relaxed">{t.description}</p>
          </div>
          <div className="hidden md:flex items-center gap-2 mt-2 shrink-0">
            <button
              type="button"
              aria-label="Previous"
              className="h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center text-dark hover:border-orange hover:text-orange transition-colors"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next"
              className="h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center text-dark hover:border-orange hover:text-orange transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard
              key={i}
              {...testimonial}
              seeMoreLabel={t.seeMore}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
