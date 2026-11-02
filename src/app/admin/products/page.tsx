import { db } from '@/lib/db'
import { ProductsManager } from '@/components/admin/products-manager'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const [products, collections] = await Promise.all([
    db.product.findMany({ include: { collection: true }, orderBy: { createdAt: 'desc' } }),
    db.collection.findMany({ orderBy: { order: 'asc' } }),
  ])
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Products</h1>
        <p className="text-sm text-muted-foreground">
          Fixed-price or gold-weighted pricing. Gold-weighted prices auto-update from the cached gold rate.
        </p>
      </header>
      <ProductsManager
        products={products.map(p => ({
          id: p.id, name: p.name, slug: p.slug, description: p.description,
          images: p.images, pricingModel: p.pricingModel, priceEur: p.priceEur?.toNumber() ?? null,
          goldWeightG: p.goldWeightG?.toNumber() ?? null, goldPurity: p.goldPurity,
          makingCharge: p.makingCharge?.toNumber() ?? null, stock: p.stock,
          isPublished: p.isPublished, featured: p.featured,
          collectionId: p.collectionId, collectionName: p.collection?.name,
        }))}
        collections={collections.map(c => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
