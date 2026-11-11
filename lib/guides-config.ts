// Guides that are written but not ready to show visitors yet. Hidden from the
// guides index, the "related guides" links and the sitemap, and their URL
// returns a 404. Nothing is deleted: the content stays in Supabase
// (guides_content), so bringing a guide back is just removing its slug here.
//
// playa-blanca and climate are single short paragraphs today and their
// subtitles promise content (monthly temperatures, things to do) that does
// not exist yet.
export const HIDDEN_GUIDE_SLUGS: readonly string[] = ['playa-blanca', 'climate']

export function isGuideHidden(slug: string): boolean {
  return HIDDEN_GUIDE_SLUGS.includes(slug)
}

// Order the visible guides are listed in (related-guides links).
export const GUIDE_SLUG_ORDER = ['essentials', 'ferries', 'beaches', 'playa-blanca', 'climate'] as const
export type GuideSlug = (typeof GUIDE_SLUG_ORDER)[number]

export const VISIBLE_GUIDE_SLUGS: GuideSlug[] = GUIDE_SLUG_ORDER.filter((slug) => !isGuideHidden(slug))
