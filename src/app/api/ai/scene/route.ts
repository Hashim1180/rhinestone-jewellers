import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSceneText } from '@/lib/ai-helpers'

export const dynamic = 'force-dynamic'

// POST /api/ai/scene — body { title, imageUrl? } returns { text }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, imageUrl } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    const text = await generateSceneText({ title, imageUrl })
    return NextResponse.json({ text })
  } catch (e: any) {
    console.error('AI scene text error:', e)
    return NextResponse.json({ error: e?.message ?? 'AI generation failed' }, { status: 500 })
  }
}
