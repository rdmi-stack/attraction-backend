/**
 * Seed a realistic island-day-trip catalog for the Orange Bay Tours tenant.
 * Speedboat day trips from Hurghada to the white-sand Giftun islands —
 * Orange Bay beach day, snorkeling, VIP, parasailing, sunset, private.
 *
 * IMAGES: reuses existing relevant Cloudinary URLs already in the database
 * (the tenant's own existing Orange Bay tour image + real sailing/snorkel
 * photos from the Pirates and Royal SeaScope galleries plus matching
 * Sunmarine Orange Bay / island snorkel covers). No new image generation.
 *
 * Idempotent: skips any tour whose slug already exists.
 *
 * Usage:
 *   npx ts-node src/scripts/seed-orange-bay-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const TENANT_SLUG = 'orange-bay-tours';

// Existing Cloudinary URLs reused from the DB (verified present on live tours).
const IMG = {
  // The tenant's own existing Orange Bay tour cover.
  orange: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001800/attractions-network/tours/orange-bay-tours/ql8gdkgqaymrp7k8x9x1.jpg',
  // Sunmarine Orange Bay snorkel-cruise cover.
  orangeSun: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676165/attractions-network/tours/sunmarine/bjfqqnau9dfzqgrbji73.jpg',
  // Giftun Island + Hurghada snorkeling covers.
  giftun: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001284/attractions-network/tours/giftun-island-hurghada/gzgrjpjgullgu4aiatfp.jpg',
  hurghadaSnorkel: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001511/attractions-network/tours/hurghada-snorkeling/em754jzdawhzqpz1knpi.jpg',
  // Luxury yacht cruise cover (VIP feel).
  yacht: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001398/attractions-network/tours/hurghada-luxury-cruise/qynzkhlb29frseuh3gdn.jpg',
  // Real sailing-boat / snorkel photography (Pirates gallery).
  boat1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648889/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-01.jpg',
  boat2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648890/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-02.jpg',
  boat3: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648892/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-03.jpg',
  snorkelBoat: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648893/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-04.jpg',
  // Real reef photography (Royal SeaScope gallery).
  reef1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648880/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-01.jpg',
  reef5: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648886/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-05.jpg',
};

const TRIPS = [
  {
    slug: 'orange-bay-island-beach-day',
    title: 'Orange Bay · Speedboat Island Beach Day',
    shortDescription:
      'The classic. A speedboat from Hurghada to the white sand of Orange Bay, with a reef snorkel stop on the way and a full afternoon on the island.',
    description:
      "Hurghada's signature island day. Hotel pickup at 08:00, board a fast speedboat at the marina and skim across to the Giftun islands. A guided reef snorkel stop on the way, then hours on the famous white sand of Orange Bay — turquoise shallows, sun loungers, a beach bar, and the photo everyone comes for. Lunch is served island-side. Speedboat home in the late afternoon. The day every first-time visitor to Hurghada should do.",
    duration: '~7 h door-to-door',
    priceFrom: 35,
    images: [IMG.orange, IMG.boat1, IMG.giftun, IMG.snorkelBoat],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Speedboat + island + lunch · age 12+', price: 35 },
      { id: 'child', name: 'Child (4-11)', description: 'Reduced rate · kids lunch', price: 21 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 99 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 7 },
      { id: 'sunbed', name: 'Premium sunbed + umbrella', description: 'Reserved front-row lounger on the island', price: 10 },
      { id: 'photos', name: 'Photo package', description: 'Crew photographer · full digital gallery', price: 16 },
      { id: 'snorkel-extra', name: 'Second snorkel stop', description: 'Add a reef stop on the way home', price: 12 },
    ],
    highlights: ['Famous Orange Bay white sand', 'Fast speedboat from Hurghada', 'Guided reef snorkel stop', 'Island lunch + beach bar', 'Hours of free beach time'],
    inclusions: ['Marina boarding', 'Speedboat transfers', 'Mask, snorkel & fins', 'Island lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Premium sunbed (add-on)', 'Island environmental fee', 'Tips'],
    city: 'Hurghada',
    windows: [{ label: 'Morning departure', startTime: '09:00', endTime: '16:00' }],
  },
  {
    slug: 'orange-bay-snorkel-safari-two-reefs',
    title: 'Orange Bay · Snorkel Safari · Two Reefs + Island',
    shortDescription:
      'For the snorkelers. Two guided reef stops around the Giftun islands plus beach time at Orange Bay — more time in the water, same white sand.',
    description:
      "Built for guests who came for the reef. The speedboat works two of the best snorkel sites around the Giftun marine park — drop-offs, coral gardens, walls of fusilier — with a guide leading every swim and vests for anyone who wants one. Between the reefs you still get a proper stretch on Orange Bay's white sand and lunch on the island. More water, more fish, the same famous beach.",
    duration: '~7 h · 2 guided snorkel stops',
    priceFrom: 39,
    images: [IMG.hurghadaSnorkel, IMG.reef1, IMG.snorkelBoat, IMG.orangeSun],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Two reefs + island + lunch · age 12+', price: 39 },
      { id: 'child', name: 'Child (6-11)', description: 'Reduced rate · kids lunch', price: 24 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 7 },
      { id: 'wetsuit', name: 'Shorty wetsuit hire', description: 'Warmth + sun protection · all sizes', price: 6 },
      { id: 'photos', name: 'Underwater photo set', description: 'Guide captures your reef swims · digital delivery', price: 16 },
    ],
    highlights: ['Two guided reef snorkel stops', 'Giftun marine-park sites', 'Beach time at Orange Bay', 'Guide in the water every stop', 'Island lunch included'],
    inclusions: ['Marina boarding', 'Mask, snorkel, fins & vest', 'Two guided snorkel stops', 'Island lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Wetsuit (add-on)', 'Island environmental fee', 'Tips'],
    city: 'Hurghada',
    windows: [{ label: 'Morning departure', startTime: '08:45', endTime: '15:45' }],
  },
  {
    slug: 'orange-bay-vip-yacht-day',
    title: 'Orange Bay · VIP Yacht Day',
    shortDescription:
      'The upgrade. A small-group VIP cruise to Orange Bay on a comfortable yacht — premium lunch, open bar, shaded loungers and a quieter beach club.',
    description:
      "Orange Bay, done in style. A small-group VIP yacht — no crowds, proper shaded loungers, fresh towels and a premium open-buffet lunch with a soft-drinks-and-mocktails bar on board. A guided reef snorkel stop on the way, then time at Orange Bay with access to a quieter beach-club area away from the day-tripper crush. The crew keeps the group small and the service attentive. The grown-up version of the island day.",
    duration: '~7 h · small-group VIP',
    priceFrom: 75,
    images: [IMG.yacht, IMG.boat2, IMG.orange, IMG.reef5],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'VIP yacht + premium lunch + open bar · age 12+', price: 75 },
      { id: 'child', name: 'Child (6-11)', description: 'Reduced rate · kids menu', price: 45 },
      { id: 'couple', name: 'Couple package', description: 'Two adults · reserved shaded loungers', price: 140 },
    ],
    addons: [
      { id: 'pickup', name: 'Private hotel pickup', description: 'Private air-conditioned car transfer', price: 14 },
      { id: 'cabana', name: 'Private beach cabana', description: 'Reserved cabana at the quiet beach club', price: 30 },
      { id: 'photographer', name: 'Personal photographer', description: 'Photographer for your day · digital gallery', price: 35 },
    ],
    highlights: ['Small-group VIP yacht', 'Premium buffet + open soft bar', 'Quieter beach-club access', 'Guided reef snorkel stop', 'Shaded loungers + towels'],
    inclusions: ['Marina boarding', 'VIP yacht cruise', 'Snorkel gear', 'Premium lunch + soft drinks/mocktails', 'Beach-club access', 'Marine insurance'],
    exclusions: ['Private pickup (add-on)', 'Private cabana (add-on)', 'Island environmental fee', 'Tips'],
    city: 'Hurghada',
    windows: [{ label: 'Morning departure', startTime: '09:00', endTime: '16:00' }],
  },
  {
    slug: 'orange-bay-parasail-and-island',
    title: 'Orange Bay · Parasail & Island Adventure',
    shortDescription:
      'Add a thrill. The full Orange Bay island day plus a tandem parasailing flight over the Giftun shallows — see the turquoise from 100 metres up.',
    description:
      "The island day with a rush built in. You get the classic Orange Bay package — speedboat, reef snorkel stop, white-sand beach time and island lunch — plus a tandem parasailing flight launched from the boat over the Giftun shallows. Strapped in beside an instructor, you lift off the deck and float 100 metres above water so clear you can see the reef from the air. The calmest, most scenic parasail in the Red Sea. Minimum age 6 for tandem flights with an adult.",
    duration: '~7 h · includes tandem parasail',
    priceFrom: 58,
    images: [IMG.boat3, IMG.orange, IMG.giftun, IMG.boat1],
    pricingOptions: [
      { id: 'adult', name: 'Adult (with parasail)', description: 'Island day + one parasail flight · age 12+', price: 58 },
      { id: 'child', name: 'Child (6-11, tandem)', description: 'Island day + tandem flight with an adult', price: 42 },
      { id: 'beach-only', name: 'Beach-only companion', description: 'Full island day without the parasail flight', price: 35 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 7 },
      { id: 'extra-flight', name: 'Extra parasail flight', description: 'A second turn in the air', price: 22 },
      { id: 'video', name: 'Parasail video + photos', description: 'Onboard camera captures your flight', price: 18 },
    ],
    highlights: ['Tandem parasail over the Giftun shallows', 'Full Orange Bay island day', 'Reef snorkel stop included', 'Instructor-led, beginner-safe flights', 'Beach-only option for companions'],
    inclusions: ['Marina boarding', 'Speedboat transfers', 'One tandem parasail flight', 'Snorkel gear', 'Island lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Extra flight (add-on)', 'Island environmental fee', 'Tips'],
    city: 'Hurghada',
    windows: [{ label: 'Morning departure', startTime: '08:30', endTime: '15:30' }],
  },
  {
    slug: 'orange-bay-sunset-cruise',
    title: 'Orange Bay · Sunset Island Cruise',
    shortDescription:
      'The quiet hours. A late-afternoon cruise to Orange Bay for the golden light, an empty beach, a snorkel dip and the sun setting over the Red Sea.',
    description:
      "Orange Bay after the crowds have gone. We sail in the early afternoon, so you reach the white sand as the day-trippers leave and the light turns gold. A gentle snorkel dip on the way, drinks and mezze on the beach, an hour of near-empty island to yourselves, then a slow cruise home with the sun dropping into the sea behind you. Quieter, cooler and far more romantic than the midday rush — a favourite with couples.",
    duration: '~5 h · afternoon → sunset',
    priceFrom: 45,
    images: [IMG.orangeSun, IMG.yacht, IMG.orange, IMG.reef5],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Sunset cruise + beach + dip · age 12+', price: 45 },
      { id: 'child', name: 'Child (4-11)', description: 'Reduced rate', price: 27 },
      { id: 'couple', name: 'Couple (sunset)', description: 'Two adults · reserved beach seating + drinks', price: 95 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Hurghada hotel', price: 7 },
      { id: 'drinks', name: 'Drinks + mezze package', description: 'Soft drinks, mocktails + mezze platter', price: 14 },
      { id: 'private-table', name: 'Reserved beach table', description: 'Private table set on the sand for the sunset', price: 16 },
    ],
    highlights: ['Orange Bay after the crowds', 'Golden-hour light on the white sand', 'Gentle snorkel dip', 'Drinks + mezze on the beach', 'Couple-friendly sunset sail home'],
    inclusions: ['Marina boarding', 'Afternoon cruise', 'Snorkel gear', 'Soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Drinks + mezze (add-on)', 'Island environmental fee', 'Tips'],
    city: 'Hurghada',
    windows: [{ label: 'Afternoon departure', startTime: '13:30', endTime: '18:30' }],
  },
  {
    slug: 'orange-bay-private-speedboat-charter',
    title: 'Orange Bay · Private Speedboat Charter',
    shortDescription:
      'Your own speedboat to the islands — up to 10 guests. Set your own pace across Orange Bay, the Giftun reefs and the hidden sandbars.',
    description:
      "Skip the schedule. Charter a private speedboat with your own captain and guide and design your own island day: straight to Orange Bay before the crowds, a string of quiet reefs, the hidden sandbars most day trips never reach. Up to 10 guests. The crew tailors the route and timing to you — perfect for families, friends or a proposal on an empty beach. Lunch and snorkel gear on board. Rate below is the full-day private charter from Hurghada marina.",
    duration: '~7 h private (customisable)',
    priceFrom: 320,
    images: [IMG.boat2, IMG.snorkelBoat, IMG.orange, IMG.boat3],
    pricingOptions: [
      { id: 'half-day', name: 'Half-day charter (up to 10)', description: '~4 h · own captain & guide', price: 220 },
      { id: 'full-day', name: 'Full-day charter (up to 10)', description: '~7 h · Orange Bay + reefs + sandbars + lunch', price: 320 },
    ],
    addons: [
      { id: 'pickup', name: 'Group hotel pickup', description: 'Air-conditioned van for your whole group', price: 16 },
      { id: 'bbq', name: 'On-board BBQ lunch', description: 'Grilled lunch cooked fresh on the boat', price: 65 },
      { id: 'photographer', name: 'Private photographer', description: 'Dedicated photographer for your day', price: 55 },
      { id: 'proposal', name: 'Proposal / celebration setup', description: 'Flowers, sign + chilled drinks on a private sandbar', price: 90 },
    ],
    highlights: ['Entire speedboat for your group', 'Up to 10 guests', 'Own captain & guide', 'Hidden sandbars + quiet reefs', 'Fully customised route + timing'],
    inclusions: ['Private speedboat charter', 'Captain & guide', 'Snorkel gear', 'Lunch + soft drinks', 'Marine insurance'],
    exclusions: ['Group pickup (add-on)', 'BBQ lunch (add-on)', 'Island environmental fee', 'Tips'],
    city: 'Hurghada',
    windows: [
      { label: 'Morning charter', startTime: '08:30', endTime: '15:30' },
      { label: 'Half-day charter', startTime: '09:00', endTime: '13:00' },
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
          coordinates: { lat: 27.2287, lng: 33.8487 }, // Hurghada marina
        },
        duration: trip.duration,
        languages: ['English', 'Arabic', 'German', 'Russian', 'Italian', 'French'],
        rating: 4.6 + Math.round(Math.random() * 3) / 10,
        reviewCount: 90 + Math.floor(Math.random() * 600),
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
            'Meet at the Orange Bay Tours counter at Hurghada Marina 30 min before departure. Hotel pickup is available as an add-on.',
          mapUrl: 'https://maps.google.com/?q=27.2287,33.8487',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        hasHotelPickup: true,
        badges: ['bestseller', 'free-cancellation', 'instant-confirm'],
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
