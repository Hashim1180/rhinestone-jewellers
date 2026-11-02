'use client'

import { useCurrency } from '@/components/site/currency-provider'
import { computeGoldWeightedEurPrice, formatPrice, OZ_TO_GRAM, purityFactor } from '@/lib/site'
import { TiltCard } from '@/components/site/animations'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  images: string[]
  pricingModel: string
  priceEur: number | null
  goldWeightG: number | null
  goldPurity: number | null
  makingCharge: number | null
  stock: number
}

export function ProductCard({
  product,
  goldEurPerOz,
}: {
  product: Product
  goldEurPerOz: number
}) {
  const { currency } = useCurrency()
  const [added, setAdded] = useState(false)

  // Compute EUR price (base currency)
  const eurPrice =
    product.pricingModel === 'GOLD_WEIGHTED'
      ? computeGoldWeightedEurPrice(
          Number(product.goldWeightG ?? 0),
          Number(product.goldPurity ?? 22),
          Number(product.makingCharge ?? 0),
          goldEurPerOz
        )
      : Number(product.priceEur ?? 0)

  // Convert via simple ratio. Real conversion runs server-side in API.
  // For now, use approximation: EUR → USD ≈ 1.08, GBP ≈ 0.86, AED ≈ 4.0, PKR ≈ 300
  const FX: Record<string, number> = {
    EUR: 1, USD: 1.08, GBP: 0.86, AED: 4.0, PKR: 300,
  }
  const fxRate = FX[currency] ?? 1
  const displayPrice = eurPrice * fxRate

  const addToInquiry = () => {
    const items = JSON.parse(localStorage.getItem('rh-inquiry') ?? '[]')
    items.push({ id: product.id, name: product.name, slug: product.slug })
    localStorage.setItem('rh-inquiry', JSON.stringify(items))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <TiltCard maxTilt={5} className="h-full">
      <article className="group bg-card border border-border/40 rounded-md overflow-hidden hover:border-gold/40 transition-all h-full" style={{ transformStyle: 'preserve-3d' }}>
        <Link href={`/collections/${product.slug}`} className="block aspect-[4/5] overflow-hidden" style={{ transform: 'translateZ(30px)' }}>
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </Link>
        <div className="p-5" style={{ transform: 'translateZ(20px)' }}>
          <h3 className="font-display text-xl text-foreground mb-1 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-medium text-gold">
                {formatPrice(displayPrice, currency)}
              </p>
              {product.pricingModel === 'GOLD_WEIGHTED' && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {product.goldWeightG}g {product.goldPurity}K · making {product.makingCharge}
                </p>
              )}
            </div>
            <button
              onClick={addToInquiry}
              className="text-[10px] uppercase tracking-widest px-3 py-2 border border-gold/40 text-gold hover:bg-gold/10 transition-colors rounded-sm"
            >
              {added ? 'Added' : 'Inquire'}
            </button>
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[10px] text-amber-500/70 mt-2">Only {product.stock} left</p>
          )}
          {product.stock === 0 && (
            <p className="text-[10px] text-muted-foreground mt-2">Out of stock</p>
          )}
        </div>
      </article>
    </TiltCard>
  )
}
