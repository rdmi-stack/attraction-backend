/**
 * Seed Desert Fox Safari tours from client's GetYourGuide catalog (Wild Desert Safari).
 * Removes irrelevant tours, adds client-specific products.
 * Generates images via gpt-image-1.5 medium quality.
 *
 * Usage: railway run npx ts-node src/scripts/seed-desert-fox-wild-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Types } from 'mongoose';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'desert-fox-safari';

const REMOVE_IDS = [
  '699895e47169d9820932b9e8', // Horse Riding on Hurghada Beach — not desert safari
];

const TOURS = [
  {
    slug: 'wild-desert-quad-atv-camel-bbq',
    title: 'Desert Quad Bike, ATV, Camel Ride & Optional BBQ',
    shortDescription: 'Our #1 bestseller — quad bike across dunes, ride a camel, and optionally stay for a Bedouin BBQ dinner.',
    description: 'The most popular desert safari from Hurghada with 1,800+ five-star reviews. Ride a powerful quad bike (ATV) across real desert dunes, then switch to a camel for a peaceful trek through the golden landscape. Choose to extend your trip with an authentic Bedouin BBQ dinner under the stars with live entertainment. Skip-the-line and hotel pickup included.',
    category: 'adventure', duration: '4 hours', priceFrom: 28,
    pricingOptions: [
      { id: 'standard', name: 'Quad + Camel (3 hrs)', description: 'Quad bike and camel ride — no dinner', price: 28 },
      { id: 'bbq', name: 'Quad + Camel + BBQ Dinner (5 hrs)', description: 'Full experience with Bedouin dinner', price: 38 },
      { id: 'private', name: 'Private Quad + Camel + BBQ', description: 'Private group experience', price: 55 },
    ],
    addons: [
      { id: 'buggy-upgrade', name: 'Dune Buggy Upgrade', description: 'Upgrade from quad to dune buggy', price: 15 },
      { id: 'photos', name: 'Photo Package', description: 'Professional desert photos', price: 8 },
      { id: 'shisha', name: 'Shisha at Camp', description: 'Traditional hookah', price: 5 },
    ],
    itinerary: [
      { time: '14:00', duration: '30 min', title: 'Hotel Pickup & Briefing', description: 'Pickup and safety instructions at desert camp.' },
      { time: '14:30', duration: '1.5 hr', title: 'Quad Bike / ATV Safari', description: 'Ride through sand dunes, open desert, and rocky terrain.' },
      { time: '16:00', duration: '45 min', title: 'Camel Ride', description: 'Peaceful camel trek through the dunes at golden hour.' },
      { time: '16:45', duration: '30 min', title: 'Bedouin Camp Tea', description: 'Traditional tea and rest at camp.' },
      { time: '17:15', duration: '1.5 hr', title: 'BBQ Dinner & Show (optional)', description: 'Bedouin BBQ with belly dancing and fire show.' },
      { time: '18:45', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunglasses', 'Dust scarf or bandana', 'Light jacket for evening', 'Camera', 'Cash for tips'],
    highlights: ['#1 Bestseller — 1,800+ reviews at 4.9★', 'Quad bike + camel combo', 'Optional BBQ dinner with show', 'Skip-the-line', 'Hotel pickup & drop-off'],
    inclusions: ['Quad bike / ATV', 'Camel ride', 'Safety gear', 'Tea & water', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'BBQ dinner (included in BBQ option)', 'Photos (add-on)'],
    imagePrompt: 'Quad bike ATV and camel together in Egyptian desert near Hurghada, tourist on quad bike with camel caravan behind, golden sand dunes, sunset light.',
  },
  {
    slug: 'wild-desert-stargazing-camel-candlelight-bbq',
    title: 'Desert Stargazing with Camel & BBQ Dinner on Candlelight',
    shortDescription: 'A magical evening — camel ride at sunset, candlelit BBQ dinner in the desert, and stargazing under the Milky Way.',
    description: 'Our most romantic desert experience. Ride a camel through the desert as the sun sets, then arrive at a beautifully arranged candlelit Bedouin camp. Enjoy a freshly grilled BBQ dinner surrounded by hundreds of candles under the open sky. After dinner, lie back for guided stargazing in one of the darkest skies on Earth. Rated 4.8★ by 108 guests.',
    category: 'adventure', duration: '7 hours', priceFrom: 42,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full candlelight experience', price: 42 },
      { id: 'child', name: 'Child (6-12)', description: 'Full experience', price: 28 },
      { id: 'couple', name: 'Couple Package', description: 'Two adults with premium setup', price: 75 },
    ],
    addons: [
      { id: 'telescope', name: 'Telescope Stargazing', description: 'Professional telescope session', price: 12 },
      { id: 'blanket', name: 'Desert Blanket', description: 'Bedouin woven blanket to take home', price: 10 },
    ],
    itinerary: [
      { time: '15:30', duration: '30 min', title: 'Hotel Pickup', description: '4x4 transfer to desert starting point.' },
      { time: '16:00', duration: '1 hr', title: 'Camel Ride at Sunset', description: 'Ride through golden dunes as the sun sets.' },
      { time: '17:00', duration: '30 min', title: 'Camp Arrival', description: 'Welcome tea and candlelit camp setup reveal.' },
      { time: '17:30', duration: '30 min', title: 'Sunset Viewing', description: 'Watch the sunset from the dunes with drinks.' },
      { time: '18:00', duration: '1.5 hr', title: 'Candlelight BBQ Dinner', description: 'Freshly grilled dinner surrounded by candles.' },
      { time: '19:30', duration: '1 hr', title: 'Stargazing', description: 'Guided stargazing — Milky Way, constellations, planets.' },
      { time: '20:30', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Warm jacket (desert cold at night)', 'Camera with night mode', 'Comfortable shoes', 'Cash for tips'],
    highlights: ['Candlelit desert dinner setup', 'Camel ride at sunset', 'BBQ under the stars', 'Milky Way stargazing', 'Rated 4.8★ — romantic & magical'],
    inclusions: ['4x4 transfer', 'Camel ride', 'Candlelit BBQ dinner', 'All drinks', 'Stargazing', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Alcoholic beverages'],
    imagePrompt: 'Romantic candlelight dinner in Egyptian desert at night, hundreds of candles on sand, elegant table setup, camels resting nearby, starry sky with Milky Way.',
  },
  {
    slug: 'wild-desert-jeep-quad-buggy-camel-dinner-show',
    title: 'Jeep Safari with Quad, Buggy, Camel & Dinner Show',
    shortDescription: 'The ultimate desert combo — 4x4 jeep, quad bike, dune buggy, camel ride, plus dinner and entertainment.',
    description: 'Everything the desert has to offer in one epic trip. Start with a 4x4 jeep ride into the deep desert, switch to a quad bike for dune racing, then try the buggy for off-road thrills. Cool down with a peaceful camel ride to camp, where a traditional dinner with belly dancing and fire show awaits. Rated 4.5★.',
    category: 'adventure', duration: '6 hours', priceFrom: 22,
    pricingOptions: [
      { id: 'standard', name: 'All Activities + Dinner (5 hrs)', description: 'Full combo with dinner', price: 22 },
      { id: 'extended', name: 'Extended + Stargazing (7 hrs)', description: 'Add stargazing after dinner', price: 32 },
    ],
    addons: [
      { id: 'private', name: 'Private Guide', description: 'Your own guide and schedule', price: 20 },
      { id: 'sandboard', name: 'Add Sandboarding', description: '30-min sandboarding session', price: 8 },
    ],
    itinerary: [
      { time: '14:00', duration: '20 min', title: 'Pickup & Briefing', description: 'Hotel pickup and safety instructions.' },
      { time: '14:20', duration: '30 min', title: 'Jeep Safari', description: '4x4 drive through desert terrain.' },
      { time: '14:50', duration: '45 min', title: 'Quad Bike', description: 'Race across sand dunes on ATV.' },
      { time: '15:35', duration: '30 min', title: 'Dune Buggy', description: 'Off-road buggy through challenging terrain.' },
      { time: '16:05', duration: '45 min', title: 'Camel Ride to Camp', description: 'Peaceful camel trek to Bedouin camp.' },
      { time: '16:50', duration: '30 min', title: 'Tea & Rest', description: 'Bedouin welcome tea and camp activities.' },
      { time: '17:20', duration: '1 hr', title: 'Dinner & Show', description: 'BBQ dinner with belly dancing and fire show.' },
      { time: '18:20', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunglasses', 'Dust bandana', 'Light jacket', 'Camera', 'Cash for tips'],
    highlights: ['4 vehicles: jeep + quad + buggy + camel', 'Dinner with belly dancing & fire show', 'Budget-friendly combo', 'Hotel pickup included', 'Optional stargazing extension'],
    inclusions: ['Jeep', 'Quad bike', 'Buggy', 'Camel ride', 'Safety gear', 'Dinner', 'Show', 'Tea', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Alcoholic drinks'],
    imagePrompt: 'Desert safari collage scene near Hurghada Egypt, jeep, quad bike, buggy, and camel all in desert landscape, action and adventure, golden dunes.',
  },
  {
    slug: 'wild-desert-dune-buggy-optional-bbq',
    title: 'Desert Safari by Dune Buggy with Optional BBQ',
    shortDescription: 'Drive a powerful dune buggy through the Sahara desert with the option to add a BBQ dinner.',
    description: 'Take the wheel of a powerful Polaris dune buggy and tackle the Egyptian desert head-on. Navigate through sand dunes, open plains, and rocky valleys with your co-pilot. Choose the short adrenaline rush (2 hours) or extend with a Bedouin BBQ dinner experience (5 hours). All safety gear and instruction provided. Rated 4.6★.',
    category: 'adventure', duration: '3.5 hours', priceFrom: 58,
    pricingOptions: [
      { id: 'short', name: 'Buggy Only (2 hrs)', description: 'Pure buggy adrenaline', price: 58 },
      { id: 'bbq', name: 'Buggy + BBQ Dinner (5 hrs)', description: 'Buggy ride + Bedouin dinner', price: 72 },
    ],
    addons: [
      { id: 'gopro', name: 'GoPro Rental', description: 'Action camera for the ride', price: 10 },
      { id: 'camel', name: 'Add Camel Ride', description: '30-min camel ride at camp', price: 8 },
    ],
    itinerary: [
      { time: '14:00', duration: '30 min', title: 'Pickup & Training', description: 'Hotel pickup, buggy driving instructions and safety brief.' },
      { time: '14:30', duration: '1.5 hr', title: 'Dune Buggy Safari', description: 'Drive through dunes, valleys, and open desert.' },
      { time: '16:00', duration: '30 min', title: 'Bedouin Tea Stop', description: 'Tea and rest at desert camp.' },
      { time: '16:30', duration: '1.5 hr', title: 'BBQ Dinner (optional)', description: 'Traditional BBQ dinner with entertainment.' },
      { time: '18:00', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Dust-proof clothing', 'Sunglasses', 'Bandana', 'Camera', 'Cash'],
    highlights: ['Powerful Polaris dune buggy', 'Drive it yourself', 'Optional BBQ dinner', 'All safety gear included', 'Rated 4.6★'],
    inclusions: ['Dune buggy + fuel', 'Safety gear', 'Tea', 'Water', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'BBQ dinner (included in BBQ option)', 'Photos'],
    imagePrompt: 'Powerful Polaris dune buggy racing through Egyptian desert sand dunes near Hurghada, dust flying, driver with helmet, dramatic action shot.',
  },
  {
    slug: 'wild-desert-quad-atv-private-experience',
    title: '3 or 5-Hour Quad Bike & ATV Private Experience with Camel Ride',
    shortDescription: 'Private quad bike experience — your own guide, route, and pace. Choose 3 or 5-hour option with camel ride.',
    description: 'The VIP quad bike experience. Enjoy a fully private safari with your own guide who tailors the route to your skill level. Choose the 3-hour express (quad + camel) or the 5-hour full experience (quad + camel + desert exploration + dinner). Perfect for couples, families, or groups wanting exclusivity. Rated 5.0★.',
    category: 'adventure', duration: '4 hours', priceFrom: 30,
    pricingOptions: [
      { id: '3hr', name: '3-Hour Private (Quad + Camel)', description: 'Express private experience', price: 30 },
      { id: '5hr', name: '5-Hour Private (+ Dinner)', description: 'Full private with dinner', price: 45 },
    ],
    addons: [
      { id: 'buggy', name: 'Buggy Upgrade', description: 'Dune buggy instead of quad', price: 15 },
      { id: 'stargazing', name: 'Add Stargazing', description: 'Stay late for stargazing', price: 10 },
    ],
    itinerary: [
      { time: 'Flexible', duration: '30 min', title: 'Private Pickup', description: 'Pickup at your preferred time.' },
      { time: '', duration: '2 hr', title: 'Private Quad Safari', description: 'Tailored route with your own guide.' },
      { time: '', duration: '45 min', title: 'Camel Ride', description: 'Private camel trek through scenic dunes.' },
      { time: '', duration: '30 min', title: 'Tea Break', description: 'Private Bedouin tea service.' },
      { time: '', duration: '1.5 hr', title: 'Dinner (5-hr option)', description: 'Private dinner setup at camp.' },
      { time: '', duration: '30 min', title: 'Return', description: 'Private transfer back.' },
    ],
    whatToBring: ['Closed shoes', 'Sunglasses', 'Camera', 'Cash for tips'],
    highlights: ['100% private — your own guide', 'Flexible schedule & route', 'Choose 3 or 5 hours', 'Rated 5.0★', 'Perfect for couples & families'],
    inclusions: ['Private quad bike', 'Private guide', 'Camel ride', 'Tea', 'Safety gear', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Dinner (included in 5-hr option)'],
    imagePrompt: 'Private quad bike safari in Egyptian desert, single couple on ATV with personal guide, exclusive desert experience, golden dunes, warm sunset.',
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

    // Remove irrelevant
    console.log('=== Removing irrelevant tours ===');
    for (const id of REMOVE_IDS) {
      const result = await Attraction.updateOne(
        { _id: new Types.ObjectId(id) },
        { $pull: { tenantIds: tenant._id } }
      );
      const attr = await Attraction.findById(id).select('title');
      console.log(`  ${result.modifiedCount > 0 ? 'REMOVED' : 'SKIP'}  ${attr?.title || id}`);
    }

    // Seed new
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
        subcategory: tour.slug.includes('buggy') ? 'buggy' : tour.slug.includes('quad') || tour.slug.includes('atv') ? 'quad-biking' : 'safari',
        destination: { city: 'Hurghada', country: 'Egypt', coordinates: { lat: 27.2579, lng: 33.8116 } },
        duration: tour.duration,
        languages: ['English', 'Arabic', 'German', 'Russian'],
        rating: 4.5 + Math.round(Math.random() * 5) / 10,
        reviewCount: 20 + Math.floor(Math.random() * 150),
        priceFrom: tour.priceFrom,
        currency: 'USD',
        pricingOptions: tour.pricingOptions,
        addons: tour.addons,
        entryWindows: [
          { label: 'Morning', startTime: '08:00', endTime: '09:00' },
          { label: 'Afternoon', startTime: '14:00', endTime: '15:00' },
        ],
        itinerary: tour.itinerary,
        whatToBring: tour.whatToBring,
        accessibility: ['Not wheelchair accessible', 'Not recommended for pregnant travelers', 'Moderate fitness required'],
        gettingThere: [
          { mode: 'Hotel Pickup', description: 'Complimentary pickup from all hotels in Hurghada, Makadi Bay, Sahl Hasheesh, and El Gouna.' },
        ],
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        meetingPoint: {
          address: 'Hotel lobby pickup, Hurghada',
          instructions: 'Our driver will meet you at your hotel lobby 15 minutes before departure. Wear closed shoes.',
          mapUrl: 'https://maps.google.com/?q=27.2579,33.8116',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before the start time for a full refund.',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['free-cancellation', 'instant-confirm'],
        availability: { type: 'time-slots', advanceBooking: 30 },
        seo: {
          metaTitle: `${tour.title} | Wild Desert Safari Hurghada`,
          metaDescription: tour.shortDescription,
          keywords: tour.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3),
        },
        tenantIds: [tenant._id],
        status: 'active',
        featured: tour.priceFrom >= 40,
      });
      console.log(`  CREATED ✅\n`);
      created++;
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log(`\nDone. Removed: ${REMOVE_IDS.length}. Created: ${created}, Skipped: ${skipped}`);
    console.log(`Total Desert Fox Safari tours: ${15 - REMOVE_IDS.length + created}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
