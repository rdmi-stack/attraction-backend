/**
 * Seed a realistic evening dinner-cruise catalog for the Sharm Dinner Cruise
 * tenant. Sharm El Sheikh evening sailings: sunset dinner cruise, Tiran Bay
 * evening sail, private romantic dinner, group celebration, BBQ-on-board,
 * entertainment night.
 *
 * IMAGES: reuses existing relevant Cloudinary URLs already in the database
 * (the tenant's own existing dinner-cruise image + real cruise/dining/sunset
 * photos from the Nefertari Cruise gallery plus matching Sunmarine dinner /
 * sunset cruise covers). No new image generation.
 *
 * Idempotent: skips any tour whose slug already exists.
 *
 * Usage:
 *   npx ts-node src/scripts/seed-sharm-dinner-cruise-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const TENANT_SLUG = 'sharm-dinner-cruise';

// Existing Cloudinary URLs reused from the DB (verified present on live tours).
const IMG = {
  // The tenant's own existing dinner-cruise cover.
  self: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002362/attractions-network/tours/sharm-dinner-cruise/kobbo3t2skiwtiscwcww.jpg',
  // Real cruise / dining / sunset photography (Nefertari Cruise gallery).
  cruise1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648897/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-01.jpg',
  cruise2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648898/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-02.jpg',
  cruise3: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648899/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-03.jpg',
  cruise4: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648900/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-04.jpg',
  cruise5: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648902/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-05.jpg',
  cruise6: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648903/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-06.jpg',
  // Sunmarine dinner / sunset cruise covers.
  dinnerSun: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775510471/attractions-network/attractions-network/sunmarine/tours/c65t5xpdmeiatasdphzu.jpg',
  sunsetSun: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676061/attractions-network/tours/sunmarine/ohoytnz7e8fi1rptuikr.jpg',
  // Luxury yacht cover (private / premium feel).
  yacht: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001398/attractions-network/tours/hurghada-luxury-cruise/qynzkhlb29frseuh3gdn.jpg',
};

const TRIPS = [
  {
    slug: 'sharm-sunset-dinner-cruise',
    title: 'Sharm El Sheikh · Sunset Dinner Cruise',
    shortDescription:
      'The signature evening. Sail out of Sharm marina as the sun drops, a three-course dinner served on deck, and the lights of the bay on the way home.',
    description:
      "Sharm's classic evening on the water. Board at the marina in the late afternoon, find your table on the open deck, and sail out as the sun sets behind the mountains. A three-course dinner is served as you cruise — fresh mezze, a grilled main, dessert — with soft drinks throughout. After dinner there's time on the upper deck under the stars before the boat turns for the glittering lights of Sharm and Naama Bay. Relaxed, scenic and good for every kind of group.",
    duration: '~3 h evening cruise',
    priceFrom: 40,
    images: [IMG.self, IMG.cruise1, IMG.sunsetSun, IMG.cruise3],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Cruise + three-course dinner · age 12+', price: 40 },
      { id: 'child', name: 'Child (4-11)', description: 'Reduced rate · kids menu', price: 24 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 115 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Sharm hotel', price: 8 },
      { id: 'window-table', name: 'Reserved deck-rail table', description: 'Priority table along the rail for the sunset', price: 12 },
      { id: 'cake', name: 'Celebration cake', description: 'Cake brought to your table with a candle', price: 16 },
      { id: 'photos', name: 'Photo package', description: 'Onboard photographer · digital gallery', price: 15 },
    ],
    highlights: ['Sail out at sunset', 'Three-course dinner on deck', 'Lights of Sharm & Naama Bay', 'Upper deck under the stars', 'Good for every group'],
    inclusions: ['Marina boarding', '~3 h evening cruise', 'Three-course dinner', 'Soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Celebration cake (add-on)', 'Alcoholic drinks', 'Tips'],
    city: 'Sharm El Sheikh',
    windows: [{ label: 'Sunset departure', startTime: '17:30', endTime: '20:30' }],
  },
  {
    slug: 'sharm-tiran-bay-evening-sail',
    title: 'Sharm El Sheikh · Tiran Bay Evening Sail',
    shortDescription:
      'A longer evening sail out toward the Tiran Strait, with dinner on board and the mountains of Saudi Arabia glowing across the water at dusk.',
    description:
      "For a longer evening on the water. This sail heads out of Sharm toward the calm waters off the Tiran Strait — the same legendary stretch the dive boats work by day, beautiful and still at dusk. Dinner is served on deck as the light fades and the mountains of Saudi Arabia glow gold across the strait. A slower, further, more scenic cruise than the standard sunset run, with plenty of open-deck time and a quieter, grown-up atmosphere.",
    duration: '~3.5 h evening sail',
    priceFrom: 48,
    images: [IMG.cruise2, IMG.cruise4, IMG.sunsetSun, IMG.cruise1],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Extended evening sail + dinner · age 12+', price: 48 },
      { id: 'child', name: 'Child (6-11)', description: 'Reduced rate · kids menu', price: 29 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Sharm hotel', price: 8 },
      { id: 'rail-table', name: 'Reserved deck-rail table', description: 'Priority rail-side table for the views', price: 12 },
      { id: 'drinks', name: 'Drinks package', description: 'Soft drinks, juices + mocktails all evening', price: 14 },
    ],
    highlights: ['Sails toward the Tiran Strait', 'Dusk over the Saudi mountains', 'Dinner served on deck', 'Longer, quieter evening', 'Plenty of open-deck time'],
    inclusions: ['Marina boarding', '~3.5 h evening sail', 'Dinner on board', 'Soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Drinks package (add-on)', 'Alcoholic drinks', 'Tips'],
    city: 'Sharm El Sheikh',
    windows: [{ label: 'Evening departure', startTime: '17:00', endTime: '20:30' }],
  },
  {
    slug: 'sharm-bbq-on-board-cruise',
    title: 'Sharm El Sheikh · BBQ-on-Board Cruise',
    shortDescription:
      'Smell the grill fire up at sea. A relaxed evening cruise with a live BBQ cooked on deck — grilled meats, seafood, salads and warm bread.',
    description:
      "The evening the galley moves on deck. As the boat sails out of Sharm, the crew fires up the grill and a live BBQ gets going in front of you — grilled meats and seafood, fresh salads, warm bread, and a sweet finish. It's the most relaxed, sociable cruise we run: long tables, the smell of the grill, the sea going by, and no rush to be anywhere. A favourite with families and groups of friends who want dinner that feels like a party.",
    duration: '~3 h · live BBQ',
    priceFrom: 45,
    images: [IMG.cruise5, IMG.dinnerSun, IMG.cruise2, IMG.self],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Cruise + live BBQ buffet · age 12+', price: 45 },
      { id: 'child', name: 'Child (4-11)', description: 'Reduced rate · kids BBQ plate', price: 27 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 128 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Sharm hotel', price: 8 },
      { id: 'seafood', name: 'Seafood platter upgrade', description: 'Premium grilled prawns + calamari for the table', price: 22 },
      { id: 'drinks', name: 'Drinks package', description: 'Soft drinks, juices + mocktails all evening', price: 14 },
    ],
    highlights: ['Live BBQ grilled on deck', 'Grilled meats, seafood & salads', 'Most relaxed, sociable cruise', 'Long shared tables', 'Great for families & friends'],
    inclusions: ['Marina boarding', '~3 h evening cruise', 'Live BBQ buffet dinner', 'Soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Seafood upgrade (add-on)', 'Alcoholic drinks', 'Tips'],
    city: 'Sharm El Sheikh',
    windows: [{ label: 'Evening departure', startTime: '18:00', endTime: '21:00' }],
  },
  {
    slug: 'sharm-entertainment-night-cruise',
    title: 'Sharm El Sheikh · Entertainment Night Cruise',
    shortDescription:
      'Dinner and a show at sea. An evening cruise with a full entertainment programme — live music, an Oriental dance show and a Tanoura spin.',
    description:
      "Dinner and a show, out on the water. This evening cruise pairs a deck buffet with a full entertainment line-up: a live band to start, then a colourful Oriental dance show and the whirling lights of a Tanoura performance as the boat cruises the bay. A DJ keeps the upper deck going afterwards for anyone who wants to dance under the stars. The liveliest evening in our fleet — book it when you want the night to be the event, not just the dinner.",
    duration: '~3.5 h · dinner + show',
    priceFrom: 52,
    images: [IMG.cruise6, IMG.cruise3, IMG.dinnerSun, IMG.cruise4],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Cruise + buffet + full show · age 12+', price: 52 },
      { id: 'child', name: 'Child (4-11)', description: 'Reduced rate · kids menu', price: 31 },
      { id: 'family', name: 'Family pack (2A + 2C)', description: 'Family group rate', price: 148 },
    ],
    addons: [
      { id: 'pickup', name: 'Hotel pickup & drop-off', description: 'Air-conditioned van from any Sharm hotel', price: 8 },
      { id: 'front-row', name: 'Front-row show seating', description: 'Reserved seats right by the stage', price: 14 },
      { id: 'cake', name: 'Celebration cake', description: 'Cake with a candle + a shout-out from the host', price: 18 },
    ],
    highlights: ['Live band + Oriental dance show', 'Whirling Tanoura performance', 'DJ on the upper deck', 'Deck buffet dinner', 'Liveliest cruise in the fleet'],
    inclusions: ['Marina boarding', '~3.5 h evening cruise', 'Buffet dinner', 'Full entertainment programme', 'Soft drinks', 'Marine insurance'],
    exclusions: ['Hotel pickup (add-on)', 'Front-row seating (add-on)', 'Alcoholic drinks', 'Tips'],
    city: 'Sharm El Sheikh',
    windows: [{ label: 'Evening departure', startTime: '18:30', endTime: '22:00' }],
  },
  {
    slug: 'sharm-private-romantic-dinner-cruise',
    title: 'Sharm El Sheikh · Private Romantic Dinner Cruise',
    shortDescription:
      'Just the two of you. A private boat, a candle-lit table on deck, a dedicated waiter and a five-course dinner as you sail the bay at sunset.',
    description:
      "An evening for two, with the boat to yourselves. A small private vessel, a candle-lit table set on the open deck, rose petals and a dedicated waiter who looks after you alone. A five-course dinner is served course by course as you sail out at sunset and along the lit-up bay. Ideal for proposals, anniversaries and honeymoons — the crew can arrange flowers, a cake and a quiet moment exactly when you want it. The most personal evening in our fleet.",
    duration: '~2.5 h private cruise',
    priceFrom: 220,
    images: [IMG.yacht, IMG.cruise1, IMG.sunsetSun, IMG.cruise5],
    pricingOptions: [
      { id: 'couple', name: 'Private cruise for two', description: 'Private boat · five-course dinner · dedicated waiter', price: 220 },
      { id: 'couple-premium', name: 'Premium private cruise for two', description: 'Longer sail · premium menu · flowers + cake included', price: 320 },
    ],
    addons: [
      { id: 'pickup', name: 'Private hotel transfer', description: 'Private car to the marina and back', price: 18 },
      { id: 'flowers', name: 'Flowers + petals setup', description: 'Bouquet, rose-petal table + deck dressing', price: 35 },
      { id: 'proposal', name: 'Proposal coordination', description: 'Timed music, cake + champagne-style toast cue', price: 50 },
      { id: 'photographer', name: 'Private photographer', description: 'Discreet photographer for the evening', price: 60 },
    ],
    highlights: ['Private boat for two', 'Candle-lit deck table', 'Five-course served dinner', 'Dedicated waiter', 'Proposal & anniversary ready'],
    inclusions: ['Private boat charter', 'Captain + dedicated waiter', 'Five-course dinner', 'Soft drinks', 'Marine insurance'],
    exclusions: ['Private transfer (add-on)', 'Flowers setup (add-on)', 'Photographer (add-on)', 'Tips'],
    city: 'Sharm El Sheikh',
    windows: [{ label: 'Sunset departure', startTime: '17:30', endTime: '20:00' }],
  },
  {
    slug: 'sharm-group-celebration-charter',
    title: 'Sharm El Sheikh · Group Celebration Charter',
    shortDescription:
      'Charter the whole boat — up to 60 guests. Birthdays, hen and stag nights, team dinners and weddings, with a buffet, a DJ and the deck to yourselves.',
    description:
      "The whole boat for your celebration. Up to 60 guests, the deck dressed for your event, a buffet dinner and a DJ or live band, with the crew running the evening around your schedule. Milestone birthdays, hen and stag nights, corporate dinners, wedding receptions and reunions — you set the guest list, the music and the timing. Add a cake, a welcome drink and your own decoration. Rate below is the base evening charter from Sharm marina; catering scales with your numbers.",
    duration: '~3.5 h private charter (customisable)',
    priceFrom: 1100,
    images: [IMG.cruise4, IMG.cruise6, IMG.dinnerSun, IMG.cruise2],
    pricingOptions: [
      { id: 'charter', name: 'Evening charter (up to 60)', description: 'Whole boat · buffet + DJ · ~3.5 h', price: 1100 },
      { id: 'charter-premium', name: 'Premium evening charter (up to 60)', description: 'Upgraded buffet · live band · extended sail', price: 1650 },
    ],
    addons: [
      { id: 'transport', name: 'Group coach transfer', description: 'Coach pickup + drop-off for your whole party', price: 160 },
      { id: 'live-show', name: 'Live entertainment add-on', description: 'Oriental dance + Tanoura show for the group', price: 240 },
      { id: 'cake', name: 'Celebration cake + decor', description: 'Custom cake, deck decoration + welcome drink', price: 180 },
      { id: 'photographer', name: 'Event photographer', description: 'Photographer for the whole evening · gallery', price: 120 },
    ],
    highlights: ['Whole boat for up to 60', 'Deck dressed for your event', 'Buffet + DJ or live band', 'Fully customised timing', 'Weddings, birthdays & team nights'],
    inclusions: ['Whole-boat charter', 'Crew + captain', 'Buffet dinner', 'DJ + sound system', 'Soft drinks', 'Marine insurance'],
    exclusions: ['Group coach (add-on)', 'Live show (add-on)', 'Photographer (add-on)', 'Alcoholic drinks', 'Tips'],
    city: 'Sharm El Sheikh',
    windows: [{ label: 'Evening charter', startTime: '18:00', endTime: '21:30' }],
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
        category: 'cruises',
        destination: {
          city: trip.city,
          country: 'Egypt',
          coordinates: { lat: 27.8540, lng: 34.3299 }, // Sharm El Sheikh marina
        },
        duration: trip.duration,
        languages: ['English', 'Arabic', 'German', 'Russian', 'Italian', 'French'],
        rating: 4.6 + Math.round(Math.random() * 3) / 10,
        reviewCount: 80 + Math.floor(Math.random() * 500),
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
          address: 'Sharm El Sheikh Marina · South Sinai',
          instructions:
            'Meet at the Sharm Dinner Cruise counter at the marina 30 min before departure. Hotel pickup is available as an add-on.',
          mapUrl: 'https://maps.google.com/?q=27.8540,34.3299',
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
