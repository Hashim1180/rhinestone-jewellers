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
  const items = await db.galleryItem.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { url, caption, type } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })
    const maxOrder = await db.galleryItem.aggregate({ _max: { order: true } })
    const created = await db.galleryItem.create({
      data: {
        url, caption,
        type: type ?? 'PHOTO',
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })
    return NextResponse.json(created)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
