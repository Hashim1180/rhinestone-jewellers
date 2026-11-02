import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateProductDescription } from '@/lib/ai-helpers'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const text = await generateProductDescription(body)
    return NextResponse.json({ text })
  } catch (e: any) {
    console.error('AI product description error:', e)
    return NextResponse.json({ error: e?.message ?? 'AI generation failed' }, { status: 500 })
  }
}
