'use client'

import { useState } from 'react'

interface Props {
  rating: number
  title: string
  text: string
  author: string
  date: string
  seeMoreLabel?: string
  seeLessLabel?: string
  // Optional extras (Trustpilot reviews): country shown next to the name, a
  // source link in the footer, and a note under the text (e.g. "Original
  // review in English").
  country?: string
  source?: { label: string; url: string }
  note?: string
}

export default function TestimonialCard({
  rating,
  title,
  text,
  author,
  date,
  seeMoreLabel = 'See more',
  seeLessLabel = 'See less',
  country,
  source,
  note,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="h-full bg-cream border border-orange/15 rounded-2xl p-6 md:p-8 flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
      {/* Stars */}
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-xl text-orange" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? '' : 'opacity-25'}>
              ★
            </span>
          ))}
        </div>
        <span className="text-3xl leading-none text-orange/30 font-serif select-none" aria-hidden="true">
          &rdquo;
        </span>
      </div>

      {/* Title */}
      {title && <h3 className="text-lg font-bold leading-snug text-dark line-clamp-2">{title}</h3>}

      {/* Text */}
      <div className="flex-1">
        <p className={`text-sm leading-relaxed text-dark/60 ${expanded ? '' : 'line-clamp-4'}`}>{text}</p>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-sm font-semibold text-orange underline underline-offset-2"
        >
          {expanded ? seeLessLabel : seeMoreLabel}
        </button>
        {note && <p className="mt-2 text-xs italic text-dark/50">{note}</p>}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-orange/15 flex items-center justify-between text-xs">
        <span className="font-semibold text-dark">
          {author}
          {country && <span className="font-normal text-dark/50"> · {country}</span>}
        </span>
        <span className="text-dark/50 text-right">
          {date}
          {source && (
            <>
              {' · '}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-orange hover:underline"
              >
                {source.label}
              </a>
            </>
          )}
        </span>
      </div>
    </div>
  )
}
