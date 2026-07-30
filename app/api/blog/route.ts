import { type NextRequest, NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabasePublic
      .from('blog_posts')
      .select('id, slug, title_en, title_es, excerpt_en, excerpt_es, cover_image, category, author_name, published_at')
      .order('published_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    const posts = (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title_en || '',
      title_es: row.title_es || undefined,
      excerpt: row.excerpt_en || '',
      excerpt_es: row.excerpt_es || undefined,
      cover_image: row.cover_image,
      category: row.category,
      author_name: row.author_name,
      published_at: row.published_at,
    }))

    return NextResponse.json({ posts, total: posts.length })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Supabase blog fetch error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts', details: errorMessage },
      { status: 500 },
    )
  }
}
