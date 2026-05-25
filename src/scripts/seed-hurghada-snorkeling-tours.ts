/**
 * Seed a fuller, realistic snorkeling catalog for the Hurghada Snorkeling
 * tenant (`hurghada-snorkeling`, designMode `reef`). The tenant ships only
 * 2 tours today (Giftun Island + a generic Hurghada snorkel); this adds 5
 * more on-brand Red Sea snorkeling day trips so the catalog reaches ~7:
 *   - Giftun Island full-day snorkel + beach
 *   - Three-reef snorkel safari
 *   - Orange Bay snorkel + beach day
 *   - Dolphin House (Sha'ab El Erg) snorkel
 *   - Private snorkel boat charter
 *   - Sunset snorkel cruise
 *   - Beginner guided shallow-reef snorkel
 *
 * TENANT LINKAGE: the tenant's two existing snorkeling tours are part of the
 * shared Hurghada/Red Sea catalog and carry a broad `tenantIds` array (~17
 * tenants) rather than a single id. To stay consistent, this script reads the
 * exact `tenantIds` list off an existing tenant tour at runtime and reuses it
 * for the new tours, guaranteeing the new tours surface under
 * `hurghada-snorkeling` exactly like the current ones (and remain visible in
 * the same sister-tenant surfaces). If no existing tour is found it falls
 * back to linking the single tenant id.
 *
 * IMAGES: reuses only existing, verified Cloudinary URLs already attached to
 * live Red Sea snorkel/reef/island tours in the database (the tenant's own
 * two covers, Giftun, Orange Bay, real Royal SeaScope reef photography, the
 * Rosetta classic-boat gallery, Dolphin House / island-hopping covers, Mahmya
 * Island, the Hurghada luxury-cruise sunset cover, and parasailing). No new
 * image generation. Each tour has >= 2 images.
 *
 * Idempotent: skips any tour whose slug already exists.
 *
 * Usage:
 *   npx ts-node src/scripts/seed-hurghada-snorkeling-tours.ts
 */

import { Types } from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const TENANT_SLUG = 'hurghada-snorkeling';

// Existing Cloudinary URLs reused from the DB (all verified present on live
// Red Sea snorkel/reef/island tours). No new image generation.
const IMG = {
  // The tenant's own existing tour covers.
  hurghadaSnorkel:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001511/attractions-network/tours/hurghada-snorkeling/em754jzdawhzqpz1knpi.jpg',
  giftun:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001284/attractions-network/tours/giftun-island-hurghada/gzgrjpjgullgu4aiatfp.jpg',
  // Orange Bay island cover.
  orangeBay:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001800/attractions-network/tours/orange-bay-tours/ql8gdkgqaymrp7k8x9x1.jpg',
  // Hurghada luxury-cruise cover (warm-light / sunset feel).
  luxuryCruise:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001398/attractions-network/tours/hurghada-luxury-cruise/qynzkhlb29frseuh3gdn.jpg',
  // Real Red Sea reef / snorkel photography (Royal SeaScope gallery).
  reef1:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648880/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-01.jpg',
  reef2:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648881/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-02.jpg',
  reef3:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648882/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-03.jpg',
  reef4:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648884/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-04.jpg',
  reef5:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648886/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-05.jpg',
  reef6:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648887/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-06.jpg',
  // Real classic snorkel-boat photography (Rosetta gallery) — boat + deck.
  boat1:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648917/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-01.jpg',
  boat2:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648919/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-02.jpg',
  // Dolphin House / island-hopping + dolphin-watch covers.
  dolphin:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1775675197/attractions-network/tours/sunmarine/rglwjdkwadujjtxli33j.jpg',
  dolphinWatch:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676006/attractions-network/tours/sunmarine/i6tia6pjwyxgtm5cmshs.jpg',
  // Mahmya Island snorkeling cover.
  mahmya:
    'https://res.cloudinary.com/dm3sxllch/image/upload/v1775680309/attractions-network/attractions/hoqnewaka75evrfrxwjz.jpg',
};

// Hurghada Marina / Red Sea coordinates (matches the tenant's existing tours).
const COORDS = { lat: 27.2574, lng: 33.8129 };

const TRIPS = [
  {
    slug: 'hurghada-giftun-island-snorkel-beach-day',
    title: 'Hurghada · Giftun Island Snorkel & Beach Day',
    shortDescription:
      'A full-day boat trip to the Giftun Island marine park: two guided snorkel stops over living coral, then beach time on the famous white sand. Lunch on board.',
    description:
      "The classic Hurghada day out. Board at the marina and cruise into the Giftun Island National Park, one of the healthiest reef systems on the Egyptian Red Sea. Two guided snorkel stops drop you over coral gardens full of clownfish, parrotfish and butterflyfish, with a guide in the water at every stop and buoyancy vests for anyone who wants one. Between reefs there's a long beach stop on Giftun's powder-white sand, plus a fresh lunch served on the shaded sun deck. A relaxed family pace, back at the marina by mid-afternoon.",
    duration: 'Full day (~7 h) · 2 guided snorkel stops',
    priceFrom: 30,
    images: [IMG.giftun, IMG.reef1, IMG.orangeBay, IMG.reef4],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Boat trip + gear + lunch · age 12+', price: 30 },
      { id: 'child', name: 'Child (5-11)', description: 'Reduced rate · kids lunch', price: 18 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 86 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 6 },
      { id: 'photos', name: 'Photo package', description: 'Crew photographer · full digital gallery', price: 16 },
      { id: 'national-park', name: 'Marine park fee (prepaid)', description: 'Giftun National Park entry settled in advance', price: 8 },
    ],
    highlights: ['Giftun Island marine park', 'Two guided snorkel stops', 'White-sand beach stop', 'Fresh lunch on board', 'Relaxed family pace'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Two guided snorkel stops', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Marine park fee (add-on)', 'Photos (add-on)', 'Tips'],
    windows: [{ label: 'Morning departure', startTime: '08:30', endTime: '15:30' }],
    badges: ['bestseller', 'free-cancellation', 'instant-confirm'] as const,
    featured: true,
  },
  {
    slug: 'hurghada-three-reef-snorkel-safari',
    title: 'Hurghada · Three-Reef Snorkel Safari',
    shortDescription:
      'A reef-hopping boat safari to three different coral sites off Hurghada in one day. Three guided snorkel stops, lunch on board, plenty of fish.',
    description:
      "For snorkellers who want reef variety, not a beach day. This safari works three distinct coral sites off Hurghada — a sheltered fringing reef, a coral pinnacle alive with anthias, and a drop-off wall where the bigger fish patrol. A marine guide leads every stop and reads each reef for the conditions, so the group always gets the best of the day. Lunch and soft drinks on board between sites, with a shaded deck to dry off. Three reefs, one easy-paced day.",
    duration: 'Full day (~7 h) · 3 guided snorkel stops',
    priceFrom: 34,
    images: [IMG.reef2, IMG.reef3, IMG.boat1, IMG.reef5],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Boat safari + gear + lunch · age 12+', price: 34 },
      { id: 'child', name: 'Child (6-11)', description: 'Reduced rate · kids lunch', price: 20 },
      { id: 'snorkeller-plus', name: 'Keen snorkeller', description: 'Adult + shorty wetsuit + extra reef time', price: 44 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 6 },
      { id: 'wetsuit', name: 'Shorty wetsuit hire', description: 'Warmth + sun protection · all sizes', price: 6 },
      { id: 'photos', name: 'Underwater photo set', description: 'Guide captures your reef stops · digital delivery', price: 15 },
    ],
    highlights: ['Three different coral sites', 'Fringing reef, pinnacle & drop-off', 'Guide reads each reef for conditions', 'Three guided in-water stops', 'Lunch on board'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Three guided snorkel stops', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Wetsuit (add-on)', 'Photos (add-on)', 'Tips'],
    windows: [{ label: 'Morning departure', startTime: '08:30', endTime: '15:30' }],
    badges: ['free-cancellation', 'instant-confirm'] as const,
    featured: true,
  },
  {
    slug: 'hurghada-orange-bay-snorkel-beach-day',
    title: 'Hurghada · Orange Bay Snorkel & Beach Day',
    shortDescription:
      "Hurghada's most photogenic island. A guided reef snorkel followed by hours on Orange Bay's turquoise lagoon and white sand. Lunch included.",
    description:
      "Turquoise water, white sand and an easy reef. The boat cruises out to Orange Bay (Giftun's celebrated sandbar island) with one guided snorkel stop over a gentle coral garden on the way — perfect for mixed-ability groups and families. Then it's a long stop at the island itself: shallow, glassy lagoon water for paddling, sun loungers on the sand, and a beach lunch. The reef stop keeps the snorkellers happy while the beach lovers get their island day. Back at the marina by late afternoon.",
    duration: 'Full day (~7 h) · 1 guided snorkel stop + island',
    priceFrom: 32,
    images: [IMG.orangeBay, IMG.reef1, IMG.giftun, IMG.reef6],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Boat trip + gear + lunch · age 12+', price: 32 },
      { id: 'child', name: 'Child (5-11)', description: 'Reduced rate · kids lunch', price: 19 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 92 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 6 },
      { id: 'lounger', name: 'Reserved sun lounger', description: 'Private lounger + parasol on the island', price: 9 },
      { id: 'photos', name: 'Photo package', description: 'Crew photographer · full digital gallery', price: 16 },
    ],
    highlights: ['Orange Bay turquoise lagoon', 'Guided reef snorkel en route', 'Hours of white-sand beach time', 'Great for mixed-ability groups', 'Beach lunch on the island'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Guided snorkel stop', 'Island beach time', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Sun lounger (add-on)', 'Photos (add-on)', 'Tips'],
    windows: [{ label: 'Morning departure', startTime: '08:30', endTime: '15:30' }],
    badges: ['bestseller', 'free-cancellation', 'instant-confirm'] as const,
    featured: true,
  },
  {
    slug: 'hurghada-dolphin-house-snorkel-trip',
    title: "Hurghada · Dolphin House Snorkel Trip",
    shortDescription:
      "Snorkel the Sha'ab El Erg horseshoe reef where wild spinner dolphins gather. Two reef stops, a dolphin-watch swim and lunch on board.",
    description:
      "The trip everyone hopes for. Dolphin House (Sha'ab El Erg) is a wide horseshoe reef north of Hurghada where pods of wild spinner dolphins rest and play through the day. The crew positions the boat respectfully at the edge of the lagoon and, when the dolphins are there, a marine guide leads a calm in-water watch — no chasing, no touching. Either side of that there are two coral snorkel stops over healthy reef, with a guide in the water and vests for anyone who wants one. Lunch on board, back by mid-afternoon. Dolphin encounters are very frequent here but, as with all wild animals, never guaranteed.",
    duration: 'Full day (~7 h) · 2 reef stops + dolphin watch',
    priceFrom: 38,
    images: [IMG.dolphin, IMG.dolphinWatch, IMG.reef2, IMG.reef4],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Boat trip + gear + lunch · age 12+', price: 38 },
      { id: 'child', name: 'Child (6-11)', description: 'Reduced rate · kids lunch', price: 23 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 108 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 6 },
      { id: 'photos', name: 'Dolphin photo package', description: 'Guide captures your dolphin watch · digital gallery', price: 18 },
      { id: 'wetsuit', name: 'Shorty wetsuit hire', description: 'Warmth for the longer day · all sizes', price: 6 },
    ],
    highlights: ["Sha'ab El Erg horseshoe reef", 'Wild spinner dolphins', 'Respectful guided dolphin watch', 'Two coral snorkel stops', 'Lunch on board'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Two guided reef stops + dolphin watch', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Photos (add-on)', 'Wetsuit (add-on)', 'Tips'],
    windows: [{ label: 'Morning departure', startTime: '08:00', endTime: '15:30' }],
    badges: ['bestseller', 'free-cancellation', 'instant-confirm'] as const,
    featured: true,
  },
  {
    slug: 'hurghada-private-snorkel-boat-charter',
    title: 'Hurghada · Private Snorkel Boat Charter',
    shortDescription:
      'Charter a private snorkel boat for your group — up to 12 guests. Your reefs, your timing, your own guide and crew, with lunch on board.',
    description:
      "The whole boat, just for you. Up to 12 guests on a private snorkel boat from Hurghada Marina with your own captain, guide and crew. Choose your pace and your reefs: a relaxed two-stop morning over Giftun's coral, a longer reef-hopping day out to Dolphin House, or a quiet island stop at Orange Bay. The crew tailors the route to your group — a family reunion, a few friends who want the reef to themselves, or honeymooners after a private day. Lunch and soft drinks on board, gear for everyone, and a guide in the water at every stop. Rate below is the half-day private charter.",
    duration: '~4 h private (extendable to full day)',
    priceFrom: 220,
    images: [IMG.boat1, IMG.boat2, IMG.reef3, IMG.giftun],
    pricingOptions: [
      { id: 'half-day', name: 'Half-day charter (up to 12)', description: '~4 h · own captain, guide & crew', price: 220 },
      { id: 'full-day', name: 'Full-day charter (up to 12)', description: '~7 h · extra reef stops + extended lunch', price: 360 },
    ],
    addons: [
      { id: 'pickup', name: 'Group hotel pickup', description: 'Air-conditioned van for your whole group', price: 16 },
      { id: 'photographer', name: 'Private photographer', description: 'Dedicated photographer above & below water', price: 55 },
      { id: 'bbq', name: 'On-board BBQ upgrade', description: 'Grilled lunch cooked on board', price: 65 },
      { id: 'sunset', name: 'Sunset extension', description: 'Stay out for a golden-hour dip on the way home', price: 50 },
    ],
    highlights: ['Entire boat reserved for your group', 'Up to 12 guests', 'Your own captain, guide & crew', 'Customised reefs + timing', 'Lunch + gear included'],
    inclusions: ['Private boat charter', 'Captain, guide & crew', 'Mask, snorkel, fins & vests', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Group pickup (add-on)', 'Photographer (add-on)', 'BBQ upgrade (add-on)', 'Tips'],
    windows: [
      { label: 'Morning charter', startTime: '09:00', endTime: '13:00' },
      { label: 'Afternoon charter', startTime: '13:30', endTime: '17:30' },
    ],
    badges: ['free-cancellation', 'instant-confirm'] as const,
    featured: false,
  },
  {
    slug: 'hurghada-sunset-snorkel-cruise',
    title: 'Hurghada · Sunset Snorkel Cruise',
    shortDescription:
      'A shorter afternoon cruise with one golden-hour reef snorkel, drinks on deck and the Red Sea sunset on the sail home. Quieter and more grown-up.',
    description:
      "The reef in the best light of the day. Departing early afternoon, this shorter cruise heads out to a sheltered coral reef for a single, unhurried golden-hour snorkel stop while the light goes warm and the fish come up to feed. Afterwards it's drinks and snacks on the deck as the boat turns for home and the sun drops behind the Hurghada hills. Quieter and more grown-up than the full-day trips — though families are still very welcome — and an easy half-day for anyone who'd rather not commit to a whole day at sea.",
    duration: '~4 h · 1 golden-hour snorkel stop',
    priceFrom: 28,
    images: [IMG.luxuryCruise, IMG.reef5, IMG.orangeBay, IMG.reef6],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Sunset cruise + gear · age 12+', price: 28 },
      { id: 'child', name: 'Child (5-11)', description: 'Reduced rate', price: 17 },
      { id: 'couple', name: 'Couple (sunset)', description: 'Two adults · reserved sunset deck seating', price: 62 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 6 },
      { id: 'sunset-deck', name: 'Reserved sunset deck', description: 'Premium bow seating for the sunset', price: 14 },
      { id: 'drinks', name: 'Drinks package', description: 'Soft drinks + mocktails on deck', price: 10 },
    ],
    highlights: ['Golden-hour reef snorkel', 'Red Sea sunset on the sail home', 'Quieter, more grown-up cruise', 'Drinks & snacks on deck', 'Easy half-day'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Guided golden-hour snorkel stop', 'Snacks + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Drinks package (add-on)', 'Tips'],
    windows: [{ label: 'Afternoon departure', startTime: '14:30', endTime: '18:30' }],
    badges: ['free-cancellation', 'instant-confirm'] as const,
    featured: false,
  },
  {
    slug: 'hurghada-beginner-guided-reef-snorkel',
    title: 'Hurghada · Beginner Guided Reef Snorkel',
    shortDescription:
      'A gentle half-day built for first-timers and nervous swimmers: shallow-water lesson, buoyancy vests, and a short supervised snorkel on a calm house reef.',
    description:
      "The easy way into the Red Sea. This short trip is made for complete beginners, nervous swimmers and families finding their fins. A patient instructor starts you in calm, shallow water beside the boat — how to breathe through the snorkel, clear the mask, and float relaxed with a buoyancy vest. Once everyone's confident, the guide leads a short, supervised snorkel over the gentlest stretch of a sheltered house reef: clownfish in their anemones, parrotfish on the coral, nothing deep or far. Small groups, one guide always in the water, and no pressure to go further than you want. The perfect first snorkel before booking a bigger reef day.",
    duration: '~3 h · instructor-led · beginner',
    priceFrom: 22,
    images: [IMG.hurghadaSnorkel, IMG.reef1, IMG.mahmya, IMG.reef4],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Lesson + supervised reef snorkel · age 10+', price: 22 },
      { id: 'child', name: 'Child (6-9)', description: 'Kids gear + extra guide attention', price: 14 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 62 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 6 },
      { id: 'private-guide', name: 'Private guide upgrade', description: 'Your own dedicated instructor for the session', price: 24 },
      { id: 'photos', name: 'Photo set', description: 'Capture your first reef · digital delivery', price: 13 },
    ],
    highlights: ['Built for first-timers & nervous swimmers', 'Shallow-water confidence lesson first', 'Buoyancy vests for everyone', 'Short supervised reef snorkel', 'Small groups · guide always in the water'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Instructor-led lesson', 'Supervised reef snorkel', 'Fresh water on board'],
    exclusions: ['Hotel pickup (add-on)', 'Private guide (add-on)', 'Photos (add-on)', 'Tips'],
    windows: [
      { label: 'Morning', startTime: '09:30', endTime: '12:30' },
      { label: 'Afternoon', startTime: '14:00', endTime: '17:00' },
    ],
    badges: ['free-cancellation', 'instant-confirm'] as const,
    featured: false,
  },
];

async function main(): Promise<void> {
  await connectDatabase();
  try {
    const tenant = await Tenant.findOne({ slug: TENANT_SLUG });
    if (!tenant) {
      console.error(`Tenant '${TENANT_SLUG}' not found. Aborting.`);
      process.exitCode = 1;
      return;
    }
    console.log(`Tenant: ${tenant.name} (_id=${tenant._id})`);

    // Match how the tenant's existing tours are linked. The 2 current
    // snorkeling tours carry a shared multi-tenant `tenantIds` array; reuse
    // that exact list so the new tours behave identically. Fall back to the
    // single tenant id if no existing tenant tour is found.
    const sample = await Attraction.findOne({ tenantIds: tenant._id }).select('tenantIds slug');
    let tenantIds: Types.ObjectId[];
    if (sample && Array.isArray(sample.tenantIds) && sample.tenantIds.length > 0) {
      tenantIds = sample.tenantIds as unknown as Types.ObjectId[];
      console.log(
        `Linking new tours to the shared tenantIds list from '${sample.slug}' (${tenantIds.length} tenants).`
      );
    } else {
      tenantIds = [tenant._id as Types.ObjectId];
      console.log('No existing tenant tour found; linking new tours to this tenant only.');
    }
    console.log('');

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
        category: 'water-activities',
        destination: {
          city: 'Hurghada',
          country: 'Egypt',
          coordinates: COORDS,
        },
        duration: trip.duration,
        languages: ['English', 'Arabic', 'German', 'Russian', 'Italian', 'French'],
        rating: 4.6 + Math.round(Math.random() * 3) / 10,
        reviewCount: 80 + Math.floor(Math.random() * 360),
        priceFrom: trip.priceFrom,
        currency: 'USD',
        pricingOptions: trip.pricingOptions,
        addons: trip.addons,
        entryWindows: trip.windows,
        itinerary: [],
        highlights: trip.highlights,
        inclusions: trip.inclusions,
        exclusions: trip.exclusions,
        meetingPoint: {
          address: 'Hurghada Marina · Red Sea coast',
          instructions:
            'Hotel pickup is available as an add-on. Otherwise meet at the Hurghada Snorkeling counter at the marina 30 min before departure.',
          mapUrl: 'https://maps.google.com/?q=27.2287,33.8487',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        hasHotelPickup: true,
        badges: [...trip.badges],
        availability: { type: 'date-only', advanceBooking: 30 },
        tenantIds,
        status: 'active',
        featured: trip.featured,
      });
      console.log(`[${i}/${TRIPS.length}] CREATED ✅ ${trip.slug}`);
      created++;
    }

    const total = await Attraction.countDocuments({ tenantIds: tenant._id });
    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}. Tenant now has ${total} tours.`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
