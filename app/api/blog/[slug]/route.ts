import { type NextRequest, NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    const { data, error } = await supabasePublic
      .from('blog_posts')
      .select(
        'id, slug, title_en, title_es, excerpt_en, excerpt_es, content_en, content_es, cover_image, category, author_name, published_at',
      )
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = {
      id: data.id,
      slug: data.slug,
      title: data.title_en || '',
      title_es: data.title_es || undefined,
      excerpt: data.excerpt_en || '',
      excerpt_es: data.excerpt_es || undefined,
      content: data.content_en || '',
      content_es: data.content_es || undefined,
      cover_image: data.cover_image,
      category: data.category,
      author_name: data.author_name,
      published_at: data.published_at,
    }

    return NextResponse.json({ post })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[GET /api/blog/[slug]]', errorMessage)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
