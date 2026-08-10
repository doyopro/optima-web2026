'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { useCurrency } from '@/lib/CurrencyContext'

export default function Header() {
  const { lang, setLang } = useLanguage()
  const { currency, setCurrency } = useCurrency()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const nav = translations[lang].nav

  const navItems = [
    { label: nav.home, href: '/' },
    { label: nav.villas, href: '/villas' },
    { label: nav.owners, href: '/owners' },
    { label: nav.blog, href: '/blog' },
  ]

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-neutral-100 text-dark/70 text-xs sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <nav className="flex items-center gap-3">
            <Link href="/manage-booking" className="hover:text-orange transition-colors">
              {nav.manageBooking}
            </Link>
          </nav>
          <p className="hidden items-center gap-2 sm:flex">
            <span>{nav.callForEnquiries}</span>
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
            {/* Lang + currency toggles — desktop only, folded into the mobile menu below md */}
            <div className="hidden md:flex items-center gap-2">
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

              <div className="flex items-center rounded-full border border-neutral-200 text-xs font-semibold overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCurrency('GBP')}
                  className={`px-3 py-1.5 transition-colors ${
                    currency === 'GBP' ? 'bg-orange text-white' : 'text-dark hover:bg-neutral-100'
                  }`}
                >
                  GBP
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`px-3 py-1.5 transition-colors ${
                    currency === 'EUR' ? 'bg-orange text-white' : 'text-dark hover:bg-neutral-100'
                  }`}
                >
                  EUR
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label={nav.wishlist}
              className="text-dark hover:text-orange transition-colors"
            >
              <HeartIcon className="h-6 w-6" />
            </button>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden text-dark hover:text-orange transition-colors"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <Image src="/logooptima.png" alt="Optima Villas" width={110} height={33} />
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="text-dark hover:text-orange transition-colors"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col px-5 py-4 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="text-base font-medium text-dark hover:text-orange transition-colors py-3 border-b border-neutral-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="px-5 py-4 mt-auto border-t border-neutral-200 space-y-3">
              <div className="flex items-center rounded-full border border-neutral-200 text-xs font-semibold overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-4 py-2 transition-colors ${
                    lang === 'en' ? 'bg-orange text-white' : 'text-dark hover:bg-neutral-100'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  className={`px-4 py-2 transition-colors ${
                    lang === 'es' ? 'bg-orange text-white' : 'text-dark hover:bg-neutral-100'
                  }`}
                >
                  ES
                </button>
              </div>

              <div className="flex items-center rounded-full border border-neutral-200 text-xs font-semibold overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => setCurrency('GBP')}
                  className={`px-4 py-2 transition-colors ${
                    currency === 'GBP' ? 'bg-orange text-white' : 'text-dark hover:bg-neutral-100'
                  }`}
                >
                  GBP
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`px-4 py-2 transition-colors ${
                    currency === 'EUR' ? 'bg-orange text-white' : 'text-dark hover:bg-neutral-100'
                  }`}
                >
                  EUR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
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

function MenuIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
