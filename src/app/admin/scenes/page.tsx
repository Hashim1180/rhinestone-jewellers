import { db } from '@/lib/db'
import { ScenesManager } from '@/components/admin/scenes-manager'

export const dynamic = 'force-dynamic'

export default async function AdminScenesPage() {
  const scenes = await db.scene.findMany({ orderBy: { order: 'asc' } })
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Scrollytelling Scenes</h1>
        <p className="text-sm text-muted-foreground">
          Drag to reorder. Each scene becomes one screen of the home scrollytelling experience.
          Click any scene to edit, or use the AI button to auto-write the paragraph from the photo.
        </p>
      </header>
      <ScenesManager
        scenes={scenes.map(s => ({
          id: s.id,
          order: s.order,
          title: s.title,
          paragraph: s.paragraph,
          mediaType: s.mediaType,
          mediaUrl: s.mediaUrl,
          animationType: s.animationType,
          isHero: s.isHero,
          isPublished: s.isPublished,
          proceduralType: s.proceduralType,
          embedCode: s.embedCode,
        }))}
      />
    </div>
  )
}
