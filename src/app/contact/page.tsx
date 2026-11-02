import { ContactForm } from '@/components/site/contact-form'
import { db } from '@/lib/db'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Contact' }

export default async function ContactPage() {
  const site = await db.siteSetting.findUnique({ where: { id: 'site' } })

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
      <header className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="gold-hairline" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Contact</span>
          <div className="gold-hairline" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-gold mb-3">
          Get in touch
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Appointments, custom orders, wholesale and press enquiries welcome.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Contact info */}
        <div className="space-y-6">
          {site?.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                <a href={`mailto:${site.email}`} className="text-gold hover:underline">{site.email}</a>
              </div>
            </div>
          )}
          {site?.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Phone</p>
                <p className="font-mono">{site.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gold mt-0.5" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Address</p>
              <p>{site?.address ?? 'Address to be confirmed'} - {site?.city ?? 'Dublin'}, {site?.country ?? 'Ireland'}</p>
            </div>
          </div>
          {site?.whatsapp && (
            <a
              href={`https://wa.me/${site.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gold/10 border border-gold/40 text-gold text-xs uppercase tracking-widest hover:bg-gold/20 transition-colors rounded-sm"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          )}

          {/* Map of Dublin */}
          <div className="mt-6 rounded-md overflow-hidden border border-border/40">
            <iframe
              title="Map of Dublin"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d190726.43362896786!2d-6.3899107!3d53.3244431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48670e80a5cc0e3b%3A0x3a4d4b4f3c5d6a8b!2sDublin%2C%20Ireland!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Form */}
        <ContactForm />
      </div>
    </div>
  )
}
