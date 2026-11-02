import { db } from '@/lib/db'
import { TestimonialsManager } from '@/components/admin/testimonials-manager'

export const dynamic = 'force-dynamic'

export default async function AdminTestimonialsPage() {
  const items = await db.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Testimonials</h1>
        <p className="text-sm text-muted-foreground">Customer reviews shown on the gallery page.</p>
      </header>
      <TestimonialsManager items={items.map(t => ({
        id: t.id, customerName: t.customerName, location: t.location,
        quote: t.quote, rating: t.rating, image: t.image, isPublished: t.isPublished,
      }))} />
    </div>
  )
}
