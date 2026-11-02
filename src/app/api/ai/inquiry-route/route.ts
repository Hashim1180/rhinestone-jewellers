import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { routeInquiryWithAI, draftReplyWithAI } from '@/lib/ai-helpers'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const inquiry = await db.inquiry.findUnique({ where: { id } })
    if (!inquiry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [routing, reply] = await Promise.all([
      routeInquiryWithAI({ name: inquiry.name, email: inquiry.email, message: inquiry.message }),
      draftReplyWithAI({ name: inquiry.name, message: inquiry.message, category: inquiry.category }),
    ])

    const updated = await db.inquiry.update({
      where: { id },
      data: {
        category: routing.category as any,
        aiRouting: routing.reasoning,
        aiReplyDraft: reply,
      },
    })

    return NextResponse.json({ inquiry: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
