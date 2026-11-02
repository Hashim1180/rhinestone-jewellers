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
  const site = await db.siteSetting.findUnique({ where: { id: 'site' } })
  return NextResponse.json(site)
}

export async function PATCH(req: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const updated = await db.siteSetting.upsert({
      where: { id: 'site' },
      update: {
        ...(body.brandName !== undefined && { brandName: body.brandName }),
        ...(body.tagline !== undefined && { tagline: body.tagline }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.musicUrl !== undefined && { musicUrl: body.musicUrl }),
        ...(body.heroVideoUrl !== undefined && { heroVideoUrl: body.heroVideoUrl }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.whatsapp !== undefined && { whatsapp: body.whatsapp }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.instagram !== undefined && { instagram: body.instagram }),
        ...(body.facebook !== undefined && { facebook: body.facebook }),
        ...(body.tiktok !== undefined && { tiktok: body.tiktok }),
        ...(body.baseCurrency !== undefined && { baseCurrency: body.baseCurrency }),
        ...(body.aiTone !== undefined && { aiTone: body.aiTone }),
      },
      create: {
        id: 'site',
        brandName: body.brandName ?? 'Rhinestone Jewellers',
        tagline: body.tagline ?? "Dublin's House of Rhinestone Jewellery",
        email: body.email ?? 'hello@rhinestonejewellers.ie',
        city: body.city ?? 'Dublin',
        country: body.country ?? 'Ireland',
        baseCurrency: body.baseCurrency ?? 'EUR',
        aiTone: body.aiTone ?? 'accurate, descriptive, factual - never poetic',
      },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
