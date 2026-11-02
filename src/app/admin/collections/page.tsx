import { db } from '@/lib/db'
import { CollectionsManager } from '@/components/admin/collections-manager'

export const dynamic = 'force-dynamic'

export default async function AdminCollectionsPage() {
  const collections = await db.collection.findMany({
    orderBy: { order: 'asc' },
    include: { products: true },
  })
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Collections</h1>
        <p className="text-sm text-muted-foreground">
          Group products into collections. Each collection has its own page.
        </p>
      </header>
      <CollectionsManager
        collections={collections.map(c => ({
          id: c.id, name: c.name, slug: c.slug, description: c.description,
          coverImage: c.coverImage, isPublished: c.isPublished, order: c.order,
          productsCount: c.products.length,
        }))}
      />
    </div>
  )
}
