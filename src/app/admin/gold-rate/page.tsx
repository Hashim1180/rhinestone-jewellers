import { db } from '@/lib/db'
import { GoldRateManager } from '@/components/admin/gold-rate-manager'

export const dynamic = 'force-dynamic'

export default async function AdminGoldRatePage() {
  const rate = await db.goldRate.findUnique({ where: { id: 'global' } })
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Gold Rate</h1>
        <p className="text-sm text-muted-foreground">
          Cached gold rate per troy ounce, refreshed from goldapi.io every 6 hours.
          Override to set a custom rate.
        </p>
      </header>
      <GoldRateManager
        rate={rate ? {
          usdPerOz: rate.priceUsdPerOz.toNumber(),
          eurPerOz: rate.priceEurPerOz.toNumber(),
          gbpPerOz: rate.priceGbpPerOz.toNumber(),
          aedPerOz: rate.priceAedPerOz.toNumber(),
          pkrPerOz: rate.pricePkrPerOz.toNumber(),
          source: rate.source,
          isOverridden: rate.isOverridden,
          fetchedAt: rate.fetchedAt.toISOString(),
        } : null}
      />
    </div>
  )
}
