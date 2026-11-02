import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rate = await db.goldRate.findUnique({ where: { id: 'global' } })
  if (!rate) {
    return NextResponse.json(
      {
        eurPerOz: 2400,
        usdPerOz: 2600,
        gbpPerOz: 2050,
        aedPerOz: 9550,
        pkrPerOz: 720000,
        isOverridden: false,
        fetchedAt: new Date().toISOString(),
        source: 'fallback',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
  return NextResponse.json(
    {
      eurPerOz: rate.priceEurPerOz.toNumber(),
      usdPerOz: rate.priceUsdPerOz.toNumber(),
      gbpPerOz: rate.priceGbpPerOz.toNumber(),
      aedPerOz: rate.priceAedPerOz.toNumber(),
      pkrPerOz: rate.pricePkrPerOz.toNumber(),
      isOverridden: rate.isOverridden,
      fetchedAt: rate.fetchedAt.toISOString(),
      source: rate.source,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
