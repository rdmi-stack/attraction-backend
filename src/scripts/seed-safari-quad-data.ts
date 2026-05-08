/**
 * Seeds reviews, sample bookings, and special offers for Safari Sahara
 * Hurghada and Quad Tour Safari so their dashboards / homepage social proof /
 * deals page have realistic data instead of empty states.
 *
 * Idempotent: deletes existing seeded records for each tenant first, then
 * recreates. Run with:  npx tsx src/scripts/seed-safari-quad-data.ts
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Review } from '../models/Review';
import { Booking } from '../models/Booking';
import { SpecialOffer } from '../models/SpecialOffer';
import { generateBookingReference } from '../utils/hash';

const log = (...args: unknown[]) => console.log('[seed-data]', ...args);

const REVIEW_AUTHORS = [
  { name: 'Marie L.', country: 'France' },
  { name: 'Klaus W.', country: 'Germany' },
  { name: 'Anya K.', country: 'Russia' },
  { name: 'Lukas M.', country: 'Austria' },
  { name: 'Sofia R.', country: 'Italy' },
  { name: 'Hassan K.', country: 'Saudi Arabia' },
  { name: 'Emma B.', country: 'United Kingdom' },
  { name: 'Diego F.', country: 'Spain' },
  { name: 'Julia P.', country: 'Czech Republic' },
  { name: 'Mehmet T.', country: 'Turkey' },
  { name: 'Ahmed N.', country: 'Egypt' },
  { name: 'Olivier D.', country: 'Belgium' },
];

const REVIEW_TEMPLATES = [
  { title: 'Best ride of our trip', body: 'Felt the desert at full throttle. Guides were total pros, gear was new, sunset over the dunes was unreal. Already telling friends to book.' },
  { title: 'Worth every penny', body: 'Booked a private tour for our anniversary. Two hours of pure adrenaline followed by a Bedouin dinner. Felt like Mad Max.' },
  { title: 'Perfect family activity', body: 'We had a 9-year-old with us and she did the kid-sized quad. The team made sure everyone was safe and had a blast. Hotel pickup was on time.' },
  { title: 'Real, not staged', body: 'I’ve done desert tours in Dubai before — those were tourist factories. This was the opposite: small group, real local guides, off-the-beaten-track routes.' },
  { title: 'Sunrise tour was incredible', body: 'Booked the sunrise quad ride and it was magic. Empty desert, golden light, perfect quiet. Best photo I’ve taken on the trip.' },
  { title: 'Would 100% do again', body: 'Pickup from El Gouna was on time, gear was clean, briefing was thorough. The trail had real variety — dunes, rocky bits, an open canyon. Loved it.' },
  { title: 'Polaris RZR was insane', body: 'Upgraded to the RZR and it was worth every dollar. Way more power than the quads, my partner couldn’t stop laughing.' },
  { title: 'BBQ dinner was a highlight', body: 'The desert ride was great but the Bedouin BBQ at the end stole the show. Real fire, fresh food, stargazing — perfect way to end the day.' },
  { title: 'Professional and safe', body: 'Helmets and goggles for everyone, full safety briefing, guides ride alongside the group. Felt confident the whole way.' },
  { title: 'Brand new equipment', body: 'I was worried about old beat-up quads but no — these were spotless and serviced. Even the helmets felt new. Big difference.' },
];

const BOOKING_GUESTS = [
  { firstName: 'Marie', lastName: 'Lefebvre', email: 'marie.l@example.com', phone: '+33 612 345 678', country: 'France' },
  { firstName: 'Klaus', lastName: 'Wagner', email: 'klaus.w@example.com', phone: '+49 170 1234567', country: 'Germany' },
  { firstName: 'Anya', lastName: 'Kuznetsova', email: 'anya.k@example.com', phone: '+7 911 234 5678', country: 'Russia' },
  { firstName: 'Lukas', lastName: 'Mayer', email: 'lukas.m@example.com', phone: '+43 660 1234567', country: 'Austria' },
  { firstName: 'Sofia', lastName: 'Ricci', email: 'sofia.r@example.com', phone: '+39 333 1234567', country: 'Italy' },
  { firstName: 'Hassan', lastName: 'Al-Khaled', email: 'hassan.k@example.com', phone: '+966 50 123 4567', country: 'Saudi Arabia' },
  { firstName: 'Emma', lastName: 'Brown', email: 'emma.b@example.com', phone: '+44 7700 900123', country: 'United Kingdom' },
  { firstName: 'Diego', lastName: 'Fernández', email: 'diego.f@example.com', phone: '+34 600 123 456', country: 'Spain' },
];

const TENANT_SLUGS = ['safari-sahara-hurghada', 'quad-tour-safari'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** YYYY-MM-DD shifted by `dayOffset` from today */
function dateOffset(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

async function seedTenant(tenantSlug: string): Promise<void> {
  log(`\n═════════ ${tenantSlug} ═════════`);
  const tenant = await Tenant.findOne({ slug: tenantSlug });
  if (!tenant) {
    log(`⚠ tenant not found, skipping`);
    return;
  }
  log(`✓ tenant ${tenant._id} · ${tenant.name}`);

  const attractions = await Attraction.find({
    tenantIds: { $in: [tenant._id] },
    status: 'active',
  });
  log(`✓ ${attractions.length} attractions found`);
  if (attractions.length === 0) return;

  // ── Wipe previously-seeded records so reruns are idempotent ────────────
  await Review.deleteMany({ attractionId: { $in: attractions.map((a) => a._id) } });
  await Booking.deleteMany({ tenantId: tenant._id });
  await SpecialOffer.deleteMany({ attractionId: { $in: attractions.map((a) => a._id) } });
  log(`🗑  cleared existing reviews / bookings / offers`);

  // ── Reviews: 5–8 per attraction, all approved ──────────────────────────
  const reviews: unknown[] = [];
  for (const attr of attractions) {
    const count = randomInt(5, 8);
    for (let i = 0; i < count; i++) {
      const author = pick(REVIEW_AUTHORS);
      const template = pick(REVIEW_TEMPLATES);
      const rating = Math.random() < 0.85 ? 5 : Math.random() < 0.5 ? 4 : 3;
      reviews.push({
        attractionId: attr._id,
        author: author.name,
        country: author.country,
        rating,
        title: template.title,
        content: template.body,
        verified: true,
        helpful: randomInt(0, 30),
        status: 'approved',
        createdAt: new Date(Date.now() - randomInt(1, 180) * 24 * 60 * 60 * 1000),
      });
    }
  }
  await Review.insertMany(reviews);
  log(`✓ ${reviews.length} reviews seeded across ${attractions.length} tours`);

  // ── Special offers: 2–3 active offers across the catalog ───────────────
  const offerTargets = attractions.slice(0, Math.min(3, attractions.length));
  const offerTitles = [
    { t: 'Early Bird Special', d: 'Book 14 days ahead and save', pct: 20 },
    { t: 'Weekday Deal', d: 'Sun – Thu departures only', pct: 15 },
    { t: 'Group of 4+', d: 'Bring three friends, save together', pct: 25 },
  ];
  const validFrom = new Date();
  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 3);
  const offers = offerTargets.map((attr, i) => ({
    attractionId: attr._id,
    title: offerTitles[i].t,
    description: offerTitles[i].d,
    discountType: 'percentage' as const,
    discountValue: offerTitles[i].pct,
    validFrom,
    validUntil,
    usageLimit: 100,
    usageCount: randomInt(5, 35),
    isActive: true,
  }));
  await SpecialOffer.insertMany(offers);
  log(`✓ ${offers.length} special offers seeded`);

  // ── Sample bookings: 12–18 across statuses to populate dashboard analytics ─
  const bookings: unknown[] = [];
  const statuses: Array<{ status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; payment: 'pending' | 'succeeded' | 'failed' }> = [
    { status: 'completed', payment: 'succeeded' },
    { status: 'completed', payment: 'succeeded' },
    { status: 'completed', payment: 'succeeded' },
    { status: 'completed', payment: 'succeeded' },
    { status: 'confirmed', payment: 'succeeded' },
    { status: 'confirmed', payment: 'succeeded' },
    { status: 'confirmed', payment: 'pending' },
    { status: 'confirmed', payment: 'pending' },
    { status: 'pending', payment: 'pending' },
    { status: 'pending', payment: 'pending' },
    { status: 'cancelled', payment: 'failed' },
    { status: 'completed', payment: 'succeeded' },
  ];
  for (let i = 0; i < statuses.length; i++) {
    const attr = pick(attractions);
    const guest = pick(BOOKING_GUESTS);
    const adults = randomInt(1, 3);
    const children = Math.random() < 0.4 ? randomInt(0, 2) : 0;
    const opt = attr.pricingOptions?.[0] || { id: 'adult', name: 'Adult', price: attr.priceFrom };
    const unitPrice = opt.price ?? attr.priceFrom;
    const subtotal = unitPrice * adults + unitPrice * 0.6 * children;
    // Spread date offsets: completed bookings in past, confirmed in future, pending mixed.
    const offset = statuses[i].status === 'completed'
      ? -randomInt(7, 90)
      : statuses[i].status === 'confirmed'
      ? randomInt(2, 45)
      : randomInt(-15, 30);
    bookings.push({
      reference: generateBookingReference(),
      tenantId: tenant._id,
      attractionId: attr._id,
      items: [{
        optionId: opt.id,
        optionName: opt.name,
        date: dateOffset(offset),
        quantities: { adults, children, infants: 0 },
        unitPrice,
        totalPrice: subtotal,
      }],
      guestDetails: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        country: guest.country,
      },
      subtotal,
      fees: 0,
      discount: 0,
      total: subtotal,
      currency: 'USD',
      paymentMethod: Math.random() < 0.5 ? 'pay-later' : 'card',
      paymentStatus: statuses[i].payment,
      status: statuses[i].status,
      createdAt: new Date(Date.now() - randomInt(1, 120) * 24 * 60 * 60 * 1000),
    });
  }
  await Booking.insertMany(bookings);
  log(`✓ ${bookings.length} sample bookings seeded`);
}

async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in env');
  await mongoose.connect(uri);
  log(`✓ MongoDB connected`);
}

(async () => {
  await connectDb();
  try {
    for (const slug of TENANT_SLUGS) {
      await seedTenant(slug);
    }
  } finally {
    await mongoose.disconnect();
  }
  log('\n✨ All done.');
  process.exit(0);
})().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
