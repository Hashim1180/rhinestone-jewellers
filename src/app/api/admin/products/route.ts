import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function auth() {
  const session = await getServerSession(authOptions)
  return session
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const products = await db.product.findMany({ include: { collection: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { name, slug, description, images, pricingModel, priceEur, goldWeightG, goldPurity, makingCharge, stock, collectionId, featured } = body
    if (!name?.trim() || !slug?.trim() || !collectionId) {
      return NextResponse.json({ error: 'Name, slug, and collection required' }, { status: 400 })
    }
    const created = await db.product.create({
      data: {
        name, slug, description,
        images: images ?? [],
        pricingModel: pricingModel ?? 'FIXED',
        priceEur: priceEur ?? null,
        goldWeightG: goldWeightG ?? null,
        goldPurity: goldPurity ?? null,
        makingCharge: makingCharge ?? null,
        stock: stock ?? 0,
        collectionId,
        featured: !!featured,
      },
    })
    return NextResponse.json(created)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
