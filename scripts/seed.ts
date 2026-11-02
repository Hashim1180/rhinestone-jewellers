/**
 * Rhinestone Jewellers — Database seed
 * Seeds admin user, 12 scenes, collections, products, gallery, testimonials,
 * site settings, gold rate cache.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('Seeding Rhinestone Jewellers...')

  // ── Admin user ──────────────────────────────────────────────────────
  const hashed = await bcrypt.hash('Rhinestone2026!', 12)
  const admin = await db.user.upsert({
    where: { email: 'admin@rhinestonejewellers.ie' },
    update: {},
    create: {
      email: 'admin@rhinestonejewellers.ie',
      name: 'Rhinestone Admin',
      password: hashed,
      role: 'ADMIN',
    },
  })
  console.log(`Admin: ${admin.email}`)

  // ── Site settings ───────────────────────────────────────────────────
  await db.siteSetting.upsert({
    where: { id: 'site' },
    update: {},
    create: {
      id: 'site',
      brandName: 'Rhinestone Jewellers',
      tagline: 'Dublin\u2019s House of Rhinestone Jewellery',
      description:
        'Rhinestone Jewellers is a Dublin-based jewellery house specialising in rhinestone and crystal-embellished pieces. Each piece is hand-set and quality-checked at our Dublin workshop.',
      musicUrl: '/media/Assassin_s Creed 2 OST _ Jesper Kyd - Ezio_s Family (Track 03)(MP3_320K).mp3',
      heroVideoUrl: '/media/Jewellery shop cinematic video __ New commercial ad video 2023(1080P_60FPS).mp4',
      email: 'hello@rhinestonejewellers.ie',
      phone: '+353 1 XXX XXXX',
      whatsapp: '+353 1 XXX XXXX',
      address: 'Grafton Street (placeholder)',
      city: 'Dublin',
      country: 'Ireland',
      baseCurrency: 'EUR',
      aiTone: 'accurate, descriptive, factual \u2014 never poetic',
    },
  })
  console.log('Site settings seeded')

  // ── Gold rate cache (initial) ───────────────────────────────────────
  await db.goldRate.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      priceUsdPerOz: 2632.4,
      priceEurPerOz: 2418.0,
      priceGbpPerOz: 2071.5,
      priceAedPerOz: 9664.5,
      pricePkrPerOz: 732458.0,
      source: 'initial-seed',
      isOverridden: false,
    },
  })
  console.log('Gold rate seeded')

  // ── 12 Scenes (the scrollytelling heart) ────────────────────────────
  // Delete existing then recreate in order
  await db.scene.deleteMany({})

  const scenes = [
    {
      order: 0,
      title: 'Rhinestone Jewellers',
      paragraph:
        'A Dublin-based jewellery house specialising in rhinestone and crystal-embellished pieces. Every piece is hand-set and quality-checked in our Dublin workshop. Scroll to begin.',
      mediaType: 'VIDEO',
      mediaUrl: '/media/Jewellery shop cinematic video __ New commercial ad video 2023(1080P_60FPS).mp4',
      animationType: 'FADE',
      isHero: true,
      isPublished: true,
    },
    {
      order: 1,
      title: 'Hand-Set Crystals',
      paragraph:
        'Silver-tone metal earrings set with clear rhinestones, terminating in green gemstone drops. Pieces are assembled on a black display mount for inspection.',
      mediaType: 'PHOTO',
      mediaUrl: '/media/IMG_9b569d6b-11db-42f7-8319-2316087233e5.jpg',
      animationType: 'REVEAL',
    },
    {
      order: 2,
      title: 'Gold Heritage Series',
      paragraph:
        'Gold necklace set displayed on a matte green bust. The necklace is composed of floral gold links with a central leaf-form pendant and a teardrop stone. Matching hollow gold earrings with pearl and green stone drops.',
      mediaType: 'PHOTO',
      mediaUrl: '/media/IMG_5fec9ecc-3276-40ad-bbd5-6457fa960fff.jpg',
      animationType: 'SLIDE_LEFT',
    },
    {
      order: 3,
      title: 'Filigree Engagement Ring',
      paragraph:
        'Gold engagement ring with a single round-cut centre stone held by multiple prongs. The shoulders are set with smaller side stones in a stepped arrangement. The shank carries openwork filigree and granulated decoration.',
      mediaType: 'PHOTO',
      mediaUrl: '/media/exquisite-diamond-engagement-ring-gold-filigree-sparkling-gemstones_632498-24492.jpg',
      animationType: 'ZOOM',
    },
    {
      order: 4,
      title: 'Examine from Every Angle',
      paragraph:
        'Interactive 3D model. Drag to rotate, scroll to zoom. The piece is shown at 1:1 scale reference.',
      mediaType: 'THREE_GLB',
      mediaUrl: '/media/3d/IndianJewels_1.glb',
      animationType: 'ROTATE_3D',
    },
    {
      order: 5,
      title: 'Bangle Collection',
      paragraph:
        'Gold bangles with hand-engraved floral decoration and small set stones. Displayed on a tiered dark stand; foreground bangles in sharp focus, background rows softened for depth.',
      mediaType: 'PHOTO',
      mediaUrl: '/media/IMG_6d2fa7ff-94df-4d1b-ac32-69dc1e1e406b.jpg',
      animationType: 'PARALLAX',
    },
    {
      order: 6,
      title: 'Cushion-Cut Solitaire',
      paragraph:
        'Gold ring with a cushion-cut centre stone in a halo of small diamonds. Band and setting finished in polished gold. Bokeh of additional rings visible in the background.',
      mediaType: 'PHOTO',
      mediaUrl: '/media/IMG_ffd06c17-be8c-4c3d-83de-327b319f6d15.jpg',
      animationType: 'ZOOM',
    },
    {
      order: 7,
      title: 'Procedural Diamond Ring',
      paragraph:
        'A 3D-rendered solitaire ring, generated in-browser with Three.js. Drag to inspect. The geometry shows a round brilliant stone in a four-prong setting on a half-round band.',
      mediaType: 'THREE_PROCEDURAL',
      proceduralType: 'solitaire-ring',
      animationType: 'ROTATE_3D',
    },
    {
      order: 8,
      title: 'Bridal Maang Tikka Set',
      paragraph:
        'Gold traditional Indian bridal set: a maang tikka with pendant drops, a multi-layer floral bib necklace, and matching chandelier earrings with bead fringe. Pieces laid on green silk for photography.',
      mediaType: 'PHOTO',
      mediaUrl: '/media/360_F_695461716_tnpwMR7YYXFNFVI5rqqI0ldpVUM0rsKD.jpg',
      animationType: 'REVEAL',
    },
    {
      order: 9,
      title: 'Procedural Pendant',
      paragraph:
        'A 3D-rendered halo pendant with a centre stone and surrounding ring of small diamonds. Generated in-browser. Drag to view from any angle.',
      mediaType: 'THREE_PROCEDURAL',
      proceduralType: 'halo-pendant',
      animationType: 'ROTATE_3D',
    },
    {
      order: 10,
      title: 'Procedural Bangle',
      paragraph:
        'A 3D-rendered torus bangle with a faceted surface. Generated in-browser with Three.js. Drag to rotate.',
      mediaType: 'THREE_PROCEDURAL',
      proceduralType: 'bangle',
      animationType: 'ROTATE_3D',
    },
    {
      order: 11,
      title: 'Visit Our Dublin Workshop',
      paragraph:
        'Our showroom is located in Dublin, Ireland. Contact us for appointments, custom orders, and wholesale enquiries. Use the contact form below or message us on WhatsApp.',
      mediaType: 'TEXT_ONLY',
      mediaUrl: null,
      animationType: 'SLIDE_UP',
    },
  ]

  for (const s of scenes) {
    await db.scene.create({ data: s })
  }
  console.log(`${scenes.length} scenes seeded`)

  // ── Collections ─────────────────────────────────────────────────────
  await db.collection.deleteMany({})
  await db.product.deleteMany({})

  const collections = [
    {
      slug: 'rhinestone-earrings',
      name: 'Rhinestone Earrings',
      description:
        'Drop, hoop, and chandelier earrings set with clear and coloured rhinestones on silver-tone or gold-tone metal.',
      coverImage: '/media/IMG_9b569d6b-11db-42f7-8319-2316087233e5.jpg',
      order: 0,
    },
    {
      slug: 'engagement-rings',
      name: 'Engagement Rings',
      description:
        'Solitaire, halo, and filigree engagement rings. Available in gold and silver-tone settings.',
      coverImage: '/media/exquisite-diamond-engagement-ring-gold-filigree-sparkling-gemstones_632498-24492.jpg',
      order: 1,
    },
    {
      slug: 'gold-heritage',
      name: 'Gold Heritage',
      description:
        'Gold necklace sets, bangles, and traditional designs with hand-engraved detail.',
      coverImage: '/media/IMG_6d2fa7ff-94df-4d1b-ac32-69dc1e1e406b.jpg',
      order: 2,
    },
    {
      slug: 'bridal-sets',
      name: 'Bridal Sets',
      description:
        'Coordinated necklace, earring, and maang tikka sets for bridal occasions.',
      coverImage: '/media/360_F_695461716_tnpwMR7YYXFNFVI5rqqI0ldpVUM0rsKD.jpg',
      order: 3,
    },
  ]

  const collectionMap: Record<string, string> = {}
  for (const c of collections) {
    const created = await db.collection.create({ data: c })
    collectionMap[c.slug] = created.id
  }
  console.log(`${collections.length} collections seeded`)

  // ── Products ────────────────────────────────────────────────────────
  const products = [
    {
      collectionSlug: 'rhinestone-earrings',
      slug: 'green-drop-earrings',
      name: 'Silver Wing Drop Earrings with Green Gemstone',
      description:
        'Silver-tone metal earrings in a wing form, set with clear rhinestones, terminating in green gemstone grape-cluster drops. Approximately 6 cm length.',
      images: ['/media/IMG_9b569d6b-11db-42f7-8319-2316087233e5.jpg'],
      pricingModel: 'FIXED',
      priceEur: 145,
      stock: 12,
      featured: true,
    },
    {
      collectionSlug: 'rhinestone-earrings',
      slug: 'crystal-hoop-earrings',
      name: 'Crystal-Set Hoop Earrings',
      description: 'Hoop earrings set with clear rhinestones around the full circumference. 25mm diameter.',
      images: ['/media/IMG_ffd06c17-be8c-4c3d-83de-327b319f6d15.jpg'],
      pricingModel: 'FIXED',
      priceEur: 89,
      stock: 24,
    },
    {
      collectionSlug: 'engagement-rings',
      slug: 'gold-filigree-engagement-ring',
      name: 'Gold Filigree Engagement Ring',
      description:
        'Gold engagement ring, round-cut centre stone in multi-prong setting, stepped side stones, openwork filigree and granulated shank.',
      images: ['/media/exquisite-diamond-engagement-ring-gold-filigree-sparkling-gemstones_632498-24492.jpg'],
      pricingModel: 'GOLD_WEIGHTED',
      goldWeightG: 4.2,
      goldPurity: 22,
      makingCharge: 180,
      stock: 4,
      featured: true,
    },
    {
      collectionSlug: 'engagement-rings',
      slug: 'cushion-cut-halo-ring',
      name: 'Cushion-Cut Halo Ring',
      description:
        'Gold ring, cushion-cut centre stone, halo of small diamonds, polished band.',
      images: ['/media/IMG_ffd06c17-be8c-4c3d-83de-327b319f6d15.jpg'],
      pricingModel: 'GOLD_WEIGHTED',
      goldWeightG: 3.6,
      goldPurity: 18,
      makingCharge: 220,
      stock: 6,
    },
    {
      collectionSlug: 'gold-heritage',
      slug: 'gold-floral-bangle',
      name: 'Gold Floral Bangle',
      description:
        'Gold bangle with engraved floral decoration and small set stones.',
      images: ['/media/IMG_6d2fa7ff-94df-4d1b-ac32-69dc1e1e406b.jpg'],
      pricingModel: 'GOLD_WEIGHTED',
      goldWeightG: 12.5,
      goldPurity: 22,
      makingCharge: 320,
      stock: 3,
    },
    {
      collectionSlug: 'gold-heritage',
      slug: 'gold-necklace-set',
      name: 'Gold Necklace and Earring Set',
      description:
        'Gold necklace with floral links and central leaf pendant, paired with hollow gold earrings with pearl and green stone drops.',
      images: ['/media/IMG_5fec9ecc-3276-40ad-bbd5-6457fa960fff.jpg'],
      pricingModel: 'GOLD_WEIGHTED',
      goldWeightG: 38.0,
      goldPurity: 22,
      makingCharge: 850,
      stock: 2,
    },
  ]

  for (const p of products) {
    const { collectionSlug, ...data } = p
    await db.product.create({
      data: {
        ...data,
        collectionId: collectionMap[collectionSlug],
      },
    })
  }
  console.log(`${products.length} products seeded`)

  // ── Gallery ────────────────────────────────────────────────────────
  await db.galleryItem.deleteMany({})
  const gallery = [
    {
      type: 'PHOTO',
      url: '/media/IMG_9b569d6b-11db-42f7-8319-2316087233e5.jpg',
      caption: 'Green-drop rhinestone earrings on display mount.',
      order: 0,
    },
    {
      type: 'PHOTO',
      url: '/media/IMG_5fec9ecc-3276-40ad-bbd5-6457fa960fff.jpg',
      caption: 'Gold necklace set on green bust.',
      order: 1,
    },
    {
      type: 'PHOTO',
      url: '/media/exquisite-diamond-engagement-ring-gold-filigree-sparkling-gemstones_632498-24492.jpg',
      caption: 'Filigree engagement ring, transparent backdrop.',
      order: 2,
    },
    {
      type: 'PHOTO',
      url: '/media/IMG_6d2fa7ff-94df-4d1b-ac32-69dc1e1e406b.jpg',
      caption: 'Gold bangles on tiered display.',
      order: 3,
    },
    {
      type: 'PHOTO',
      url: '/media/360_F_695461716_tnpwMR7YYXFNFVI5rqqI0ldpVUM0rsKD.jpg',
      caption: 'Indian bridal set on green silk.',
      order: 4,
    },
    {
      type: 'PHOTO',
      url: '/media/IMG_ffd06c17-be8c-4c3d-83de-327b319f6d15.jpg',
      caption: 'Cushion-cut solitaire ring, dark backdrop.',
      order: 5,
    },
  ]
  for (const g of gallery) {
    await db.galleryItem.create({ data: g })
  }
  console.log(`${gallery.length} gallery items seeded`)

  // ── Testimonials ───────────────────────────────────────────────────
  await db.testimonial.deleteMany({})
  const testimonials = [
    {
      customerName: 'Aoife M.',
      location: 'Dublin',
      quote:
        'Visited the workshop for an appointment. The rhinestone earrings I ordered were hand-set in front of me. Quality is exactly as described.',
      rating: 5,
    },
    {
      customerName: 'Hassan R.',
      location: 'Cork',
      quote:
        'Bought a gold heritage bangle. The weight and karat were stated upfront and the live gold rate pricing made the cost transparent.',
      rating: 5,
    },
    {
      customerName: 'Priya S.',
      location: 'Galway',
      quote:
        'Ordered a bridal set for my wedding. The detail on the gold floral work was clean and consistent across necklace and earrings.',
      rating: 4,
    },
  ]
  for (const t of testimonials) {
    await db.testimonial.create({ data: t })
  }
  console.log(`${testimonials.length} testimonials seeded`)

  // ── Pages ───────────────────────────────────────────────────────────
  await db.page.deleteMany({})
  await db.page.create({
    data: {
      slug: 'about',
      title: 'About Rhinestone Jewellers',
      content:
        'Rhinestone Jewellers is a Dublin-based jewellery house. We specialise in rhinestone and crystal-embellished pieces, alongside a curated gold heritage line. Each piece is hand-set and quality-checked at our Dublin workshop. We publish the live gold rate used in our gold-weighted pricing so customers see the exact composition of each price. Custom orders, wholesale, and press enquiries are welcome by appointment.',
    },
  })
  await db.page.create({
    data: {
      slug: 'faq',
      title: 'Frequently Asked Questions',
      content:
        'Q: Where are you based? A: Dublin, Ireland. Q: Do you ship outside Ireland? A: Yes, worldwide. Shipping is calculated at inquiry. Q: How is gold pricing calculated? A: For gold-weighted items, the price is (weight in grams x gold rate per gram x purity factor) + making charge. The gold rate is refreshed every 6 hours. Q: Can I order custom pieces? A: Yes, by appointment. Use the contact form to start a custom order enquiry.',
    },
  })
  console.log('Pages seeded')

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
