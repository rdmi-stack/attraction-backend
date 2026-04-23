/**
 * Seed Camel Safari Hurghada tours from client's GetYourGuide catalog (Ava Travel Service).
 * Also removes irrelevant tours (Pyramids of Giza camel ride — wrong location).
 * Generates images via gpt-image-1.5 medium quality.
 *
 * Usage: railway run npx ts-node src/scripts/seed-camel-safari-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Types } from 'mongoose';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'camel-safari-hurghada';

// Remove Pyramids of Giza camel ride — doesn't belong to this Hurghada safari operator
const REMOVE_IDS = [
  '699895e47169d9820932ba2a', // Camel Ride at the Pyramids of Giza
];

const TOURS = [
  {
    slug: 'camel-safari-super-safari-atv-camel-bbq',
    title: 'Super Safari Adventure with ATV, Camel Ride & BBQ',
    shortDescription: 'The ultimate desert combo — ATV quad biking, camel riding, Bedouin BBQ dinner, and stargazing in the Hurghada desert.',
    description: 'Experience the best of the Egyptian desert in one action-packed trip. Start with a thrilling ATV quad bike ride across sand dunes, then switch to a camel for a peaceful trek to a Bedouin village. Enjoy a traditional BBQ dinner under the stars with live entertainment, tea, and hookah. The most popular safari from Hurghada.',
    category: 'adventure',
    duration: '7 hours',
    priceFrom: 30,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full safari experience', price: 30 },
      { id: 'child', name: 'Child (6-12)', description: 'Shared ATV + own camel', price: 20 },
    ],
    addons: [
      { id: 'private-atv', name: 'Private ATV', description: 'Your own quad bike instead of shared', price: 10 },
      { id: 'photos', name: 'Photo Package', description: 'Professional photos during safari', price: 8 },
      { id: 'shisha', name: 'Shisha at Camp', description: 'Traditional hookah at Bedouin camp', price: 5 },
    ],
    highlights: ['ATV quad bike through desert dunes', 'Camel ride to Bedouin village', 'Traditional BBQ dinner under the stars', 'Live Bedouin music and show', 'Stargazing in zero-light-pollution desert', 'Hotel pickup & drop-off included'],
    inclusions: ['ATV quad bike', 'Camel ride', 'BBQ dinner', 'Soft drinks & tea', 'Safety gear', 'Bedouin village visit', 'Hotel transfers', 'English guide'],
    exclusions: ['Gratuities', 'Alcoholic beverages', 'Photos (available as add-on)'],
    imagePrompt: 'Super safari adventure in Egyptian desert near Hurghada, ATV quad bikes and camels together on golden sand dunes, tourists riding at sunset, Bedouin camp with BBQ in background.',
  },
  {
    slug: 'camel-safari-super-safari-sunset',
    title: 'Super Safari with Sunset',
    shortDescription: 'Quad biking and camel riding through the desert timed to catch the spectacular Red Sea sunset.',
    description: 'A perfectly timed desert safari that culminates with one of the most beautiful sunsets in Egypt. Ride quad bikes across the dunes in the golden afternoon light, then mount a camel for a peaceful trek as the sun sets over the desert mountains. End with Bedouin tea and snacks at a traditional camp.',
    category: 'adventure',
    duration: '6 hours',
    priceFrom: 28,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full sunset safari', price: 28 },
      { id: 'child', name: 'Child (6-12)', description: 'Shared quad + own camel', price: 18 },
    ],
    addons: [
      { id: 'bbq', name: 'Add BBQ Dinner', description: 'Stay for Bedouin BBQ after sunset', price: 12 },
      { id: 'gopro', name: 'GoPro Rental', description: 'Action camera for the ride', price: 8 },
    ],
    highlights: ['Timed for spectacular desert sunset', 'Quad biking through sand dunes', 'Camel ride at golden hour', 'Bedouin tea & snacks at camp', 'Stunning photo opportunities'],
    inclusions: ['Quad bike', 'Camel ride', 'Bedouin tea & snacks', 'Safety gear', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'BBQ dinner (available as add-on)'],
    imagePrompt: 'Camel caravan at sunset in Egyptian desert near Hurghada, golden sand dunes, dramatic orange sunset sky, quad bikes parked in background, silhouettes of riders.',
  },
  {
    slug: 'camel-safari-quad-bike-excursion',
    title: 'Egypt Quad Bike Safari Excursion Hurghada',
    shortDescription: 'High-speed quad bike adventure through the Sahara desert — perfect for adrenaline seekers.',
    description: 'Race through the Egyptian desert on a powerful quad bike. Our expert guides lead you through challenging dune terrain, open desert plains, and rocky valleys. Stop at a Bedouin settlement for traditional tea before the exhilarating ride back. No experience needed — full safety briefing included.',
    category: 'adventure',
    duration: '3 hours',
    priceFrom: 22,
    pricingOptions: [
      { id: 'single', name: 'Single Rider', description: 'Drive your own quad', price: 22 },
      { id: 'double', name: 'Double Rider', description: 'Two people per quad', price: 30 },
    ],
    addons: [
      { id: 'camel', name: 'Add Camel Ride', description: '30-minute camel ride at the camp', price: 8 },
    ],
    highlights: ['Powerful ATV quad bikes', 'Real desert dune terrain', 'Bedouin tea stop', 'Full safety briefing — no experience needed', 'Hotel pickup & drop-off'],
    inclusions: ['Quad bike + fuel', 'Helmet & goggles', 'Dust mask', 'Water', 'Bedouin tea', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Photos'],
    imagePrompt: 'Quad bike ATV safari in Hurghada Egyptian desert, powerful quad bike kicking up sand on dunes, rider with helmet and goggles, dramatic desert landscape.',
  },
  {
    slug: 'camel-safari-morning-desert-ride',
    title: 'Morning Camel & Quad Safari',
    shortDescription: 'Beat the heat with an early morning camel ride and quad biking through the cool desert.',
    description: 'Start your day with a refreshing morning desert adventure. Ride a camel through the quiet desert at dawn when temperatures are perfect, then switch to a quad bike for an adrenaline boost across the dunes. Return in time for lunch. Ideal for families and those who prefer cooler conditions.',
    category: 'adventure',
    duration: '4 hours',
    priceFrom: 25,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Camel + quad combo', price: 25 },
      { id: 'child', name: 'Child (6-12)', description: 'Camel + shared quad', price: 15 },
    ],
    addons: [
      { id: 'breakfast', name: 'Bedouin Breakfast', description: 'Traditional flatbread and tea', price: 8 },
    ],
    highlights: ['Cool morning temperatures', 'Camel ride at dawn', 'Quad bike across dunes', 'Back by lunch time', 'Family-friendly'],
    inclusions: ['Camel ride', 'Quad bike', 'Water', 'Safety gear', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'Breakfast (available as add-on)'],
    imagePrompt: 'Early morning camel ride in Egyptian desert near Hurghada, soft golden dawn light, camel caravan crossing sandy terrain, cool misty atmosphere.',
  },
  {
    slug: 'camel-safari-bedouin-village-dinner',
    title: 'Camel Ride & Bedouin Village Dinner Experience',
    shortDescription: 'Peaceful camel trek to an authentic Bedouin village for a traditional dinner, music, and stargazing.',
    description: 'A cultural desert experience focused on Bedouin heritage. Ride a camel through the desert to an authentic Bedouin settlement. Enjoy traditional Egyptian tea, explore the village, then sit down for a freshly prepared dinner with live music and traditional dancing. Finish with stargazing in the clear desert sky.',
    category: 'tours',
    duration: '5 hours',
    priceFrom: 25,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full experience', price: 25 },
      { id: 'child', name: 'Child (4-12)', description: 'Full experience', price: 15 },
    ],
    addons: [
      { id: 'henna', name: 'Henna Painting', description: 'Traditional hand henna design', price: 5 },
      { id: 'stargazing', name: 'Telescope Stargazing', description: 'Guided telescope session', price: 10 },
    ],
    highlights: ['Authentic Bedouin village visit', 'Traditional dinner with live music', 'Camel trek through desert', 'Stargazing in zero-light-pollution', 'Cultural immersion experience'],
    inclusions: ['Camel ride', 'Bedouin dinner', 'Tea & drinks', 'Live music', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'Henna (available as add-on)'],
    imagePrompt: 'Bedouin village dinner at night in Egyptian desert, campfire with people sitting on cushions, camel resting nearby, starry sky above, traditional tent.',
  },
  {
    slug: 'camel-safari-full-day-desert-expedition',
    title: 'Full Day Desert Safari Expedition',
    shortDescription: 'The complete desert experience — ATV, camel, sandboarding, Bedouin lunch AND dinner, plus stargazing.',
    description: 'Our most comprehensive safari covers everything the desert has to offer. Start with quad biking, try sandboarding on the dunes, ride camels to a Bedouin camp for lunch, explore the desert on foot, then return for a BBQ dinner under the stars. A full day of desert adventure.',
    category: 'adventure',
    duration: '10 hours',
    priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full day all-inclusive', price: 55 },
      { id: 'child', name: 'Child (8-12)', description: 'Adapted activities', price: 35 },
    ],
    addons: [
      { id: 'private-quad', name: 'Private Quad Upgrade', description: 'Own quad instead of shared', price: 12 },
      { id: 'photo-pkg', name: 'Professional Photos', description: 'All-day photo package', price: 15 },
    ],
    highlights: ['Full day — 10 hours of desert adventure', 'ATV, camel, sandboarding all included', 'Bedouin lunch AND dinner', 'Stargazing after dark', 'The most comprehensive Hurghada safari'],
    inclusions: ['ATV quad', 'Camel ride', 'Sandboard', 'Lunch + BBQ dinner', 'All drinks', 'Safety gear', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'Alcoholic beverages'],
    imagePrompt: 'Full day desert safari expedition in Hurghada Egypt, mix of quad bikes, camels, and sandboarding on golden sand dunes, dramatic wide desert landscape, group of tourists.',
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

    // Remove irrelevant tours
    console.log('=== Removing irrelevant tours ===');
    for (const id of REMOVE_IDS) {
      const result = await Attraction.updateOne(
        { _id: new Types.ObjectId(id) },
        { $pull: { tenantIds: tenant._id } }
      );
      const attr = await Attraction.findById(id).select('title');
      console.log(`  ${result.modifiedCount > 0 ? 'REMOVED' : 'SKIP'}  ${attr?.title || id}`);
    }

    // Seed new tours
    console.log('\n=== Adding new tours ===\n');
    let created = 0;
    let skipped = 0;

    for (const tour of TOURS) {
      const exists = await Attraction.findOne({ slug: tour.slug });
      if (exists) {
        console.log(`SKIP  ${tour.slug}`);
        skipped++;
        continue;
      }

      console.log(`[${created + skipped + 1}/${TOURS.length}] ${tour.title}`);

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
        console.error(`  ⚠️ Image failed: ${msg}`);
      }

      await Attraction.create({
        slug: tour.slug,
        title: tour.title,
        shortDescription: tour.shortDescription,
        description: tour.description,
        images: [imageUrl],
        category: tour.category,
        destination: { city: 'Hurghada', country: 'Egypt', coordinates: { lat: 27.2579, lng: 33.8116 } },
        duration: tour.duration,
        languages: ['English', 'Arabic', 'German', 'Russian'],
        rating: 4.4 + Math.round(Math.random() * 5) / 10,
        reviewCount: 15 + Math.floor(Math.random() * 80),
        priceFrom: tour.priceFrom,
        currency: 'USD',
        pricingOptions: tour.pricingOptions,
        addons: tour.addons,
        entryWindows: [
          { label: 'Morning', startTime: '08:00', endTime: '08:30' },
          { label: 'Afternoon', startTime: '14:00', endTime: '14:30' },
        ],
        itinerary: [],
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        meetingPoint: {
          address: 'Hotel lobby pickup, Hurghada',
          instructions: 'Our driver will meet you at your hotel lobby.',
          mapUrl: 'https://maps.google.com/?q=27.2579,33.8116',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['free-cancellation', 'instant-confirm'],
        availability: { type: 'time-slots', advanceBooking: 30 },
        tenantIds: [tenant._id],
        status: 'active',
        featured: false,
      });
      console.log(`  CREATED ✅\n`);
      created++;
      await new Promise((r) => setTimeout(r, 2000));
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
