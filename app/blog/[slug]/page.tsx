import { type Metadata } from 'next'
import { supabasePublic } from '@/lib/supabase'
import BlogPostClient from './BlogPostClient'

interface Props {
  params: Promise<{ slug: string }>
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const { data } = await supabasePublic
    .from('blog_posts')
    .select('title_en, excerpt_en')
    .eq('slug', slug)
    .maybeSingle()

  if (!data) {
    return { title: 'Post not found | Optima Villas' }
  }

  return {
    title: `${data.title_en} | Optima Villas`,
    description: data.excerpt_en || undefined,
    alternates: { canonical: `${siteUrl()}/blog/${slug}` },
  }
}

export default async function BlogPostPage({ params }: Props) {
  return <BlogPostClient params={params} />
}
