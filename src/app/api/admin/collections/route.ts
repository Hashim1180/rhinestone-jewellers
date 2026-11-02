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
  const collections = await db.collection.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json(collections)
}

export async function POST(req: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name, slug, description, coverImage, isPublished } = await req.json()
    if (!name?.trim() || !slug?.trim()) return NextResponse.json({ error: 'Name and slug required' }, { status: 400 })
    const maxOrder = await db.collection.aggregate({ _max: { order: true } })
    const created = await db.collection.create({
      data: {
        name, slug, description, coverImage,
        isPublished: isPublished !== false,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })
    return NextResponse.json(created)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
