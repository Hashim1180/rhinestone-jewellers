import { db } from '@/lib/db'
import { FadeInOnScroll, ScaleInOnScroll } from '@/components/site/animations'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'About' }

export default async function AboutPage() {
  const [site, page] = await Promise.all([
    db.siteSetting.findUnique({ where: { id: 'site' } }),
    db.page.findUnique({ where: { slug: 'about' } }),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeInOnScroll>
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="gold-hairline" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">About</span>
            <div className="gold-hairline" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-gold mb-3">
            {page?.title ?? `About ${site?.brandName ?? 'Rhinestone Jewellers'}`}
          </h1>
          {site?.city && site?.country && (
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {site.city}, {site.country}
            </p>
          )}
        </header>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.15}>
        <article className="prose prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
            {page?.content ?? site?.description ?? 'About content goes here.'}
          </p>
        </article>
      </FadeInOnScroll>

      <ScaleInOnScroll delay={0.2}>
        <section className="mt-12 p-6 bg-card border border-gold/20 rounded-md">
          <h2 className="font-display text-xl text-gold mb-3">Pricing Transparency</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            For gold-weighted pieces, the price is calculated as:
          </p>
          <div className="font-mono text-xs text-gold bg-background/50 p-3 rounded-md border border-border/40">
            price = (weight in g &times; live gold rate / 31.1035 &times; purity factor) + making charge
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            The gold rate is fetched from goldapi.io every 6 hours and shown in the top ticker.
            Admin can override the rate at any time. Fixed-price pieces are priced directly in EUR
            and converted for display only.
          </p>
        </section>
      </ScaleInOnScroll>
    </div>
  )
}
