'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { type BlogPost } from '@/lib/types'
import BlogPostCard from '@/components/BlogPostCard'
import BlogPostSkeleton from '@/components/BlogPostSkeleton'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function BlogPage() {
  const { lang } = useLanguage()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.json()
      })
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const t = translations[lang].blog

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-3 tracking-tight">{t.title}</h1>
            <p className="text-dark/60 text-lg">{t.subtitle}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <BlogPostSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="text-2xl mb-3">📰</p>
              <p className="text-dark font-semibold">{t.error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-2xl mb-3">📰</p>
              <p className="text-dark/60">{t.noPosts}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}
