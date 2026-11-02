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
  const items = await db.inquiry.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Used for marking read/replied, setting admin reply
  // PATCH /api/admin/inquiries?id=xxx { isRead, isReplied, adminReply }
  const body = await req.json()
  const { id, isRead, isReplied, adminReply, category } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const updated = await db.inquiry.update({
    where: { id },
    data: {
      ...(isRead !== undefined && { isRead }),
      ...(isReplied !== undefined && { isReplied, repliedAt: new Date() }),
      ...(adminReply !== undefined && { adminReply }),
      ...(category !== undefined && { category }),
    },
  })
  return NextResponse.json(updated)
}
