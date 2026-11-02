import { db } from '@/lib/db'
import { Scrollytelling } from '@/components/site/scrollytelling'
import { getSiteSettings } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [scenes, site] = await Promise.all([
    db.scene.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
    }),
    getSiteSettings(),
  ])

  return (
    <Scrollytelling
      scenes={scenes.map(s => ({
        id: s.id,
        order: s.order,
        title: s.title,
        paragraph: s.paragraph,
        mediaType: s.mediaType,
        mediaUrl: s.mediaUrl,
        animationType: s.animationType,
        isHero: s.isHero,
        proceduralType: s.proceduralType,
        embedCode: s.embedCode,
      }))}
      brandName={site?.brandName ?? 'Rhinestone Jewellers'}
      tagline={site?.tagline ?? "Dublin's House of Rhinestone Jewellery"}
    />
  )
}
