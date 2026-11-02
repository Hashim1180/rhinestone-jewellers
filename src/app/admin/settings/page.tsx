import { db } from '@/lib/db'
import { SettingsManager } from '@/components/admin/settings-manager'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const site = await db.siteSetting.findUnique({ where: { id: 'site' } })
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Brand, contact, music, social, AI tone. All editable here.</p>
      </header>
      <SettingsManager
        site={site ? {
          brandName: site.brandName, tagline: site.tagline, description: site.description,
          musicUrl: site.musicUrl, heroVideoUrl: site.heroVideoUrl, logoUrl: site.logoUrl,
          email: site.email, phone: site.phone, whatsapp: site.whatsapp,
          address: site.address, city: site.city, country: site.country,
          instagram: site.instagram, facebook: site.facebook, tiktok: site.tiktok,
          baseCurrency: site.baseCurrency, aiTone: site.aiTone,
        } : null}
      />
    </div>
  )
}
