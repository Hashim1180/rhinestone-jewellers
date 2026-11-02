import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const site = await db.siteSetting.findUnique({ where: { id: 'site' } })
  return NextResponse.json({ musicUrl: site?.musicUrl ?? null })
}
