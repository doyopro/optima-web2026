interface Props {
  bgColor: 'blue' | 'yellow' | 'green'
  rating: number
  title: string
  text: string
  author: string
  date: string
  seeMoreLabel?: string
}

const bgMap = {
  blue: 'bg-blue',
  yellow: 'bg-yellow',
  green: 'bg-green',
}

const textMap = {
  blue: 'text-white',
  yellow: 'text-dark',
  green: 'text-dark',
}

const borderMap = {
  blue: 'border-white/30',
  yellow: 'border-dark/20',
  green: 'border-dark/20',
}

const mutedMap = {
  blue: 'text-white/70',
  yellow: 'text-dark/60',
  green: 'text-dark/60',
}

export default function TestimonialCard({
  bgColor,
  rating,
  title,
  text,
  author,
  date,
  seeMoreLabel = 'See more',
}: Props) {
  const bg = bgMap[bgColor]
  const textColor = textMap[bgColor]
  const borderColor = borderMap[bgColor]
  const mutedColor = mutedMap[bgColor]

  return (
    <div
      className={`${bg} ${textColor} rounded-2xl p-6 md:p-8 flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}
    >
      {/* Stars */}
      <div className="flex gap-0.5 text-xl" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? '' : 'opacity-30'}>
            ★
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold leading-snug">{title}</h3>

      {/* Text */}
      <p className={`text-sm leading-relaxed flex-1 ${mutedColor}`}>
        {text}{' '}
        <button type="button" className="font-semibold underline underline-offset-2">
          {seeMoreLabel}
        </button>
      </p>

      {/* Footer */}
      <div className={`pt-4 border-t ${borderColor} flex items-center justify-between text-xs`}>
        <span className="font-semibold">{author}</span>
        <span className={mutedColor}>{date}</span>
      </div>
    </div>
  )
}
