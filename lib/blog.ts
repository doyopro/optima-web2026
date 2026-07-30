// Some blog_posts.cover_image values reference a "/lanzarote/lanzaroteN.jpg"
// path, but the actual Lanzarote photo assets live directly at
// "/lanzaroteN.jpg" in public/ (no subfolder) — normalize so next/image
// resolves to a real local file instead of 404ing.
export function resolveCoverImage(coverImage: string | null): string | null {
  if (!coverImage) return coverImage
  if (coverImage.startsWith('/lanzarote/')) {
    return coverImage.replace('/lanzarote/', '/')
  }
  return coverImage
}
