'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { type BlogPost } from '@/lib/types'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface Props {
  params: Promise<{ slug: string }>
}

export default function BlogPostPage({ params }: Props) {
  const { slug } = use(params)
  const { lang } = useLanguage()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((d) => setPost(d.post ?? null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  const t = translations[lang]

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse text-dark/40 text-lg">{t.blog.loading}</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">📰</p>
        <p className="font-semibold text-dark">{t.blog.notFound}</p>
        <Link href="/blog" className="text-orange underline text-sm">{t.blog.backToBlog}</Link>
      </div>
    )
  }

  const title = (lang === 'es' && post.title_es) || post.title
  const content = (lang === 'es' && post.content_es) || post.content || ''
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim())
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-cream">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-sm text-dark/50">
            <Link href="/" className="hover:text-orange">{t.nav.home}</Link>
            <span>›</span>
            <Link href="/blog" className="hover:text-orange">{t.blog.title}</Link>
            <span>›</span>
            <span className="text-dark truncate">{title}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
          {post.category && (
            <p className="text-xs font-semibold uppercase tracking-wide text-orange mb-3">
              {post.category}
            </p>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4 leading-tight">{title}</h1>

          <div className="flex items-center gap-3 text-sm text-dark/50 mb-6">
            {post.author_name && <span>{t.blog.by} {post.author_name}</span>}
            {post.author_name && publishedDate && <span>·</span>}
            {publishedDate && <span>{t.blog.publishedOn} {publishedDate}</span>}
          </div>

          {post.cover_image && (
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md mb-8">
              <Image
                src={post.cover_image}
                alt={title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-dark/70 leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/blog" className="text-sm text-dark/50 hover:text-orange transition-colors">
              ← {t.blog.backToBlog}
            </Link>
          </div>
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
