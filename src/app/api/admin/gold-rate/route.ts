import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function auth() {
  const session = await getServerSession(authOptions)
  return session
}

// GET /api/admin/gold-rate — current cached rate
export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rate = await db.goldRate.findUnique({ where: { id: 'global' } })
  return NextResponse.json(rate)
}

// POST /api/admin/gold-rate — refresh from goldapi.io, or override
// Body: { action: 'refresh' | 'override', usd?, eur?, gbp?, aed?, pkr? }
export async function POST(req: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const action = body.action ?? 'refresh'

    if (action === 'refresh') {
      const apiKey = process.env.GOLDAPI_KEY ?? 'goldapi-demo'
      // Try goldapi.io
      try {
        const res = await fetch('https://www.goldapi.io/api/XAU/USD', {
          headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          const data = await res.json()
          const usdPerOz = data.price ?? 0
          // Get FX rates to convert
          const fxRes = await fetch('https://api.exchangerate.host/latest?base=USD')
          const fx = await fxRes.json()
          const rates = fx.rates ?? {}
          const eurPerOz = usdPerOz * (rates.EUR ?? 0.92)
          const gbpPerOz = usdPerOz * (rates.GBP ?? 0.79)
          const aedPerOz = usdPerOz * (rates.AED ?? 3.67)
          const pkrPerOz = usdPerOz * (rates.PKR ?? 278)

          const updated = await db.goldRate.upsert({
            where: { id: 'global' },
            update: {
              priceUsdPerOz: usdPerOz, priceEurPerOz: eurPerOz,
              priceGbpPerOz: gbpPerOz, priceAedPerOz: aedPerOz,
              pricePkrPerOz: pkrPerOz, source: 'goldapi.io',
              isOverridden: false, fetchedAt: new Date(), updatedAt: new Date(),
            },
            create: {
              id: 'global', priceUsdPerOz: usdPerOz, priceEurPerOz: eurPerOz,
              priceGbpPerOz: gbpPerOz, priceAedPerOz: aedPerOz,
              pricePkrPerOz: pkrPerOz, source: 'goldapi.io',
            },
          })
          return NextResponse.json({ ok: true, rate: updated })
        }
      } catch (e) {
        console.error('goldapi fetch failed:', e)
      }
      return NextResponse.json({ error: 'Refresh failed (free tier limit or network)' }, { status: 502 })
    }

    if (action === 'override') {
      const current = await db.goldRate.findUnique({ where: { id: 'global' } })
      const updated = await db.goldRate.upsert({
        where: { id: 'global' },
        update: {
          priceUsdPerOz: body.usd ?? current?.priceUsdPerOz ?? 2600,
          priceEurPerOz: body.eur ?? current?.priceEurPerOz ?? 2400,
          priceGbpPerOz: body.gbp ?? current?.priceGbpPerOz ?? 2050,
          priceAedPerOz: body.aed ?? current?.priceAedPerOz ?? 9550,
          pricePkrPerOz: body.pkr ?? current?.pricePkrPerOz ?? 720000,
          source: 'admin-override',
          isOverridden: true, fetchedAt: new Date(), updatedAt: new Date(),
        },
        create: {
          id: 'global',
          priceUsdPerOz: body.usd ?? 2600, priceEurPerOz: body.eur ?? 2400,
          priceGbpPerOz: body.gbp ?? 2050, priceAedPerOz: body.aed ?? 9550,
          pricePkrPerOz: body.pkr ?? 720000, source: 'admin-override', isOverridden: true,
        },
      })
      return NextResponse.json({ ok: true, rate: updated })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
