import { db } from '@/lib/db'
import { GalleryGrid } from '@/components/site/gallery-grid'
import { Marquee, FadeInOnScroll } from '@/components/site/animations'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Gallery' }

export default async function GalleryPage() {
  const [gallery, testimonials] = await Promise.all([
    db.galleryItem.findMany({
      where: { isPublished: true, type: 'PHOTO' },
      orderBy: { order: 'asc' },
    }),
    db.testimonial.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      <header className="mb-12 text-center">
        <FadeInOnScroll>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="gold-hairline" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Gallery</span>
            <div className="gold-hairline" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-gold mb-4">
            Customer Stories
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A selection of pieces and customer experiences.
          </p>
        </FadeInOnScroll>
      </header>

      {/* Marquee strip */}
      <div className="border-y border-gold/20 bg-background/40 py-3 overflow-hidden mb-12">
        <Marquee
          items={[
            'Real customers',
            'Real pieces',
            'Real stories',
            'Hand-set in Dublin',
            'Rhinestone Jewellers',
            'By appointment',
          ]}
          speed={32}
        />
      </div>

      <GalleryGrid items={gallery} />

      {testimonials.length > 0 && (
        <section className="mt-20">
          <FadeInOnScroll>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-4xl text-gold mb-2">Testimonials</h2>
              <p className="text-muted-foreground text-sm">What our customers say.</p>
            </div>
          </FadeInOnScroll>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeInOnScroll key={t.id} delay={i * 0.1} y={20}>
                <article className="bg-card border border-border/40 rounded-md p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < t.rating ? 'text-gold' : 'text-muted-foreground/30'}>
                        {'\u2605'}
                      </span>
                    ))}
                  </div>
                  <blockquote className="text-foreground/80 italic mb-4 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <footer className="text-xs">
                    <p className="text-gold tracking-wider">{t.customerName}</p>
                    {t.location && <p className="text-muted-foreground">{t.location}</p>}
                  </footer>
                </article>
              </FadeInOnScroll>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
