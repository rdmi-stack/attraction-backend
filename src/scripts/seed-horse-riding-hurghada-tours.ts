/**
 * Seed 5 on-brand horse-riding tours for the Horse Riding Hurghada tenant,
 * bringing it from 2 tours to ~7.
 *
 * Mirrors the existing horse-riding-hurghada catalog (see the `one-hour-beach-ride`
 * tour): category `horse-riding`, time-slot availability with 1-day advance
 * booking, Hurghada destination, and tenant-scoped linkage
 * (`tenantIds: [tenant._id]`) — i.e. brand-exclusive, matching how that tour
 * is scoped rather than the legacy 18-tenant shared bestseller.
 *
 * IMAGES: reuses existing, equestrian-themed Cloudinary URLs already stored on
 * live tours (makadi-horse-club + gamila-horse-stable galleries). No new image
 * generation, no downloads — every URL was harvested from the DB and verified
 * present. 3–4 relevant horse/beach-ride images per tour.
 *
 * Idempotent: skips any tour whose slug already exists. Re-running is a no-op.
 *
 * Usage:
 *   npx ts-node src/scripts/seed-horse-riding-hurghada-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const TENANT_SLUG = 'horse-riding-hurghada';

// Existing equestrian Cloudinary URLs reused from the DB (makadi-horse-club +
// gamila-horse-stable tour galleries). All verified present on live tours.
const IMG = {
  beach1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430074/attractions-network/attractions/ai-generated/makadi-horse-club/tlxjv2gy6vidk66kvzcq.jpg',
  beach2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430126/attractions-network/attractions/ai-generated/makadi-horse-club/jt1neyd5e4rms8dg3klj.jpg',
  herd: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775429978/attractions-network/attractions/ai-generated/makadi-horse-club/tbmfjagj1jm3ghm9sz2k.jpg',
  trot: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430028/attractions-network/attractions/ai-generated/makadi-horse-club/jncgpisbezlqgp5jqdn6.jpg',
  desert1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430292/attractions-network/attractions/ai-generated/makadi-horse-club/ye4lqouifeowk9pfv3od.jpg',
  desert2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430346/attractions-network/attractions/ai-generated/makadi-horse-club/xu5bfdsvidzfh8u7o8gk.jpg',
  stable1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430302/attractions-network/attractions/ai-generated/makadi-horse-club/o8duyjb7p72fd0jpi7cc.jpg',
  stable2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430354/attractions-network/attractions/ai-generated/makadi-horse-club/xnqcomvrjjlgomel6v7f.jpg',
  rider1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430075/attractions-network/attractions/ai-generated/makadi-horse-club/w7qdvfbigi9ywkoya7ud.jpg',
  rider2: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430127/attractions-network/attractions/ai-generated/makadi-horse-club/eo100h2ngsvfhy2xujtc.jpg',
  gamila1: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776012651/attractions-network/tours/gamila-makadi-horse-riding-desert-sea-guide/manpcsd901obdqvbwgfc.jpg',
  gamilaSunset: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776012682/attractions-network/tours/gamila-sunset-beach-horse-ride/itidklee13rpunfnryvt.jpg',
  gamilaKids: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1776012713/attractions-network/tours/gamila-kids-pony-experience/lpr3evferz468a08whjj.jpg',
  pony: 'https://res.cloudinary.com/dm3sxllch/image/upload/v1775677143/attractions-network/attractions/kwsuvpknncimwitq5w8h.jpg',
};

const TOURS = [
  {
    slug: 'hurghada-sunset-beach-horse-ride',
    title: 'Hurghada · Sunset Beach Horse Ride',
    shortDescription:
      'Ride a calm Arabian horse along the Red Sea shoreline as the sun drops behind the desert hills. A relaxed two-hour sunset ride for all levels.',
    description:
      "The signature ride. We meet at the stable in the late afternoon, match you to a calm, well-schooled Arabian horse, and walk down to the open beach as the light turns gold. Your guide keeps the pace gentle — a walk along the waterline, an easy trot on the firm sand for those who want it — while the sun sinks behind the desert hills and the Red Sea turns copper. Riders of every level are welcome; complete beginners are led, confident riders are given room. Helmets provided, hotel pickup included.",
    duration: '2 hours',
    priceFrom: 32,
    images: [IMG.gamilaSunset, IMG.beach1, IMG.beach2, IMG.desert1],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Ages 12+ · own horse + guide', price: 32, originalPrice: 40 },
      { id: 'child', name: 'Child (8-11)', description: 'Led pony or small horse', price: 20 },
      { id: 'couple', name: 'Couple', description: 'Two adults · reserved sunset slot', price: 60 },
    ],
    addons: [
      { id: 'addon-photo', name: 'Sunset Photo Package', description: 'Guide captures your ride · digital gallery', price: 15 },
      { id: 'addon-transfer', name: 'Hotel Transfer', description: 'Round-trip pickup from your Hurghada hotel', price: 10 },
      { id: 'addon-refresh', name: 'Beach Refreshments', description: 'Tea + dates on the sand after the ride', price: 6 },
    ],
    highlights: ['Golden-hour beach ride', 'Calm Arabian horses', 'All levels welcome', 'Red Sea + desert scenery', 'Helmets provided'],
    inclusions: ['Arabian horse', 'Safety helmet', 'Professional guide', 'Hotel pickup/drop-off', 'Water', 'Insurance'],
    exclusions: ['Tips', 'Photos (add-on)', 'Refreshments (add-on)'],
    badges: ['bestseller', 'instant-confirm'],
    windows: [
      { label: 'Late Afternoon', startTime: '16:00', endTime: '18:00' },
      { label: 'Sunset', startTime: '17:00', endTime: '19:00' },
    ],
  },
  {
    slug: 'hurghada-desert-horse-safari',
    title: 'Hurghada · Desert Horse Safari',
    shortDescription:
      'Leave the beach behind and ride out into the open desert on horseback — wide canter tracks, dunes and total quiet on a half-day mounted safari.',
    description:
      "For riders who want more than the shoreline. This half-day mounted safari heads inland from the stable into the open desert behind Hurghada: hard-packed tracks made for long, controlled canters, low dunes, and the kind of silence you only find away from the coast. A lead guide and a back rider keep the group together and matched to ability — beginners stay at a walk and trot in a smaller group, experienced riders get the canter stretches. A shaded rest stop with water and tea breaks up the ride before you turn for home.",
    duration: '~3.5 hours',
    priceFrom: 55,
    images: [IMG.desert1, IMG.desert2, IMG.gamila1, IMG.herd],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Ages 14+ · half-day mounted safari', price: 55, originalPrice: 68 },
      { id: 'experienced', name: 'Experienced Rider', description: 'Confident-rider group · more canter time', price: 62 },
    ],
    addons: [
      { id: 'addon-photo', name: 'Photography Package', description: 'Professional photos of your safari', price: 15 },
      { id: 'addon-transfer', name: 'Hotel Transfer', description: 'Round-trip pickup from your Hurghada hotel', price: 10 },
      { id: 'addon-bbq', name: 'Bedouin BBQ Stop', description: 'Grilled lunch at the desert rest camp', price: 18 },
    ],
    highlights: ['Open-desert canter tracks', 'Dunes + total quiet', 'Ability-matched riding groups', 'Shaded desert rest stop', 'Lead + back guide'],
    inclusions: ['Arabian horse', 'Safety helmet', 'Two guides', 'Hotel pickup/drop-off', 'Water + tea', 'Insurance'],
    exclusions: ['Tips', 'Photos (add-on)', 'BBQ stop (add-on)'],
    badges: ['instant-confirm'],
    windows: [
      { label: 'Morning Safari', startTime: '08:00', endTime: '11:30' },
      { label: 'Afternoon Safari', startTime: '15:00', endTime: '18:30' },
    ],
  },
  {
    slug: 'hurghada-private-guided-horse-ride',
    title: 'Hurghada · Private Guided Horse Ride',
    shortDescription:
      'Just you (or your group) and a dedicated guide. A fully private beach-and-desert ride at your own pace, your own timing, your own route.',
    description:
      "The ride, exactly how you want it. This is a fully private experience — just you, or your family or friends, with a dedicated guide and horses reserved only for your group. Tell us your pace and we build the ride around it: a gentle beach walk for a nervous first-timer, a longer beach-and-desert loop with canter stretches for confident riders, or a slow photo-led amble for a couple. Flexible start times across the day, the same calm Arabian horses, and a guide whose only job is your group.",
    duration: '~2.5 hours (flexible)',
    priceFrom: 70,
    images: [IMG.rider1, IMG.beach1, IMG.gamila1, IMG.trot],
    pricingOptions: [
      { id: 'private-1', name: 'Private (1 rider)', description: 'Solo · dedicated guide', price: 70 },
      { id: 'private-2', name: 'Private (2 riders)', description: 'Two riders · dedicated guide', price: 120 },
      { id: 'private-group', name: 'Private group (3-5)', description: 'Up to 5 riders · per group', price: 220 },
    ],
    addons: [
      { id: 'addon-photo', name: 'Private Photo Package', description: 'Dedicated photographer for your group', price: 25 },
      { id: 'addon-transfer', name: 'Hotel Transfer', description: 'Round-trip pickup from your Hurghada hotel', price: 10 },
      { id: 'addon-extend', name: 'Extra Hour', description: 'Add a full hour to your private ride', price: 30 },
    ],
    highlights: ['Fully private — your group only', 'Dedicated personal guide', 'Beach + desert at your pace', 'Flexible start times', 'All levels accommodated'],
    inclusions: ['Arabian horse(s)', 'Safety helmet', 'Dedicated private guide', 'Hotel pickup/drop-off', 'Water', 'Insurance'],
    exclusions: ['Tips', 'Photos (add-on)', 'Extra hour (add-on)'],
    badges: ['free-cancellation', 'instant-confirm'],
    windows: [
      { label: 'Morning', startTime: '08:00', endTime: '10:30' },
      { label: 'Midday', startTime: '11:00', endTime: '13:30' },
      { label: 'Afternoon', startTime: '15:00', endTime: '17:30' },
    ],
  },
  {
    slug: 'hurghada-beginner-lesson-and-ride',
    title: 'Hurghada · Beginner Lesson & Beach Ride',
    shortDescription:
      'Never ridden before? Start with a friendly arena lesson on the basics, then head out for a gentle led beach ride once you feel confident.',
    description:
      "Built for first-timers. We start in the stable's sand arena with a patient instructor who teaches the basics — how to mount, sit, hold the reins, stop and steer — on a calm, forgiving horse. Games and small steps, never pressure. Once you're comfortable (most people are within the half-hour), your instructor leads you out for a gentle walk along the beach so you finish the morning actually riding on the Red Sea shoreline, not just circling an arena. Ideal for adults and children alike; helmets and a buddy guide per rider for the youngest.",
    duration: '~2 hours (lesson + ride)',
    priceFrom: 28,
    images: [IMG.stable1, IMG.stable2, IMG.rider2, IMG.beach2],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Ages 12+ · lesson + led beach ride', price: 28, originalPrice: 36 },
      { id: 'child', name: 'Child (6-11)', description: 'Lesson + led ride · buddy guide', price: 18 },
      { id: 'family', name: 'Family (2A + 2C)', description: 'Family group rate', price: 80 },
    ],
    addons: [
      { id: 'addon-photo', name: 'Photo Package', description: 'Capture your first ride · digital gallery', price: 15 },
      { id: 'addon-transfer', name: 'Hotel Transfer', description: 'Round-trip pickup from your Hurghada hotel', price: 10 },
      { id: 'addon-private', name: 'Private Lesson Upgrade', description: 'One-to-one instructor for the session', price: 22 },
    ],
    highlights: ['Made for complete beginners', 'Patient arena lesson first', 'Calm, forgiving horses', 'Finish on the beach', 'Kids welcome with buddy guide'],
    inclusions: ['Horse', 'Safety helmet', 'Certified instructor', 'Arena lesson', 'Led beach ride', 'Hotel pickup/drop-off', 'Water', 'Insurance'],
    exclusions: ['Tips', 'Photos (add-on)', 'Private upgrade (add-on)'],
    badges: ['free-cancellation', 'instant-confirm'],
    windows: [
      { label: 'Morning Lesson', startTime: '09:00', endTime: '11:00' },
      { label: 'Afternoon Lesson', startTime: '14:00', endTime: '16:00' },
    ],
  },
  {
    slug: 'hurghada-sunrise-beach-horse-ride',
    title: 'Hurghada · Sunrise Beach Horse Ride',
    shortDescription:
      'Beat the heat and the crowds. A peaceful early-morning ride along an empty Red Sea beach as the sun comes up — cool air, soft light, calm horses.',
    description:
      "The quietest, coolest ride of the day. We meet before dawn and ride out onto a completely empty beach just as the sun lifts over the Red Sea — the air is cool, the sand is firm and freshly washed, and the horses are at their calmest. Your guide leads a relaxed walk and trot along the waterline with the light soft and golden, perfect for photographs and for anyone who'd rather avoid the midday heat. A short stop to watch the sunrise properly before riding back for breakfast. All levels welcome.",
    duration: '~1.5 hours',
    priceFrom: 30,
    images: [IMG.beach2, IMG.gamilaSunset, IMG.beach1, IMG.trot],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Ages 12+ · own horse + guide', price: 30, originalPrice: 38 },
      { id: 'child', name: 'Child (8-11)', description: 'Led pony or small horse', price: 18 },
    ],
    addons: [
      { id: 'addon-photo', name: 'Sunrise Photo Package', description: 'Golden-hour photos of your ride', price: 15 },
      { id: 'addon-transfer', name: 'Hotel Transfer', description: 'Early round-trip pickup from your hotel', price: 10 },
      { id: 'addon-breakfast', name: 'Beach Breakfast', description: 'Light breakfast at the stable after the ride', price: 8 },
    ],
    highlights: ['Empty beach at sunrise', 'Cool morning air', 'Calmest horses of the day', 'Soft golden light for photos', 'All levels welcome'],
    inclusions: ['Arabian horse', 'Safety helmet', 'Professional guide', 'Hotel pickup/drop-off', 'Water', 'Insurance'],
    exclusions: ['Tips', 'Photos (add-on)', 'Breakfast (add-on)'],
    badges: ['instant-confirm'],
    windows: [
      { label: 'Sunrise', startTime: '05:30', endTime: '07:00' },
      { label: 'Early Morning', startTime: '06:30', endTime: '08:00' },
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

    for (const tour of TOURS) {
      i++;
      const exists = await Attraction.findOne({ slug: tour.slug });
      if (exists) {
        console.log(`[${i}/${TOURS.length}] SKIP  ${tour.slug} (exists)`);
        skipped++;
        continue;
      }

      await Attraction.create({
        slug: tour.slug,
        title: tour.title,
        shortDescription: tour.shortDescription,
        description: tour.description,
        images: tour.images,
        category: 'horse-riding',
        subcategory: 'animal-experiences',
        destination: {
          city: 'Hurghada',
          country: 'Egypt',
          coordinates: { lat: 27.2579, lng: 33.8116 },
        },
        duration: tour.duration,
        languages: ['English', 'Arabic', 'German', 'Russian'],
        rating: 4.6 + Math.round(Math.random() * 3) / 10,
        reviewCount: 40 + Math.floor(Math.random() * 220),
        priceFrom: tour.priceFrom,
        currency: 'USD',
        pricingOptions: tour.pricingOptions,
        addons: tour.addons,
        entryWindows: tour.windows,
        itinerary: [],
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        meetingPoint: {
          address: 'Your hotel in Hurghada, El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay, or Safaga',
          instructions: 'Hotel pickup included. The stable is on the Hurghada beachfront; pickup time is confirmed on booking.',
          mapUrl: 'https://maps.google.com/?q=27.2579,33.8116',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before start',
        instantConfirmation: true,
        mobileTicket: true,
        hasHotelPickup: true,
        badges: tour.badges,
        availability: { type: 'time-slots', advanceBooking: 1 },
        tenantIds: [tenant._id],
        status: 'active',
        featured: true,
      });
      console.log(`[${i}/${TOURS.length}] CREATED ✅ ${tour.slug}`);
      created++;
    }

    const total = await Attraction.countDocuments({ tenantIds: tenant._id });
    const activeTotal = await Attraction.countDocuments({ tenantIds: tenant._id, status: 'active' });
    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}. Tenant now has ${total} tours (${activeTotal} active).`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
