import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { getGoldRate, computeGoldWeightedEurPrice, formatPrice } from '@/lib/site'
import { ProductCard } from '@/components/site/product-card'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const collections = await db.collection.findMany({ select: { slug: true } })
  return collections.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = await db.collection.findUnique({ where: { slug } })
  if (!c) return {}
  return { title: c.name, description: c.description ?? c.name }
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = await db.collection.findUnique({
    where: { slug },
    include: { products: { where: { isPublished: true }, orderBy: { createdAt: 'desc' } } },
  })
  if (!collection) notFound()

  const goldRate = await getGoldRate()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-gold mb-8 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> All collections
      </Link>

      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-gold mb-4">
          {collection.name}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {collection.description}
        </p>
      </header>

      {collection.products.length === 0 ? (
        <p className="text-muted-foreground italic">No pieces published in this collection yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {collection.products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              goldEurPerOz={goldRate?.eurPerOz ?? 2400}
            />
          ))}
        </div>
      )}
    </div>
  )
}
