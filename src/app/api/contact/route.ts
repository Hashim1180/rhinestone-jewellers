import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { routeInquiryWithAI, draftReplyWithAI } from '@/lib/ai-helpers'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, message } = body
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // AI routing (wholesale / retail / press / appointment / general)
    let category = 'GENERAL'
    let aiRouting: string | null = null
    try {
      const routing = await routeInquiryWithAI({ name, email, message })
      category = routing.category
      aiRouting = routing.reasoning
    } catch (e) {
      console.error('AI routing failed:', e)
    }

    // AI draft reply (saved, admin approves/sends)
    let aiReplyDraft: string | null = null
    try {
      aiReplyDraft = await draftReplyWithAI({ name, message, category })
    } catch (e) {
      console.error('AI reply draft failed:', e)
    }

    const inquiry = await db.inquiry.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        message,
        category: category as any,
        aiRouting,
        aiReplyDraft,
      },
    })

    return NextResponse.json({ ok: true, id: inquiry.id })
  } catch (e) {
    console.error('contact form error:', e)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
