import Link from 'next/link'
import { Diamond } from 'lucide-react'
import { getSiteSettings } from '@/lib/site'

export async function SiteFooter() {
  const site = await getSiteSettings()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/40 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Diamond className="h-4 w-4 text-gold" />
            <span className="font-display text-lg tracking-[0.18em] text-gold">
              RHINESTONE
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {site?.city}, {site?.country}.<br/>
            {site?.description?.slice(0, 110)}…
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Explore</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
            <li><Link href="/collections" className="hover:text-gold transition-colors">Collections</Link></li>
            <li><Link href="/gallery" className="hover:text-gold transition-colors">Gallery</Link></li>
            <li><Link href="/about" className="hover:text-gold transition-colors">About</Link></li>
            <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Contact</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {site?.email && <li><a href={`mailto:${site.email}`} className="hover:text-gold">{site.email}</a></li>}
            {site?.phone && <li className="font-mono">{site.phone}</li>}
            {site?.address && <li>{site.address}, {site?.city}</li>}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Follow</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {site?.instagram && <li><a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Instagram</a></li>}
            {site?.facebook && <li><a href={site.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Facebook</a></li>}
            {site?.tiktok && <li><a href={site.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">TikTok</a></li>}
            {!site?.instagram && <li className="italic">Add socials in admin</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40 py-4 text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          (c) {year} {site?.brandName ?? 'Rhinestone Jewellers'} - Dublin, Ireland
        </p>
      </div>
    </footer>
  );
}
