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

// PATCH /api/admin/scenes/[id] — partial update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const { title, paragraph, mediaType, mediaUrl, animationType, isHero, isPublished, proceduralType, embedCode } = body

    if (isHero === true) {
      await db.scene.updateMany({ where: { isHero: true, id: { not: id } }, data: { isHero: false } })
    }

    const updated = await db.scene.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(paragraph !== undefined && { paragraph }),
        ...(mediaType !== undefined && { mediaType }),
        ...(mediaUrl !== undefined && { mediaUrl }),
        ...(animationType !== undefined && { animationType }),
        ...(isHero !== undefined && { isHero }),
        ...(isPublished !== undefined && { isPublished }),
        ...(proceduralType !== undefined && { proceduralType }),
        ...(embedCode !== undefined && { embedCode }),
      },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    console.error('scene patch error:', e)
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 })
  }
}

// DELETE /api/admin/scenes/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await db.scene.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 })
  }
}
