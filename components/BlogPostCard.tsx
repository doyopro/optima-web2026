import Image from 'next/image'
import Link from 'next/link'
import { type Language, translations, getBlogCategoryLabel } from '@/lib/i18n'
import { type BlogPost } from '@/lib/types'
import { resolveCoverImage } from '@/lib/blog'

interface Props {
  post: BlogPost
  lang: Language
}

export default function BlogPostCard({ post, lang }: Props) {
  const t = translations[lang].blog
  const title = (lang === 'es' && post.title_es) || post.title
  const excerpt = (lang === 'es' && post.excerpt_es) || post.excerpt
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null
  const coverImage = resolveCoverImage(post.cover_image)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {post.category && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange shadow">
            {getBlogCategoryLabel(post.category, lang)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {publishedDate && (
          <p className="text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1">
            {publishedDate}
          </p>
        )}

        <h3 className="text-lg font-bold text-dark mb-2 leading-snug group-hover:text-orange transition-colors">
          {title}
        </h3>

        {excerpt && (
          <p className="text-sm text-dark/60 leading-relaxed mb-3 line-clamp-3">{excerpt}</p>
        )}

        <span className="text-sm font-semibold text-orange group-hover:underline">
          {t.readMore} →
        </span>
      </div>
    </Link>
  )
}
