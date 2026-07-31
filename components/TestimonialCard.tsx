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
}

export default function TestimonialCard({
  rating,
  title,
  text,
  author,
  date,
  seeMoreLabel = 'See more',
  seeLessLabel = 'See less',
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
      <h3 className="text-lg font-bold leading-snug text-dark line-clamp-2">{title}</h3>

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
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-orange/15 flex items-center justify-between text-xs">
        <span className="font-semibold text-dark">{author}</span>
        <span className="text-dark/50">{date}</span>
      </div>
    </div>
  )
}
