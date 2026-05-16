/**
 * Seed 5 brand-exclusive Nefertari Cruise sailings. Each sailing's
 * `tenantIds` includes BOTH the nefertari tenant AND the egypt-sunmarine
 * mother portfolio — shared multi-tenant catalog.
 *
 * Uses the real deck photos (already on Cloudinary) for cover images.
 *
 * Idempotent: skips sailings whose slug already exists.
 *
 * Usage:
 *   npx ts-node src/scripts/seed-nefertari-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const TENANT_SLUG = 'nefertari-cruise';
const PORTFOLIO_SLUG = 'egypt-sunmarine';

const IMG = {
  temple:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1778873227/attractions-network/tenant-heroes/nefertari-cruise/buwhsqhlmqpnsgwutmds.jpg',
  hall:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1778873230/attractions-network/tenant-heroes/nefertari-cruise/dwzdbhr0xsykwz8ksloo.jpg',
  deck:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1778873232/attractions-network/tenant-heroes/nefertari-cruise/s40q3hilegapz4ciib4m.jpg',
  costume:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1778873236/attractions-network/tenant-heroes/nefertari-cruise/mlrjwffbvfjofcazuu3p.jpg',
  throne:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1778873239/attractions-network/tenant-heroes/nefertari-cruise/gblzc9eprdarumdnagqn.jpg',
};

const TRIPS = [
  {
    slug: 'nefertari-makadi-royal-day-cruise',
    title: 'Nefertari Makadi Bay · Royal Day Cruise',
    shortDescription:
      'The flagship sailing. A full day aboard a floating Pharaonic temple from Makadi Bay — robing, throne portrait, gilded banquet.',
    description:
      "Our signature cruise. Hotel pickup 08:30, board the flagship temple at Makadi Bay Marina, welcome drink under the hieroglyph ceiling. Robe in pharaonic dress and sit the golden throne for your portrait while the ship sails. A reef stop, open-deck sun time, and a multi-course gilded banquet in the carved dining hall. Tea and sweets on the star-deck for the sunset return. Door-to-door ~7 hours.",
    duration: '~5.5 h sailing · ~7 h door-to-door',
    priceFrom: 58,
    images: [IMG.temple, IMG.throne, IMG.hall, IMG.costume],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full royal day · age 13+', price: 58 },
      { id: 'child', name: 'Child (4-12)', description: 'Reduced rate · child costume + throne portrait', price: 35 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 165 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned car from any Makadi-area hotel', price: 8 },
      { id: 'photos', name: 'Royal photo package', description: 'Professional throne + banquet portraits · digital gallery', price: 25 },
      { id: 'private-table', name: 'Private banquet table', description: 'Reserved window table at the gilded banquet', price: 20 },
    ],
    highlights: ['Floating Pharaonic temple', 'Golden-throne portrait', 'Gilded multi-course banquet', 'Reef + sun-deck stop', 'Costume robing for all guests'],
    inclusions: ['Marina boarding', 'Pharaonic costume robing', 'Throne-room access', 'Multi-course banquet', 'Soft drinks + tea', 'Marine insurance'],
    exclusions: ['Tips', 'Hotel pickup (add-on)', 'Photo package (add-on)'],
  },
  {
    slug: 'nefertari-marsa-alam-temple-sailing',
    title: 'Nefertari Marsa Alam · Temple Sailing',
    shortDescription: 'The southern temple. The longest sail of the fleet from Marsa Alam — warmest water, quietest reefs.',
    description:
      "The deep-south temple ship. Marsa Alam offers the warmest water on our route and the longest sailing time — more time on deck, more time at the reef stop. Full royal programme: robing, throne portrait, gilded banquet, sunset return. Hotel pickup 08:30, drop-off ~16:30.",
    duration: '~6 h sailing · ~7.5 h door-to-door',
    priceFrom: 62,
    images: [IMG.temple, IMG.deck, IMG.hall, IMG.throne],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full royal day · age 13+', price: 62 },
      { id: 'child', name: 'Child (4-12)', description: 'Reduced rate · child costume + throne portrait', price: 38 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Car from Marsa Alam, Port Ghalib, Coraya Bay', price: 10 },
      { id: 'photos', name: 'Royal photo package', description: 'Professional portraits · digital gallery', price: 25 },
      { id: 'reef-snorkel', name: 'Reef snorkel add-on', description: '40 min supervised snorkel at the reef stop · gear included', price: 16 },
    ],
    highlights: ['Longest sail in the fleet', 'Warmest Red Sea water', 'Quietest reef stop', 'Gilded banquet', 'Costume robing + throne portrait'],
    inclusions: ['Marina boarding', 'Pharaonic costume robing', 'Throne-room access', 'Multi-course banquet', 'Soft drinks + tea', 'Marine insurance'],
    exclusions: ['Tips', 'Pickup (add-on)', 'Snorkel (add-on)'],
  },
  {
    slug: 'nefertari-sunset-pharaoh-cruise',
    title: 'Nefertari Sunset Pharaoh Cruise',
    shortDescription: 'The golden-hour temple. A 14:00 → 19:00 sailing — robing, throne portrait, banquet under the sunset.',
    description:
      "The sunset temple. Departing 14:00 and returning at 19:00, this is the cruise lit by golden hour. Board the temple, robe as royalty, throne portrait on the way out, the gilded banquet served as the sun drops, and tea on the star-deck under the first stars on the sail home.",
    duration: '~5 h sailing (14:00 → 19:00)',
    priceFrom: 54,
    images: [IMG.deck, IMG.temple, IMG.hall],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Sunset royal cruise · age 13+', price: 54 },
      { id: 'child', name: 'Child (4-12)', description: 'Reduced rate · child costume', price: 33 },
      { id: 'couple', name: 'Couple (sunset)', description: 'Two adults · reserved sunset deck seating', price: 120 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned car', price: 8 },
      { id: 'sunset-deck', name: 'Reserved sunset deck', description: 'Premium star-deck seating for the sunset', price: 20 },
      { id: 'photos', name: 'Royal photo package', description: 'Throne + sunset portraits · digital gallery', price: 25 },
    ],
    highlights: ['Golden-hour sailing', 'Banquet under the sunset', 'Throne-room portrait', 'Star-deck tea on return', 'Reserved sunset seating available'],
    inclusions: ['Marina boarding', 'Pharaonic costume robing', 'Throne-room access', 'Multi-course banquet', 'Soft drinks + tea', 'Marine insurance'],
    exclusions: ['Tips', 'Pickup (add-on)', 'Photo package (add-on)'],
  },
  {
    slug: 'nefertari-royal-costume-banquet',
    title: 'Nefertari Royal Costume Banquet',
    shortDescription: 'The theatrical special. Full dynasty robing, a staged throne ceremony, and an extended gilded banquet.',
    description:
      "The full theatre. This sailing leans into the spectacle: an extended costume robing with collars, headpieces and cloaks, a staged throne ceremony with the crew in character, and a longer multi-course banquet in the carved hall. Built for celebrations, group occasions and anyone who wants the dynasty experience turned up. Hotel pickup 08:30.",
    duration: '~6 h sailing · ~7 h door-to-door',
    priceFrom: 72,
    images: [IMG.costume, IMG.throne, IMG.hall, IMG.temple],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full theatrical banquet · age 13+', price: 72 },
      { id: 'child', name: 'Child (4-12)', description: 'Reduced rate · full child costume + ceremony', price: 44 },
      { id: 'group', name: 'Group of 6+', description: 'Per-person group rate · reserved banquet section', price: 64 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned car', price: 8 },
      { id: 'celebration', name: 'Celebration package', description: 'Cake, captain’s announcement, group throne portrait', price: 45 },
      { id: 'photos', name: 'Royal photo package', description: 'Full ceremony + banquet gallery', price: 30 },
    ],
    highlights: ['Extended costume robing', 'Staged throne ceremony', 'Longer gilded banquet', 'Built for celebrations', 'Group rates available'],
    inclusions: ['Marina boarding', 'Extended costume robing', 'Staged ceremony', 'Extended multi-course banquet', 'Soft drinks + tea', 'Marine insurance'],
    exclusions: ['Tips', 'Pickup (add-on)', 'Celebration package (add-on)'],
  },
  {
    slug: 'nefertari-private-temple-charter',
    title: 'Nefertari Private Temple Charter',
    shortDescription: 'Charter the whole 123-guest temple ship. Weddings, corporate galas, milestone events — customisable.',
    description:
      "The whole temple. Up to 123 guests, your route, your timing, your ceremony. Pharaonic-themed weddings on the throne deck, corporate galas under the gilded ceiling, milestone celebrations and brand events. The rate below starts from Makadi Bay in shoulder season; Marsa Alam quoted on request.",
    duration: '~6 h sailing (fully customisable)',
    priceFrom: 2200,
    images: [IMG.throne, IMG.hall, IMG.temple],
    pricingOptions: [
      { id: 'charter', name: 'Whole-temple charter', description: 'Up to 123 guests · Makadi Bay · shoulder season', price: 2200 },
      { id: 'charter-peak', name: 'Whole-temple charter (peak)', description: 'Up to 123 guests · peak season', price: 2900 },
    ],
    addons: [
      { id: 'catering', name: 'Premium banquet upgrade', description: 'Extended menu · live stations · 2.5 h service', price: 620 },
      { id: 'ceremony', name: 'Throne-deck ceremony', description: 'Wedding/celebration staging + officiant coordination', price: 480 },
      { id: 'photographer', name: 'On-board photographer', description: 'Pro photographer · full digital gallery', price: 240 },
      { id: 'transport', name: 'Group transport', description: 'Majestic Travel coach for your group · all cities', price: 260 },
    ],
    highlights: ['Entire 123-guest temple', 'Customised route + ceremony', 'Wedding / corporate / gala ready', 'Throne-deck ceremony staging', 'Pro photographer add-on'],
    inclusions: ['Whole-temple charter', 'Crew + captain', 'Customised itinerary', 'Soft drinks + tea', 'Marine insurance'],
    exclusions: ['Tips', 'Catering (add-on)', 'Transport (add-on)', 'Photographer (add-on)'],
  },
];

async function main(): Promise<void> {
  await connectDatabase();
  try {
    const tenant = await Tenant.findOne({ slug: TENANT_SLUG });
    if (!tenant) {
      console.error(`Tenant '${TENANT_SLUG}' not found. Run seed-nefertari-tenant.ts first.`);
      process.exitCode = 1;
      return;
    }
    const portfolio = await Tenant.findOne({ slug: PORTFOLIO_SLUG });
    if (!portfolio) {
      console.error(`Mother portfolio '${PORTFOLIO_SLUG}' not found. Aborting.`);
      process.exitCode = 1;
      return;
    }
    console.log(`Tenant: ${tenant.name} (_id=${tenant._id})`);
    console.log(`Portfolio cross-link: ${portfolio.name} (_id=${portfolio._id})\n`);

    let created = 0;
    let skipped = 0;
    let i = 0;

    for (const trip of TRIPS) {
      i++;
      const exists = await Attraction.findOne({ slug: trip.slug });
      if (exists) {
        console.log(`[${i}/${TRIPS.length}] SKIP  ${trip.slug} (exists)`);
        skipped++;
        continue;
      }

      await Attraction.create({
        slug: trip.slug,
        title: trip.title,
        shortDescription: trip.shortDescription,
        description: trip.description,
        images: trip.images,
        category: 'cruises',
        destination: {
          city: 'Makadi Bay',
          country: 'Egypt',
          coordinates: { lat: 26.9772, lng: 33.8987 },
        },
        duration: trip.duration,
        languages: ['English', 'Arabic', 'German', 'Russian', 'Italian', 'French'],
        rating: 4.7 + Math.round(Math.random() * 3) / 10,
        reviewCount: 200 + Math.floor(Math.random() * 800),
        priceFrom: trip.priceFrom,
        currency: 'USD',
        pricingOptions: trip.pricingOptions,
        addons: trip.addons,
        entryWindows: [
          { label: 'Morning sail', startTime: '09:00', endTime: '13:30' },
          { label: 'Sunset sail', startTime: '14:00', endTime: '19:00' },
        ],
        itinerary: [],
        highlights: trip.highlights,
        inclusions: trip.inclusions,
        exclusions: trip.exclusions,
        meetingPoint: {
          address: 'Makadi Bay Marina · Red Sea coast',
          instructions:
            'Hotel pickup is available as an add-on. Otherwise meet at the Nefertari Cruise counter at the marina 30 min before departure.',
          mapUrl: 'https://maps.google.com/?q=26.9772,33.8987',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'free-cancellation', 'instant-confirm'],
        availability: { type: 'date-only', advanceBooking: 30 },
        tenantIds: [tenant._id, portfolio._id],
        status: 'active',
        featured: true,
      });
      console.log(`[${i}/${TRIPS.length}] CREATED ✅ ${trip.slug} (tenantIds: nefertari + sunmarine portfolio)`);
      created++;
    }

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
