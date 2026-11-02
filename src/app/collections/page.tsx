import { db } from '@/lib/db'
import { CollectionsGrid } from '@/components/site/collections-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Collections' }

export default async function CollectionsPage() {
  const collections = await db.collection.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
    include: { products: { where: { isPublished: true }, select: { id: true } } },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      <header className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="gold-hairline" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">All Collections</span>
          <div className="gold-hairline" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-gold mb-4">
          Collections
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Each collection is curated around a specific style. Click through to view
          individual pieces and inquire.
        </p>
      </header>

      <CollectionsGrid collections={collections} />
    </div>
  )
}
