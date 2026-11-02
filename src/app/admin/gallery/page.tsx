import { db } from '@/lib/db'
import { GalleryManager } from '@/components/admin/gallery-manager'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const items = await db.galleryItem.findMany({ orderBy: { order: 'asc' } })
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Gallery</h1>
        <p className="text-sm text-muted-foreground">Customer photos. Each item appears in the public gallery page.</p>
      </header>
      <GalleryManager items={items.map(g => ({ id: g.id, url: g.url, caption: g.caption, type: g.type, isPublished: g.isPublished }))} />
    </div>
  )
}
