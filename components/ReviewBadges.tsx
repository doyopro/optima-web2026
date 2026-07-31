import { type Language, translations } from '@/lib/i18n'

interface Props {
  lang: Language
}

const GOOGLE_SEARCH_URL = 'https://www.google.com/search?q=Optima+Villas+Lanzarote+reviews'

function Stars({ color, count = 5 }: { color: string; count?: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill={color} className="h-4 w-4">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  )
}

function TrustpilotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#00b67a" />
      <path fill="#fff" d="M12 4.5l2.14 4.34 4.79.7-3.47 3.38.82 4.78L12 15.4l-4.28 2.3.82-4.78-3.47-3.38 4.79-.7L12 4.5z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.5 8.5h-1.4c-.5 0-.8.3-.8.9v1.3h2.1l-.3 2.2h-1.8V19h-2.3v-6.1H9.3v-2.2h1.7V9.1c0-1.7 1-2.9 2.7-2.9h1.8v2.3z"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.5 12.23c0-.75-.07-1.47-.19-2.16H12v4.1h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.54c2.07-1.9 3.25-4.7 3.25-8z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.75c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.83 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.65-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.65 2.84c.87-2.59 3.3-4.51 6.17-4.51z"
      />
    </svg>
  )
}

export default function ReviewBadges({ lang }: Props) {
  const t = translations[lang].reviewBadges

  const badges = [
    {
      key: 'trustpilot',
      href: 'https://uk.trustpilot.com/review/optimavillaslanzarote.com',
      icon: <TrustpilotIcon />,
      name: 'Trustpilot',
      rating: '4.6',
      sub: t.trustScore,
      count: `615 ${t.reviews}`,
      stars: <Stars color="#00b67a" />,
    },
    {
      key: 'facebook',
      href: 'https://facebook.com/optimavillas',
      icon: <FacebookIcon />,
      name: 'Facebook',
      rating: '4.9',
      sub: t.rating,
      count: null,
      stars: <Stars color="#1877F2" />,
    },
    {
      key: 'google',
      href: GOOGLE_SEARCH_URL,
      icon: <GoogleIcon />,
      name: 'Google',
      rating: '4.8',
      sub: t.rating,
      count: null,
      stars: <Stars color="#FBBC05" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
      {badges.map((b) => (
        <a
          key={b.key}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 hover:border-orange hover:shadow-md transition-all"
        >
          {b.icon}
          <div className="min-w-0">
            <p className="text-sm font-bold text-dark">
              {b.name} <span className="font-extrabold">{b.rating}</span>
            </p>
            {b.stars}
            <p className="text-xs text-dark/50 truncate">{b.count ?? b.sub}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
