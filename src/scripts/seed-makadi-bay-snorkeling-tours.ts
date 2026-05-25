/**
 * Seed a realistic snorkeling catalog for the Makadi Bay Snorkeling tenant.
 * Gentle, family-first snorkeling in Makadi Bay on the Red Sea: house-reef
 * shore snorkel, boat snorkel trips, glass-bottom, beginners, kids, private.
 *
 * IMAGES: reuses existing relevant Cloudinary URLs already in the database
 * (the tenant's own existing tour image + real Red Sea snorkel/reef/boat
 * photos from the Royal SeaScope and Pirates galleries plus thematically
 * matching Sunmarine snorkel tours). No new image generation.
 *
 * Idempotent: skips any tour whose slug already exists.
 *
 * Usage:
 *   npx ts-node src/scripts/seed-makadi-bay-snorkeling-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const TENANT_SLUG = 'makadi-bay-snorkeling';

// Existing Cloudinary URLs reused from the DB (verified present on live tours).
const IMG = {
  // The tenant's own existing snorkeling tour cover.
  house: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001740/attractions-network/tours/makadi-bay-snorkeling/dqgky1xrtcddcepr82g4.jpg',
  // Standalone Hurghada / Giftun snorkeling covers.
  hurghadaSnorkel: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001511/attractions-network/tours/hurghada-snorkeling/em754jzdawhzqpz1knpi.jpg',
  giftun: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001284/attractions-network/tours/giftun-island-hurghada/gzgrjpjgullgu4aiatfp.jpg',
  // Real Red Sea reef / boat / snorkel photography (Royal SeaScope gallery).
  reef1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648880/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-01.jpg',
  reef2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648881/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-02.jpg',
  reef3: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648882/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-03.jpg',
  reef4: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648884/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-04.jpg',
  reef5: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648886/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-05.jpg',
  // Real sailing-boat snorkel photography (Pirates gallery) — boat + reef stops.
  boat1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648892/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-03.jpg',
  boat2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648893/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-04.jpg',
  // Sunmarine snorkel-cruise covers (extra reef variety).
  sun1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676318/attractions-network/tours/sunmarine/opzicyy79zzbuc0nbeti.jpg',
  sun2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676165/attractions-network/tours/sunmarine/bjfqqnau9dfzqgrbji73.jpg',
};

const TRIPS = [
  {
    slug: 'makadi-house-reef-guided-snorkel',
    title: 'Makadi Bay · Guided House-Reef Snorkel',
    shortDescription:
      'Step straight off the beach onto a living coral reef. A gentle 2-hour guided snorkel over the Makadi Bay house reef — perfect for first-timers.',
    description:
      "The easiest way into the Red Sea. No boat, no long transfer — just walk down the beach steps and onto one of the calmest, healthiest house reefs in Makadi Bay. A certified guide gives a short briefing, fits your mask and fins, then leads a relaxed 2-hour snorkel along the reef edge: clownfish in their anemones, parrotfish grazing the coral, the occasional turtle. Buoyancy vests for everyone, and a guide who never lets the group drift. Ideal for nervous first-timers and families finding their fins.",
    duration: '~2 h in-water · guided',
    priceFrom: 18,
    images: [IMG.house, IMG.hurghadaSnorkel, IMG.reef1, IMG.reef3],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Mask, fins, vest + guide · age 12+', price: 18 },
      { id: 'child', name: 'Child (5-11)', description: 'Kids gear + extra guide attention', price: 11 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 50 },
    ],
    addons: [
      { id: 'photos', name: 'Underwater photo set', description: 'Guide captures your reef moments · digital delivery', price: 14 },
      { id: 'wetsuit', name: 'Shorty wetsuit hire', description: 'Warmth + sun protection · all sizes', price: 6 },
      { id: 'private-guide', name: 'Private guide upgrade', description: 'Your own dedicated guide for the session', price: 22 },
    ],
    highlights: ['Walk-in from the beach · no boat', 'Calm, beginner-friendly house reef', 'Certified guide leads the whole group', 'Clownfish, parrotfish & turtle sightings', 'Buoyancy vests included'],
    inclusions: ['Mask, snorkel & fins', 'Buoyancy vest', 'Guided 2 h reef snorkel', 'Safety briefing', 'Fresh water on the beach'],
    exclusions: ['Hotel transfer (walk-in trip)', 'Photos (add-on)', 'Wetsuit (add-on)', 'Tips'],
    city: 'Makadi Bay',
    windows: [
      { label: 'Morning', startTime: '09:30', endTime: '11:30' },
      { label: 'Afternoon', startTime: '14:00', endTime: '16:00' },
    ],
  },
  {
    slug: 'makadi-boat-snorkel-three-reefs',
    title: 'Makadi Bay · Boat Snorkel · Three Reefs',
    shortDescription:
      'A half-day boat trip to three sheltered reefs off Makadi Bay, with lunch on board. Two guided snorkel stops and plenty of deck time.',
    description:
      "Board a comfortable snorkel boat at Makadi marina and cruise to three sheltered reef sites in the bay and around the headland. Two guided snorkel stops over coral gardens teeming with fish, a shaded sun deck for the in-between, and a fresh lunch served on board. The crew runs the reefs at a relaxed family pace, with a guide in the water at every stop and vests for anyone who wants one. Back at the marina by mid-afternoon.",
    duration: '~5 h · 2 guided snorkel stops',
    priceFrom: 32,
    images: [IMG.boat1, IMG.reef2, IMG.giftun, IMG.boat2],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Boat trip + gear + lunch · age 12+', price: 32 },
      { id: 'child', name: 'Child (5-11)', description: 'Reduced rate · kids lunch', price: 19 },
      { id: 'toddler', name: 'Toddler (under 5)', description: 'Free on a paying adult lap · vest provided', price: 0 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Makadi hotel', price: 6 },
      { id: 'photos', name: 'Photo package', description: 'Crew photographer · full digital gallery', price: 16 },
      { id: 'noodle', name: 'Pool-noodle + float kit', description: 'Extra flotation for nervous swimmers', price: 4 },
    ],
    highlights: ['Three sheltered reef sites', 'Two guided in-water snorkel stops', 'Fresh lunch served on board', 'Shaded sun deck between reefs', 'Relaxed family pace'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Two guided snorkel stops', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Photos (add-on)', 'Tips'],
    city: 'Makadi Bay',
    windows: [
      { label: 'Morning departure', startTime: '09:00', endTime: '14:00' },
    ],
  },
  {
    slug: 'makadi-glass-bottom-reef-cruise',
    title: 'Makadi Bay · Glass-Bottom Reef Cruise',
    shortDescription:
      "See the reef without getting wet. A 1.5-hour glass-bottom boat cruise over the Makadi house reef — made for grandparents, toddlers and non-swimmers.",
    description:
      "The whole family on the reef, nobody needs to swim. Our glass-bottom boat glides slowly over the Makadi Bay house reef while everyone watches the coral, the clownfish and the turtles through the wide hull windows. A guide narrates what's passing below in several languages. There's an optional 20-minute snorkel stop for anyone who fancies a dip, but the trip works perfectly as a dry, shaded reef tour for those who'd rather stay aboard.",
    duration: '~1.5 h cruise · optional snorkel stop',
    priceFrom: 16,
    images: [IMG.sun1, IMG.house, IMG.reef4, IMG.sun2],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Glass-bottom cruise · window seat', price: 16 },
      { id: 'child', name: 'Child (3-11)', description: 'Reduced rate · window seat reserved', price: 9 },
      { id: 'senior', name: 'Senior (65+)', description: 'Reduced rate · shaded seating', price: 12 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Short transfer from any Makadi hotel', price: 5 },
      { id: 'snorkel-stop', name: 'Snorkel stop add-on', description: '20 min guided dip · gear included', price: 10 },
      { id: 'drinks', name: 'Drinks package', description: 'Soft drinks + juice on board', price: 6 },
    ],
    highlights: ['See the reef without swimming', 'Wide glass hull windows', 'Multilingual guide narration', 'Perfect for seniors & toddlers', 'Optional snorkel dip'],
    inclusions: ['Marina boarding', '~1.5 h glass-bottom cruise', 'Guide narration', 'Shaded seating', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Snorkel stop (add-on)', 'Tips'],
    city: 'Makadi Bay',
    windows: [
      { label: 'Morning', startTime: '10:00', endTime: '11:30' },
      { label: 'Midday', startTime: '12:30', endTime: '14:00' },
      { label: 'Afternoon', startTime: '15:00', endTime: '16:30' },
    ],
  },
  {
    slug: 'makadi-kids-first-snorkel-club',
    title: "Makadi Bay · Kids' First-Snorkel Club",
    shortDescription:
      "A morning built entirely around children aged 5-11: shallow-water lesson, a buddy guide each, gentle reef time and a snorkel certificate to take home.",
    description:
      "The reef, at kid speed. We start in waist-deep, glassy water by the beach where instructors teach breathing, clearing the mask and floating calmly — games, not drills. Once the little ones are confident, a buddy guide (one per two children) walks them out to the gentlest stretch of the house reef for supervised reef time. Everyone gets a fun snorkel certificate and a reef sticker book at the end. Parents are welcome in the water or relaxing on the beach with the team keeping watch.",
    duration: '~2.5 h · instructor-led',
    priceFrom: 22,
    images: [IMG.hurghadaSnorkel, IMG.house, IMG.reef1, IMG.reef5],
    pricingOptions: [
      { id: 'child', name: 'Child (5-11)', description: 'Lesson + buddy guide + certificate', price: 22 },
      { id: 'sibling', name: 'Sibling (2nd child)', description: 'Reduced rate for the second child', price: 17 },
      { id: 'parent', name: 'Accompanying parent', description: 'In-water parent place · gear included', price: 12 },
    ],
    addons: [
      { id: 'photos', name: 'Photo + video set', description: "Capture your child's first reef · digital delivery", price: 14 },
      { id: 'private-club', name: 'Private family club', description: 'Book the whole session for your family only', price: 40 },
    ],
    highlights: ['Built entirely for ages 5-11', 'Shallow-water confidence lesson first', 'One buddy guide per two children', 'Snorkel certificate + sticker book', 'Parents welcome in or out of the water'],
    inclusions: ['Kids mask, snorkel, fins & vest', 'Instructor-led lesson', 'Supervised reef time', 'Snorkel certificate', 'Fresh water + fruit'],
    exclusions: ['Hotel transfer', 'Photo set (add-on)', 'Tips'],
    city: 'Makadi Bay',
    windows: [
      { label: 'Morning club', startTime: '09:30', endTime: '12:00' },
    ],
  },
  {
    slug: 'makadi-private-snorkel-charter',
    title: 'Makadi Bay · Private Snorkel Boat Charter',
    shortDescription:
      'Charter a private snorkel boat for your group — up to 12 guests. Your reefs, your timing, your own guide and crew, lunch on board.',
    description:
      "The whole boat, just for you. Up to 12 guests on a private snorkel boat with your own captain, guide and crew. Pick your pace and your reefs: a lazy two-stop morning, a longer reef-hopping day, or a quiet sunset dip. The crew tailors the route to your group — honeymooners, a family reunion, a few friends who want the reef to themselves. Lunch and soft drinks on board, gear for everyone, and a guide in the water at every stop. Rate below is the half-day private charter from Makadi marina.",
    duration: '~4 h private (extendable)',
    priceFrom: 240,
    images: [IMG.boat2, IMG.reef3, IMG.boat1, IMG.giftun],
    pricingOptions: [
      { id: 'half-day', name: 'Half-day charter (up to 12)', description: '~4 h · own captain, guide & crew', price: 240 },
      { id: 'full-day', name: 'Full-day charter (up to 12)', description: '~7 h · extra reef stops + extended lunch', price: 390 },
    ],
    addons: [
      { id: 'pickup', name: 'Group hotel pickup', description: 'Air-conditioned van for your whole group', price: 18 },
      { id: 'photographer', name: 'Private photographer', description: 'Dedicated photographer above & below water', price: 60 },
      { id: 'bbq', name: 'On-board BBQ upgrade', description: 'Grilled lunch cooked on board', price: 70 },
      { id: 'sunset', name: 'Sunset extension', description: 'Stay out for a golden-hour dip on the way home', price: 55 },
    ],
    highlights: ['Entire boat reserved for your group', 'Up to 12 guests', 'Your own captain, guide & crew', 'Customised reefs + timing', 'Lunch + gear included'],
    inclusions: ['Private boat charter', 'Captain, guide & crew', 'Mask, snorkel, fins & vests', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Group pickup (add-on)', 'Photographer (add-on)', 'BBQ upgrade (add-on)', 'Tips'],
    city: 'Makadi Bay',
    windows: [
      { label: 'Morning charter', startTime: '09:00', endTime: '13:00' },
      { label: 'Afternoon charter', startTime: '13:30', endTime: '17:30' },
    ],
  },
  {
    slug: 'makadi-snorkel-and-turtle-bay-trip',
    title: 'Makadi Bay · Snorkel & Turtle Bay Trip',
    shortDescription:
      'A full-day boat trip combining the Makadi house reef with the seagrass turtle grounds — your best chance to snorkel beside green turtles.',
    description:
      "For everyone who wants to swim with turtles. This full-day boat trip pairs a coral-reef snorkel stop with a longer stop over the seagrass meadows where Makadi's resident green turtles feed. A marine guide briefs the group on respectful turtle-watching — keep your distance, no touching — then leads the swim. Time on a coral reef earlier in the day, lunch on board, and the headland reef on the way home. Turtle sightings are very frequent but never guaranteed; the crew knows where they graze.",
    duration: '~6 h · 3 snorkel stops',
    priceFrom: 38,
    images: [IMG.reef4, IMG.sun2, IMG.reef2, IMG.house],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full-day trip + gear + lunch · age 12+', price: 38 },
      { id: 'child', name: 'Child (6-11)', description: 'Reduced rate · kids lunch', price: 23 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 108 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Makadi hotel', price: 6 },
      { id: 'photos', name: 'Turtle photo package', description: 'Guide captures your turtle swim · digital gallery', price: 18 },
      { id: 'wetsuit', name: 'Shorty wetsuit hire', description: 'Warmth for the longer day · all sizes', price: 6 },
    ],
    highlights: ['Best chance to snorkel with green turtles', 'Coral reef + seagrass turtle grounds', 'Respectful turtle-watching briefing', 'Three snorkel stops', 'Lunch on board'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Three guided snorkel stops', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Photos (add-on)', 'Tips'],
    city: 'Makadi Bay',
    windows: [
      { label: 'Full-day departure', startTime: '08:30', endTime: '14:30' },
    ],
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
    console.log(`Tenant: ${tenant.name} (_id=${tenant._id})\n`);

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
          city: trip.city,
          country: 'Egypt',
          coordinates: { lat: 26.9806, lng: 33.9056 }, // Makadi Bay
        },
        duration: trip.duration,
        languages: ['English', 'Arabic', 'German', 'Russian', 'Italian', 'French'],
        rating: 4.6 + Math.round(Math.random() * 3) / 10,
        reviewCount: 60 + Math.floor(Math.random() * 320),
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
          address: 'Makadi Bay · Red Sea coast · Hurghada',
          instructions:
            'Walk-in trips meet at the beach dive station. Boat trips meet at Makadi marina 30 min before departure. Hotel pickup is available as an add-on on boat trips.',
          mapUrl: 'https://maps.google.com/?q=26.9806,33.9056',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        hasHotelPickup: true,
        badges: ['free-cancellation', 'instant-confirm'],
        availability: { type: 'date-only', advanceBooking: 30 },
        tenantIds: [tenant._id],
        status: 'active',
        featured: true,
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
