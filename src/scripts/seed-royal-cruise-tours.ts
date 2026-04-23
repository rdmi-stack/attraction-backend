/**
 * Seed Royal Cruise Hurghada tours from client's GetYourGuide catalog.
 * Generates images via gpt-image-1.5 + Cloudinary upload.
 *
 * Usage: railway run npx ts-node src/scripts/seed-royal-cruise-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Types } from 'mongoose';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'royal-cruise-hurghada';

const TOURS = [
  {
    slug: 'royal-cruise-elite-vip-dolphin-house-massage',
    title: 'All-Inclusive Elite VIP Dolphin House & Massage',
    shortDescription: 'Luxury VIP cruise to Dolphin House reef with snorkeling, dolphin swimming, onboard massage, and full lunch.',
    description: 'Experience the ultimate luxury sea trip in Hurghada. Board our elite VIP yacht and cruise to the famous Dolphin House reef where you can swim alongside wild dolphins in their natural habitat. Enjoy premium snorkeling over vibrant coral reefs, a relaxing onboard massage, and a gourmet lunch buffet with unlimited soft drinks. Skip-the-line access and hotel pickup included.',
    category: 'tours',
    duration: '7.5 hours',
    priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full VIP experience', price: 55 },
      { id: 'child', name: 'Child (6-12)', description: 'Full VIP experience', price: 35 },
    ],
    addons: [
      { id: 'diving', name: 'Intro Diving Session', description: 'Guided introductory scuba dive', price: 25 },
      { id: 'private-cabin', name: 'Private Cabin Upgrade', description: 'Private cabin on the yacht', price: 20 },
    ],
    highlights: ['Swim with wild dolphins at Dolphin House', 'Onboard relaxing massage', 'Premium snorkeling at coral reefs', 'Gourmet buffet lunch with unlimited drinks', 'VIP yacht with skip-the-line boarding'],
    inclusions: ['VIP yacht cruise', 'Dolphin House visit', 'Snorkeling gear', 'Onboard massage', 'Buffet lunch', 'Soft drinks', 'Hotel pickup & drop-off'],
    exclusions: ['Gratuities', 'Underwater photos', 'Alcoholic beverages'],
    imagePrompt: 'Luxury VIP yacht cruise near Hurghada Egypt, dolphins swimming alongside boat in crystal clear turquoise Red Sea, passengers enjoying on deck, sunny day.',
  },
  {
    slug: 'royal-cruise-luxury-orange-bay-lunch',
    title: 'Luxury Cruise Trip to Orange Bay with Lunch',
    shortDescription: 'Premium cruise to Orange Bay Island with snorkeling, swimming, beach time, and gourmet lunch on board.',
    description: 'Sail to the stunning Orange Bay Island on our luxury cruise. Enjoy crystal-clear waters, pristine white sand beaches, and world-class snorkeling over the coral reef. Relax on the sun deck or swim in the turquoise lagoon. A full gourmet lunch is served on board. Rated 4.9 stars by over 5,700 guests.',
    category: 'tours',
    duration: '8.5 hours',
    priceFrom: 45,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full cruise experience', price: 45 },
      { id: 'child', name: 'Child (6-12)', description: 'Full cruise experience', price: 30 },
    ],
    addons: [
      { id: 'massage', name: 'Onboard Massage', description: 'Relaxing massage during the cruise', price: 15 },
      { id: 'photos', name: 'Professional Photo Package', description: 'Underwater + on-deck photos', price: 10 },
    ],
    highlights: ['Orange Bay Island — pristine white sand beach', 'Snorkeling over coral reefs', 'Gourmet lunch buffet on board', 'Sun deck relaxation', 'Rated 4.9/5 by 5,700+ guests'],
    inclusions: ['Luxury cruise', 'Orange Bay visit', 'Snorkeling gear', 'Buffet lunch', 'Soft drinks', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Alcoholic beverages', 'Massage (available as add-on)'],
    imagePrompt: 'Luxury cruise yacht arriving at Orange Bay Island Hurghada Egypt, turquoise water, white sand beach, passengers snorkeling, sunny tropical day.',
  },
  {
    slug: 'royal-cruise-vip-orange-bay-lunch',
    title: 'Royal Luxury VIP Cruise to Orange Bay with Lunch',
    shortDescription: 'The VIP version of our Orange Bay cruise with premium yacht, exclusive beach area, and enhanced dining.',
    description: 'Our flagship Orange Bay experience. Board the Royal VIP yacht with exclusive lounge seating, dedicated crew, and a premium buffet. Enjoy private beach area access at Orange Bay, guided snorkeling at the best reef spots, and complimentary fruit platters and beverages throughout the day.',
    category: 'tours',
    duration: '8.5 hours',
    priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Royal VIP experience', price: 55 },
      { id: 'child', name: 'Child (6-12)', description: 'Royal VIP experience', price: 35 },
    ],
    addons: [
      { id: 'diving', name: 'Intro Diving', description: 'Guided scuba dive at the reef', price: 25 },
    ],
    highlights: ['Royal VIP yacht with exclusive lounge', 'Private beach area at Orange Bay', 'Premium buffet + fruit platters', 'Guided snorkeling at best spots', 'Dedicated crew service'],
    inclusions: ['Royal VIP yacht', 'Orange Bay private area', 'Snorkeling gear', 'Premium buffet', 'All beverages', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Underwater camera rental'],
    imagePrompt: 'Royal luxury VIP yacht deck with premium lounge seating, Red Sea turquoise waters, Orange Bay island in background, elegant passengers relaxing.',
  },
  {
    slug: 'royal-cruise-snorkeling-6in1-orange-bay-diving-massage',
    title: 'Snorkeling 6-in-1 to Orange Bay with Diving & Massage',
    shortDescription: 'The ultimate 6-in-1 package: Orange Bay, snorkeling, intro diving, massage, island visit, and lunch.',
    description: 'Our most popular combo package — six premium experiences in one unforgettable day. Cruise to Orange Bay, snorkel at two different reef sites, enjoy an introductory dive, get a relaxing onboard massage, visit the island beach, and feast on a gourmet lunch. Everything included in one price.',
    category: 'tours',
    duration: '8.5 hours',
    priceFrom: 65,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: '6-in-1 package', price: 65 },
      { id: 'child', name: 'Child (8-12)', description: 'Snorkeling only (no dive)', price: 40 },
    ],
    addons: [
      { id: 'private-dive', name: 'Private Dive Guide', description: 'One-on-one dive instructor', price: 20 },
    ],
    highlights: ['6 activities in 1 day', 'Orange Bay + 2 snorkeling sites', 'Intro diving session included', 'Onboard massage included', 'Gourmet lunch + unlimited drinks'],
    inclusions: ['Cruise', 'Orange Bay visit', 'Snorkeling at 2 sites', 'Intro diving', 'Massage', 'Lunch', 'All drinks', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Underwater photos'],
    imagePrompt: 'Snorkeling and diving in Red Sea coral reef near Hurghada Egypt, colorful tropical fish, crystal clear water, divers and snorkelers together.',
  },
  {
    slug: 'royal-cruise-luxury-diving-snorkeling-island-massage',
    title: 'Luxury Diving & Snorkeling with Island, Lunch & Massage',
    shortDescription: 'Premium diving and snorkeling trip with island beach visit, gourmet lunch, and relaxing massage.',
    description: 'A luxury day at sea combining the best of diving and snorkeling. Visit pristine coral reefs for a guided introductory dive and snorkeling session, then relax on a secluded island beach. Enjoy a gourmet lunch buffet and a soothing massage on the yacht before returning to harbor.',
    category: 'tours',
    duration: '8 hours',
    priceFrom: 60,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full diving + snorkeling', price: 60 },
      { id: 'child', name: 'Child (8-12)', description: 'Snorkeling only', price: 35 },
    ],
    addons: [
      { id: 'extra-dive', name: 'Second Dive', description: 'Additional guided dive at another reef', price: 20 },
    ],
    highlights: ['Guided intro dive at coral reef', 'Snorkeling at multiple sites', 'Secluded island beach visit', 'Onboard massage', 'Gourmet buffet lunch'],
    inclusions: ['Luxury yacht', 'Dive equipment', 'Snorkeling gear', 'Island visit', 'Massage', 'Lunch', 'Drinks', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Dive certification fee'],
    imagePrompt: 'Luxury diving boat in Red Sea Hurghada, scuba divers entering water, coral reef visible below, yacht with sun deck, professional diving equipment.',
  },
  {
    slug: 'royal-cruise-orange-bay-snorkeling-massage-diving',
    title: 'Luxury Orange Bay with Snorkeling, Massage and Diving',
    shortDescription: 'Premium Orange Bay day trip combining snorkeling, intro diving, relaxing massage, and beach time.',
    description: 'Experience Orange Bay the luxury way. This all-inclusive trip combines the beautiful Orange Bay beach with premium snorkeling, an introductory dive at a coral reef, and a relaxing onboard massage. All meals and beverages included on our luxury yacht.',
    category: 'tours',
    duration: '8.5 hours',
    priceFrom: 60,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full package', price: 60 },
      { id: 'child', name: 'Child (8-12)', description: 'Snorkeling + beach only', price: 35 },
    ],
    addons: [
      { id: 'jet-ski', name: 'Jet Ski at Orange Bay', description: '15 minutes jet ski at the bay', price: 20 },
    ],
    highlights: ['Orange Bay beach + snorkeling', 'Intro dive at coral reef', 'Relaxing onboard massage', 'All-inclusive lunch & drinks', 'Luxury yacht experience'],
    inclusions: ['Luxury yacht', 'Orange Bay access', 'Snorkeling + diving gear', 'Massage', 'Lunch', 'All drinks', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Water sports extras'],
    imagePrompt: 'Luxury yacht at Orange Bay Hurghada, passengers enjoying massage on deck, turquoise lagoon with snorkelers, white sand beach in background.',
  },
  {
    slug: 'royal-cruise-royal-orange-bay-massage-snorkeling',
    title: 'Royal Orange Bay with Massage, Snorkeling & Lunch',
    shortDescription: 'The Royal experience at Orange Bay — premium snorkeling, onboard massage, and a lavish lunch.',
    description: 'Our Royal-grade Orange Bay trip on the finest yacht in our fleet. Enjoy premium snorkeling gear, a dedicated snorkeling guide, a 30-minute onboard massage, and our signature Royal lunch buffet. Sail in style with the best views of the Red Sea coast.',
    category: 'tours',
    duration: '8.5 hours',
    priceFrom: 50,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Royal experience', price: 50 },
      { id: 'child', name: 'Child (6-12)', description: 'Royal experience', price: 30 },
    ],
    addons: [
      { id: 'parasailing', name: 'Parasailing Add-on', description: 'Parasailing at the bay', price: 25 },
    ],
    highlights: ['Royal-grade yacht — our best vessel', '30-minute onboard massage', 'Guided premium snorkeling', 'Signature Royal lunch buffet', 'Scenic Red Sea sailing'],
    inclusions: ['Royal yacht', 'Orange Bay visit', 'Snorkeling gear + guide', 'Massage', 'Lunch buffet', 'All beverages', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Parasailing (available as add-on)'],
    imagePrompt: 'Royal yacht sailing on Red Sea near Hurghada Egypt, elegant white vessel, passengers on sun deck, coral reef visible in clear water below.',
  },
  {
    slug: 'royal-cruise-orange-giftun-island-massage-lunch',
    title: 'Orange & Giftun Island Cruise with Massage & Lunch',
    shortDescription: 'Visit both Orange Bay AND Giftun Island in one luxury cruise with massage and full lunch.',
    description: 'The best of both worlds — visit Orange Bay and Giftun Island in a single luxury cruise. Snorkel at two different reef ecosystems, relax on two stunning beaches, enjoy an onboard massage, and feast on a full buffet lunch. The most comprehensive sea trip from Hurghada.',
    category: 'tours',
    duration: '8.5 hours',
    priceFrom: 50,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Dual island cruise', price: 50 },
      { id: 'child', name: 'Child (6-12)', description: 'Dual island cruise', price: 30 },
    ],
    addons: [
      { id: 'diving', name: 'Intro Dive at Giftun', description: 'Guided dive at Giftun reef', price: 25 },
    ],
    highlights: ['Two islands in one trip', 'Orange Bay + Giftun Island', 'Snorkeling at two reef systems', 'Onboard massage', 'Full buffet lunch on yacht'],
    inclusions: ['Luxury cruise', 'Orange Bay visit', 'Giftun Island visit', 'Snorkeling gear', 'Massage', 'Lunch', 'All drinks', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Diving (available as add-on)'],
    imagePrompt: 'Cruise yacht between Orange Bay and Giftun Island Hurghada, two tropical islands visible, crystal turquoise sea, snorkelers in water.',
  },
  {
    slug: 'royal-cruise-luxury-giftun-snorkeling-massage',
    title: 'Luxury Giftun Island with Snorkeling, Lunch & Massage',
    shortDescription: 'Premium cruise to Giftun Island National Park with snorkeling, lunch, and relaxing massage.',
    description: 'Cruise to the protected Giftun Island National Park on our luxury yacht. Snorkel over pristine coral gardens in crystal-clear waters, relax on the island beach, enjoy an onboard massage, and feast on a fresh buffet lunch. Small group sizes for a premium experience.',
    category: 'tours',
    duration: '8 hours',
    priceFrom: 40,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full Giftun experience', price: 40 },
      { id: 'child', name: 'Child (6-12)', description: 'Full Giftun experience', price: 25 },
    ],
    addons: [
      { id: 'glass-boat', name: 'Glass Bottom Boat', description: 'See reefs without swimming', price: 10 },
    ],
    highlights: ['Giftun Island National Park', 'Pristine coral garden snorkeling', 'Island beach relaxation', 'Onboard massage', 'Small group — premium experience'],
    inclusions: ['Luxury yacht', 'Giftun Island entry', 'Snorkeling gear', 'Massage', 'Lunch', 'All drinks', 'Hotel transfers'],
    exclusions: ['Gratuities', 'National park tip'],
    imagePrompt: 'Luxury yacht anchored at Giftun Island Hurghada Egypt, crystal clear turquoise water, white sand beach, passengers snorkeling near coral reef.',
  },
  {
    slug: 'royal-cruise-luxury-private-yacht-trip',
    title: 'Luxury Private Yacht Trip with Lunch & Activities',
    shortDescription: 'Exclusive private yacht charter for your group with snorkeling, fishing, lunch, and water activities.',
    description: 'Charter an entire luxury yacht for your private group. Choose your route — Orange Bay, Giftun Island, or the open sea. Enjoy snorkeling, fishing, water activities, a private chef lunch, and unlimited beverages. Perfect for celebrations, corporate events, or family days.',
    category: 'tours',
    duration: '7.5 hours',
    priceFrom: 350,
    pricingOptions: [
      { id: 'group', name: 'Private Yacht (up to 10)', description: 'Entire yacht for your group', price: 350 },
      { id: 'extra-guest', name: 'Extra Guest (11+)', description: 'Per additional guest', price: 30 },
    ],
    addons: [
      { id: 'dj', name: 'DJ & Sound System', description: 'Party music on board', price: 50 },
      { id: 'cake', name: 'Celebration Cake', description: 'Custom cake for your event', price: 25 },
      { id: 'jet-ski', name: 'Jet Ski (30 min)', description: 'Jet ski available at anchor point', price: 30 },
    ],
    highlights: ['Entire private yacht for your group', 'Choose your route and schedule', 'Private chef lunch + unlimited drinks', 'Snorkeling, fishing, water activities included', 'Perfect for celebrations & events'],
    inclusions: ['Private luxury yacht', 'Captain + crew', 'Snorkeling gear', 'Fishing equipment', 'Private chef lunch', 'Unlimited beverages', 'Hotel transfers'],
    exclusions: ['Gratuities', 'DJ/entertainment (available as add-on)'],
    imagePrompt: 'Luxury private yacht charter Hurghada Red Sea, elegant white yacht anchored in turquoise water, guests dining on deck, sunset light.',
  },
];

async function main(): Promise<void> {
  await connectDatabase();

  try {
    const tenant = await Tenant.findOne({ slug: TENANT_SLUG });
    if (!tenant) {
      console.error(`Tenant '${TENANT_SLUG}' not found.`);
      process.exitCode = 1;
      return;
    }
    console.log(`Tenant: ${tenant.name} (_id=${tenant._id})\n`);

    let created = 0;
    let skipped = 0;

    for (const tour of TOURS) {
      const exists = await Attraction.findOne({ slug: tour.slug });
      if (exists) {
        console.log(`SKIP  ${tour.slug} (exists)`);
        skipped++;
        continue;
      }

      console.log(`[${created + skipped + 1}/${TOURS.length}] ${tour.title}`);

      // Generate image via gpt-image-1.5
      let imageUrl = 'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/placeholder.jpg';
      try {
        console.log(`  Generating image...`);
        const { base64, mimeType } = await generateImageFromPrompt({
          prompt: tour.imagePrompt,
          size: '1536x1024',
          quality: 'medium',
          outputFormat: 'jpeg',
        });
        const dataUri = `data:${mimeType};base64,${base64}`;
        const uploaded = await uploadBase64Image(dataUri, `tours/${tour.slug}`);
        imageUrl = uploaded.url;
        console.log(`  ✅ ${imageUrl}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ⚠️ Image failed: ${msg} — using placeholder`);
      }

      await Attraction.create({
        slug: tour.slug,
        title: tour.title,
        shortDescription: tour.shortDescription,
        description: tour.description,
        images: [imageUrl],
        category: tour.category,
        destination: {
          city: 'Hurghada',
          country: 'Egypt',
          coordinates: { lat: 27.2579, lng: 33.8116 },
        },
        duration: tour.duration,
        languages: ['English', 'Arabic', 'German', 'Russian'],
        rating: 4.7 + Math.round(Math.random() * 3) / 10,
        reviewCount: 50 + Math.floor(Math.random() * 200),
        priceFrom: tour.priceFrom,
        currency: 'USD',
        pricingOptions: tour.pricingOptions,
        addons: tour.addons,
        entryWindows: [
          { label: 'Morning Departure', startTime: '08:00', endTime: '08:30' },
          { label: 'Late Morning', startTime: '09:30', endTime: '10:00' },
        ],
        itinerary: [],
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        meetingPoint: {
          address: 'Hotel lobby pickup or Hurghada New Marina S14',
          instructions: 'Our driver will collect you from your hotel lobby. Marina meeting point: Hurghada New Marina, Stand 14.',
          mapUrl: 'https://maps.google.com/?q=27.2579,33.8116',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'free-cancellation', 'instant-confirm'],
        availability: { type: 'time-slots', advanceBooking: 30 },
        tenantIds: [tenant._id],
        status: 'active',
        featured: true,
      });
      console.log(`  CREATED ✅\n`);
      created++;

      // Rate limit pause
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
    console.log(`Total Royal Cruise tours: ${13 + created}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
