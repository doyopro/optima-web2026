'use client'

import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'

export default function Header() {
  const { lang, setLang } = useLanguage()

  const nav = translations[lang].nav

  const navItems = [
    { label: nav.home, href: '/' },
    { label: nav.villas, href: '/villas' },
    { label: nav.owners, href: '/owners' },
    { label: nav.blog, href: '/blog' },
  ]

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-neutral-100 text-dark/70 text-xs sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <nav className="flex items-center gap-3">
            <Link href="/manage-booking" className="hover:text-orange transition-colors">
              {nav.manageBooking}
            </Link>
            <span aria-hidden className="text-dark/30">•</span>
            <Link href="/help" className="hover:text-orange transition-colors">
              {nav.help}
            </Link>
          </nav>
          <p className="hidden items-center gap-2 sm:flex">
            <span>{nav.callForEnquiries}</span>
            <PhoneIcon className="h-4 w-4 text-orange" />
            <a href="tel:+442034111999" className="font-semibold text-dark hover:text-orange transition-colors">
              +44 (0)20 34 111 999
            </a>
          </p>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logooptima.png" alt="Optima Villas" width={145} height={44} priority />
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-dark hover:text-orange transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <div className="flex items-center rounded-full border border-neutral-200 text-xs font-semibold overflow-hidden">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'en' ? 'bg-orange text-white' : 'text-dark hover:bg-neutral-100'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'es' ? 'bg-orange text-white' : 'text-dark hover:bg-neutral-100'
                }`}
              >
                ES
              </button>
            </div>

            <button
              type="button"
              aria-label={nav.wishlist}
              className="text-dark hover:text-orange transition-colors"
            >
              <HeartIcon className="h-6 w-6" />
            </button>

            <Link
              href="/login"
              className="rounded-full bg-orange px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            >
              {nav.login}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.53 15.53 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.24 1.02l-2.2 2.2Z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  )
}
