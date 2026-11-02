import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return session
}

// GET /api/admin/scenes — list all (admin)
export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const scenes = await db.scene.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(scenes)
}

// POST /api/admin/scenes — create
export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { title, paragraph, mediaType, mediaUrl, animationType, isHero, isPublished, proceduralType, embedCode } = body
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const maxOrder = await db.scene.aggregate({ _max: { order: true } })
    const order = (maxOrder._max.order ?? -1) + 1

    // If this is the new hero, unset all other heros
    if (isHero) {
      await db.scene.updateMany({ where: { isHero: true }, data: { isHero: false } })
    }

    const created = await db.scene.create({
      data: {
        title, paragraph: paragraph ?? '', mediaType, mediaUrl, animationType,
        isHero: !!isHero, isPublished: isPublished !== false,
        proceduralType, embedCode, order,
      },
    })
    return NextResponse.json(created)
  } catch (e: any) {
    console.error('scene create error:', e)
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 })
  }
}
