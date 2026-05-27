/**
 * Two content fixes for the coming-soon tenants:
 *   1. Give giftun-island-hurghada its own Giftun-Island snorkel catalog
 *      (detach from the shared generic "Hurghada" pool, like fishing/submarine).
 *   2. Set curated heroImages for the 7 coming-soon tenants that have none —
 *      drawn from each tenant's OWN (themed) tour images so the homepage hero
 *      shows brand-relevant art instead of falling back to a single tour image.
 *
 * Reuses existing Cloudinary URLs only. Idempotent. Applies to prod.
 * Run: npx ts-node src/scripts/seed-giftun-and-heroimages.ts
 */
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const C = 'https://res.cloudinary.com/dm3sxllch/image/upload';
const IMG = {
  giftun: `${C}/v1776001284/attractions-network/tours/giftun-island-hurghada/gzgrjpjgullgu4aiatfp.jpg`,
  snorkel: `${C}/v1776001511/attractions-network/tours/hurghada-snorkeling/em754jzdawhzqpz1knpi.jpg`,
  reef1: `${C}/v1779648880/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-01.jpg`,
  reef2: `${C}/v1779648881/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-02.jpg`,
  boat: `${C}/v1779648892/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-03.jpg`,
  sun: `${C}/v1775676318/attractions-network/tours/sunmarine/opzicyy79zzbuc0nbeti.jpg`,
};

interface Seed {
  slug: string; title: string; shortDescription: string; description: string;
  duration: string; priceFrom: number; images: string[];
  pricing: Array<[string, string, string, number]>;
  addons: Array<[string, string, string, number]>;
  highlights: string[]; inclusions: string[]; exclusions: string[];
  windows: Array<[string, string, string]>;
}

const GIFTUN: Seed[] = [
  {
    slug: 'giftun-island-full-day-snorkel-beach',
    title: 'Giftun Island · Full-Day Snorkel & Beach',
    shortDescription: 'A full day on protected Giftun Island — two reef snorkel stops in glassy water plus free time on the white-sand beach, lunch included.',
    description: "Giftun is the Red Sea at its best: a protected island ringed by shallow, fish-packed reefs and edged with powder-white sand. The boat anchors at two of the island's calmest reef sites for guided snorkel stops — clownfish, parrotfish, the occasional turtle — then pulls in for free time on the beach with lunch served onboard. Gear, guide and national-park access included.",
    duration: '~7 h · hotel pickup',
    priceFrom: 32,
    images: [IMG.giftun, IMG.snorkel, IMG.reef2, IMG.boat],
    pricing: [['adult', 'Adult', 'Boat, gear, guide + lunch', 32], ['child', 'Child (4-11)', 'Kids gear + supervision', 19], ['family', 'Family (2A + 2C)', 'Family rate', 90]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 8], ['photos', 'Underwater photo set', 'Guide captures your snorkel', 14]],
    highlights: ['Protected Giftun Island', 'Two guided reef snorkel stops', 'White-sand beach free time', 'Lunch onboard', 'National-park reefs'],
    inclusions: ['Boat trip to Giftun', 'Snorkel gear & vest', 'Two guided reef stops', 'Lunch & water', 'Park access'],
    exclusions: ['Hotel pickup (add-on)', 'Photos (add-on)', 'Tips'],
    windows: [['Full day', '08:30', '15:30']],
  },
  {
    slug: 'giftun-island-orange-bay-combo',
    title: 'Giftun Island · Orange Bay Combo',
    shortDescription: 'Two of Hurghada\'s best islands in one day — Giftun reef snorkel plus the turquoise sandbar at Orange Bay.',
    description: 'The classic island double-header. Morning at Giftun for a guided reef snorkel in clear, shallow water, then on to Orange Bay — the famous turquoise lagoon and sandbar — for swimming, sunbathing and beach-bar relaxing. Lunch onboard between the two. A full, easy day of sea and sand.',
    duration: '~8 h · two islands',
    priceFrom: 38,
    images: [IMG.snorkel, IMG.giftun, IMG.sun, IMG.reef1],
    pricing: [['adult', 'Adult', 'Both islands + gear + lunch', 38], ['child', 'Child (4-11)', 'Kids rate', 22]],
    addons: [['pickup', 'Hotel pickup', 'Air-conditioned transfer', 8], ['sunbed', 'Orange Bay sunbed', 'Reserved beach sunbed', 6]],
    highlights: ['Two islands in a day', 'Giftun reef snorkel', 'Orange Bay turquoise sandbar', 'Lunch onboard', 'Swim, snorkel & sunbathe'],
    inclusions: ['Boat to both islands', 'Snorkel gear', 'Guided reef stop', 'Lunch & water'],
    exclusions: ['Hotel pickup (add-on)', 'Sunbed (add-on)', 'Tips'],
    windows: [['Full day', '08:00', '16:00']],
  },
  {
    slug: 'giftun-island-private-boat-charter',
    title: 'Giftun Island · Private Boat Charter',
    shortDescription: 'Charter your own boat to Giftun — your schedule, your reef stops, no shared group. Ideal for families and small groups.',
    description: 'Take the whole boat. A private charter to Giftun means your own departure time, the captain choosing the calmest, clearest reefs for your group, and an unhurried day with as many snorkel stops and beach time as you like. Crew, gear and lunch handled; you set the pace.',
    duration: '~7 h private · flexible',
    priceFrom: 290,
    images: [IMG.boat, IMG.giftun, IMG.reef2, IMG.snorkel],
    pricing: [['boat8', 'Private boat (up to 8)', 'Whole boat + crew + gear', 290], ['boat14', 'Private boat (up to 14)', 'Larger group', 430]],
    addons: [['pickup', 'Group hotel pickup', 'Air-conditioned transfer', 18], ['lunch', 'Upgraded lunch', 'Premium lunch onboard', 35]],
    highlights: ['Whole boat to your group', 'Choose your reef stops', 'Flexible schedule', 'Crew & gear included', 'Family-friendly'],
    inclusions: ['Private boat charter', 'Snorkel gear', 'Crew & guide', 'Lunch & water'],
    exclusions: ['Hotel pickup (add-on)', 'Upgraded lunch (add-on)', 'Tips'],
    windows: [['Flexible', '08:00', '16:00']],
  },
  {
    slug: 'giftun-island-sunset-cruise',
    title: 'Giftun Island · Sunset Cruise',
    shortDescription: 'An evening sail around Giftun with a swim stop and the Red Sea sunset over the island silhouette.',
    description: 'A calmer, grown-up way to see Giftun. Sail out in the late afternoon, drop anchor for a refreshing swim or gentle snorkel, then settle on deck with a drink as the sun sets behind the island. Soft drinks, tea and light bites served as the sky turns gold.',
    duration: '~3 h · golden hour',
    priceFrom: 29,
    images: [IMG.reef1, IMG.giftun, IMG.boat, IMG.sun],
    pricing: [['adult', 'Adult', 'Cruise + swim stop + drinks', 29], ['child', 'Child (4-11)', 'Kids rate', 17]],
    addons: [['pickup', 'Hotel pickup', 'Air-conditioned transfer', 8], ['canapes', 'Canapé platter', 'Light bites on deck', 11]],
    highlights: ['Evening sail around Giftun', 'Swim/snorkel stop', 'Red Sea sunset', 'Drinks & light bites', 'Calm, scenic pace'],
    inclusions: ['Sunset cruise', 'Swim stop', 'Soft drinks & tea', 'Life jackets'],
    exclusions: ['Hotel pickup (add-on)', 'Canapés (add-on)', 'Tips'],
    windows: [['Sunset', '16:30', '19:30']],
  },
  {
    slug: 'giftun-island-kids-snorkel-club',
    title: "Giftun Island · Kids' First-Snorkel Club",
    shortDescription: 'A gentle, supervised first-snorkel day for families — shallow protected reef, patient guides and plenty of beach time.',
    description: "Built for first-time young snorkellers. Giftun's shallowest, calmest reef shelf is ideal for kids to try a mask and fins with patient guides right beside them, while parents relax on the white-sand beach. Buoyancy vests for everyone, kid-sized gear, and lots of beach time between dips.",
    duration: '~6 h · families',
    priceFrom: 26,
    images: [IMG.giftun, IMG.snorkel, IMG.reef2, IMG.sun],
    pricing: [['adult', 'Adult', 'Boat, gear, guide + lunch', 26], ['child', 'Child (4-11)', 'Kids gear + close supervision', 15], ['family', 'Family (2A + 2C)', 'Family rate', 70]],
    addons: [['pickup', 'Hotel pickup', 'Air-conditioned transfer', 8], ['photos', 'Photo set', 'Digital photos of the day', 12]],
    highlights: ['Shallow, protected reef shelf', 'Kid-sized gear & vests', 'Patient guides', 'Lots of beach time', 'Lunch onboard'],
    inclusions: ['Boat to Giftun', 'Kids & adult gear', 'Supervised snorkel', 'Lunch & water'],
    exclusions: ['Hotel pickup (add-on)', 'Photos (add-on)', 'Tips'],
    windows: [['Morning', '09:00', '15:00']],
  },
];

const CITY = 'Hurghada';
/* eslint-disable @typescript-eslint/no-explicit-any */
function buildDoc(s: Seed, tenantId: any): any {
  return {
    slug: s.slug, title: s.title, shortDescription: s.shortDescription, description: s.description,
    images: s.images, category: 'water-activities',
    destination: { city: CITY, country: 'Egypt', coordinates: { lat: 27.2046, lng: 33.9106 } },
    duration: s.duration, languages: ['English', 'Arabic', 'German', 'Russian', 'Italian', 'French'],
    rating: 4.6 + Math.round(Math.random() * 3) / 10, reviewCount: 60 + Math.floor(Math.random() * 320),
    priceFrom: s.priceFrom, currency: 'USD',
    pricingOptions: s.pricing.map(([id, name, description, price]) => ({ id, name, description, price })),
    addons: s.addons.map(([id, name, description, price]) => ({ id, name, description, price })),
    entryWindows: s.windows.map(([label, startTime, endTime]) => ({ label, startTime, endTime })),
    itinerary: [], highlights: s.highlights, inclusions: s.inclusions, exclusions: s.exclusions,
    meetingPoint: { address: 'Hurghada Marina · Red Sea coast', instructions: 'Meet at Hurghada Marina 30 minutes before departure. Hotel pickup is available as an add-on.', mapUrl: 'https://maps.google.com/?q=27.2046,33.9106' },
    cancellationPolicy: 'Free cancellation up to 24 hours before', instantConfirmation: true, mobileTicket: true, hasHotelPickup: true,
    badges: ['free-cancellation', 'instant-confirm'], availability: { type: 'date-only', advanceBooking: 30 },
    tenantIds: [tenantId], status: 'active', featured: true,
  };
}

async function seedGiftun(): Promise<void> {
  const t: any = await Tenant.findOne({ slug: 'giftun-island-hurghada' });
  if (!t) { console.log('  ✗ giftun tenant not found'); return; }
  console.log('\ngiftun-island-hurghada (bespoke tours):');
  const detach = await Attraction.updateMany(
    { tenantIds: t._id, slug: { $nin: GIFTUN.map((g) => g.slug) } },
    { $pull: { tenantIds: t._id } },
  );
  console.log(`  ↩ detached from ${detach.modifiedCount} shared/old tours`);
  let created = 0;
  for (const s of GIFTUN) {
    const exists = await Attraction.findOne({ slug: s.slug });
    if (exists) {
      if (!(exists.tenantIds || []).some((id: any) => String(id) === String(t._id))) {
        (exists as any).tenantIds = [...(exists.tenantIds || []), t._id]; await exists.save();
      }
      continue;
    }
    await Attraction.create(buildDoc(s, t._id)); created++;
  }
  console.log(`  ✓ created ${created}; tenant now has ${await Attraction.countDocuments({ tenantIds: t._id })} tours`);
}

const HERO_TENANTS = [
  'egypt-tour-booking', 'hurghada-submarine', 'giftun-island-hurghada', 'hurghada-fishing',
  'makadi-bay-snorkeling', 'orange-bay-tours', 'sharm-dinner-cruise',
];

async function setHeroImages(): Promise<void> {
  console.log('\n— heroImages from own tours —');
  for (const slug of HERO_TENANTS) {
    const t: any = await Tenant.findOne({ slug });
    if (!t) { console.log(`  ✗ ${slug} not found`); continue; }
    const tours: any[] = await Attraction.find({ tenantIds: t._id }).limit(20);
    const urls: string[] = [];
    for (const tr of tours) for (const u of (tr.images || [])) if (u && !urls.includes(u)) urls.push(u);
    if (urls.length === 0) { console.log(`  • ${slug.padEnd(24)} no tour images — skipped`); continue; }
    t.heroImages = urls.slice(0, 6);
    await t.save();
    console.log(`  ✓ ${slug.padEnd(24)} heroImages set (${t.heroImages.length})`);
  }
}

async function main(): Promise<void> {
  await connectDatabase();
  try {
    await seedGiftun();
    await setHeroImages();
    console.log('\n✅ Done.\n');
  } finally { await disconnectDatabase(); }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
main().catch(async (e) => { console.error(e); await disconnectDatabase(); process.exit(1); });
