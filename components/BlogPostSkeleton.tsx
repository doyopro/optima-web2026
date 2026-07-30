export default function BlogPostSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-neutral-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 bg-neutral-200 rounded" />
        <div className="h-5 w-48 bg-neutral-200 rounded" />
        <div className="h-3 w-full bg-neutral-200 rounded" />
        <div className="h-3 w-2/3 bg-neutral-200 rounded" />
      </div>
    </div>
  )
}
