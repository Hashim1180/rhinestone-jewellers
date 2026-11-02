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
  const items = await db.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { customerName, location, quote, rating, image, isPublished } = await req.json()
    if (!customerName?.trim() || !quote?.trim()) {
      return NextResponse.json({ error: 'Name and quote required' }, { status: 400 })
    }
    const created = await db.testimonial.create({
      data: {
        customerName, location, quote,
        rating: rating ?? 5, image,
        isPublished: isPublished !== false,
      },
    })
    return NextResponse.json(created)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
