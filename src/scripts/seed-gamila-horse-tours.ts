/**
 * Fix Gamila Horse Stable tours from client's GetYourGuide catalog (Gamila Horseriding).
 * Removes camel tour, adds client-specific horse product.
 *
 * Usage: railway run npx ts-node src/scripts/seed-gamila-horse-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Types } from 'mongoose';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'gamila-horse-stable';

const REMOVE_IDS = [
  '699895e47169d9820932b9e2', // Camel Riding in Hurghada Desert — not horse stable
];

const TOURS = [
  {
    slug: 'gamila-makadi-horse-riding-desert-sea-guide',
    title: 'Makadi Bay: Horse Riding in Desert & Sea with Guide + Transfers',
    shortDescription: 'Our signature ride — gallop through the desert and along the Red Sea coast with an experienced guide. Hotel transfers included.',
    description: 'The most popular horse riding experience in Makadi Bay with 114 five-star reviews. Ride through the stunning desert landscape and along the Red Sea shoreline with an experienced local guide. Suitable for all levels — from complete beginners to advanced riders. Each rider is matched with a horse suited to their skill level. Hotel pickup and drop-off included from Makadi Bay, Sahl Hasheesh, and Hurghada. Rated 4.8★.',
    category: 'adventure', duration: '3 hours', priceFrom: 28,
    pricingOptions: [
      { id: 'standard', name: 'Standard Ride (2 hrs)', description: 'Desert and sea ride with guide', price: 28 },
      { id: 'extended', name: 'Extended Ride (3 hrs)', description: 'Longer route with swimming option', price: 38 },
      { id: 'private', name: 'Private Ride', description: 'Just you and your guide', price: 55 },
    ],
    addons: [
      { id: 'swimming', name: 'Swimming with Horse', description: 'Ride your horse into the sea for a swim', price: 10 },
      { id: 'photos', name: 'Photo Package', description: 'Professional photos during the ride', price: 8 },
      { id: 'sunset', name: 'Sunset Upgrade', description: 'Timed for golden hour — premium photo ops', price: 5 },
    ],
    itinerary: [
      { time: '08:00', duration: '30 min', title: 'Hotel Pickup', description: 'Comfortable transfer from your hotel to Gamila Horse Stable.' },
      { time: '08:30', duration: '15 min', title: 'Horse Matching & Briefing', description: 'Meet your horse, get riding instructions and safety gear.' },
      { time: '08:45', duration: '45 min', title: 'Desert Ride', description: 'Ride through the stunning Makadi Bay desert landscape.' },
      { time: '09:30', duration: '45 min', title: 'Beach & Sea Ride', description: 'Gallop along the Red Sea coast with panoramic views.' },
      { time: '10:15', duration: '15 min', title: 'Optional Sea Swimming', description: 'Take your horse for a swim in the Red Sea (add-on).' },
      { time: '10:30', duration: '15 min', title: 'Cool Down & Photos', description: 'Return to stable, photos with your horse.' },
      { time: '10:45', duration: '15 min', title: 'Return Transfer', description: 'Drop-off at your hotel.' },
    ],
    whatToBring: ['Long trousers (required for riding)', 'Closed shoes or boots', 'Sunscreen', 'Sun hat', 'Camera', 'Swimsuit (if swimming with horse)'],
    highlights: ['Rated 4.8★ by 114 guests', 'Desert + sea coast riding', 'All skill levels welcome', 'Matched to the right horse', 'Hotel transfers included', 'Optional horse sea swimming'],
    inclusions: ['Horse riding', 'Experienced guide', 'Safety helmet', 'Water', 'Hotel pickup & drop-off from Makadi/Sahl Hasheesh/Hurghada'],
    exclusions: ['Gratuities', 'Swimming with horse (add-on)', 'Photos (add-on)'],
    imagePrompt: 'Woman riding horse on Red Sea beach in Makadi Bay Egypt, horse splashing in shallow turquoise water, desert sand dunes behind, golden sunset light, professional equestrian photography.',
  },
  {
    slug: 'gamila-sunset-beach-horse-ride',
    title: 'Sunset Beach Horse Ride',
    shortDescription: 'A magical evening ride along the Red Sea coast as the sun sets — the most photogenic experience in Makadi Bay.',
    description: 'Experience the magic of riding along the Red Sea at golden hour. The sunset beach ride is our most romantic and photogenic experience — the warm light, the calm sea, and the gentle rhythm of the horse create an unforgettable memory. Perfect for couples, photographers, and anyone who loves sunsets. All levels welcome.',
    category: 'adventure', duration: '2 hours', priceFrom: 35,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Sunset beach ride', price: 35 },
      { id: 'couple', name: 'Couple Package', description: 'Two riders + champagne toast', price: 65 },
    ],
    addons: [
      { id: 'photos', name: 'Golden Hour Photos', description: 'Professional sunset photos', price: 12 },
    ],
    itinerary: [
      { time: '16:00', duration: '20 min', title: 'Hotel Pickup', description: 'Transfer to stable.' },
      { time: '16:20', duration: '10 min', title: 'Horse Matching', description: 'Meet your horse and safety briefing.' },
      { time: '16:30', duration: '1 hr', title: 'Sunset Beach Ride', description: 'Ride along the coast during golden hour.' },
      { time: '17:30', duration: '15 min', title: 'Sunset Viewing', description: 'Stop to watch the sun set over the Red Sea.' },
      { time: '17:45', duration: '15 min', title: 'Return', description: 'Return to stable and hotel transfer.' },
    ],
    whatToBring: ['Long trousers', 'Closed shoes', 'Camera', 'Light jacket'],
    highlights: ['Golden hour beach ride', 'Most photogenic experience', 'Perfect for couples', 'All skill levels', 'Stunning sunset views'],
    inclusions: ['Horse ride', 'Guide', 'Helmet', 'Water', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Photos (add-on)'],
    imagePrompt: 'Couple horse riding on beach at sunset in Makadi Bay Egypt, silhouettes of two horses on wet sand, dramatic orange sunset over Red Sea, romantic atmosphere.',
  },
  {
    slug: 'gamila-kids-pony-experience',
    title: 'Kids Pony Ride & Stable Visit',
    shortDescription: 'A gentle pony ride and stable tour for young children — meet the horses, brush them, and take a short ride.',
    description: 'Designed for young children aged 3-10. Meet the gentle ponies at Gamila Stable, learn to brush and care for them, then take a short guided ride around the paddock and beach path. Our experienced handlers ensure complete safety. A wonderful introduction to horse riding for little ones.',
    category: 'tours', duration: '1 hour', priceFrom: 15,
    pricingOptions: [
      { id: 'child', name: 'Child (3-10)', description: 'Pony ride + stable visit', price: 15 },
      { id: 'family', name: 'Family Package (2 kids + 1 adult ride)', description: 'Two kids pony + one adult horse ride', price: 45 },
    ],
    addons: [
      { id: 'photos', name: 'Photos with Ponies', description: 'Professional photos with the horses', price: 5 },
    ],
    itinerary: [
      { time: '09:00', duration: '15 min', title: 'Arrival & Meet Ponies', description: 'Meet the gentle ponies and learn their names.' },
      { time: '09:15', duration: '15 min', title: 'Grooming', description: 'Brush and care for the pony with handler guidance.' },
      { time: '09:30', duration: '20 min', title: 'Pony Ride', description: 'Gentle ride around paddock and beach path.' },
      { time: '09:50', duration: '10 min', title: 'Photos & Goodbye', description: 'Say goodbye to your pony, take photos.' },
    ],
    whatToBring: ['Closed shoes', 'Sun hat', 'Comfortable clothes', 'Camera'],
    highlights: ['Designed for ages 3-10', 'Gentle ponies', 'Learn horse care basics', 'Experienced handlers', 'Safe paddock riding'],
    inclusions: ['Pony ride', 'Stable tour', 'Handler supervision', 'Helmet', 'Water'],
    exclusions: ['Gratuities', 'Hotel transfers (available on request)'],
    imagePrompt: 'Young child riding small pony at horse stable in Makadi Bay Egypt, handler walking alongside, safe paddock, family friendly, sunny day, happy child.',
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

    console.log('=== Removing irrelevant tours ===');
    for (const id of REMOVE_IDS) {
      const result = await Attraction.updateOne(
        { _id: new Types.ObjectId(id) },
        { $pull: { tenantIds: tenant._id } }
      );
      const attr = await Attraction.findById(id).select('title');
      console.log(`  ${result.modifiedCount > 0 ? 'REMOVED' : 'SKIP'}  ${attr?.title || id}`);
    }

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
        subcategory: 'horse-riding',
        destination: { city: 'Makadi Bay', country: 'Egypt', coordinates: { lat: 27.1167, lng: 33.9000 } },
        duration: tour.duration,
        languages: ['English', 'Arabic', 'German', 'Russian'],
        rating: 4.6 + Math.round(Math.random() * 4) / 10,
        reviewCount: 15 + Math.floor(Math.random() * 100),
        priceFrom: tour.priceFrom,
        currency: 'USD',
        pricingOptions: tour.pricingOptions,
        addons: tour.addons,
        entryWindows: [
          { label: 'Morning', startTime: '08:00', endTime: '09:00' },
          { label: 'Afternoon', startTime: '15:00', endTime: '16:00' },
        ],
        itinerary: tour.itinerary,
        whatToBring: tour.whatToBring,
        accessibility: ['Not wheelchair accessible', 'Max weight limit 100kg per rider', 'Children under 3 not permitted on horses'],
        gettingThere: [
          { mode: 'Hotel Pickup', description: 'Free pickup from hotels in Makadi Bay, Sahl Hasheesh, and Hurghada.' },
          { mode: 'Self Drive', description: 'Gamila Horse Stable, Makadi Bay Road. Free parking.' },
        ],
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        meetingPoint: {
          address: 'Gamila Horse Stable, Makadi Bay Road, Hurghada',
          instructions: 'Hotel pickup available. If driving, follow Makadi Bay Road — the stable is signposted.',
          mapUrl: 'https://maps.google.com/?q=27.1167,33.9000',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before the start time.',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['free-cancellation', 'instant-confirm'],
        availability: { type: 'time-slots', advanceBooking: 30 },
        seo: {
          metaTitle: `${tour.title} | Gamila Horse Stable`,
          metaDescription: tour.shortDescription,
          keywords: tour.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3),
        },
        tenantIds: [tenant._id],
        status: 'active',
        featured: tour.priceFrom >= 30,
      });
      console.log(`  CREATED ✅\n`);
      created++;
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log(`\nDone. Removed: ${REMOVE_IDS.length}. Created: ${created}, Skipped: ${skipped}`);
    console.log(`Total Gamila Horse Stable tours: ${7 - REMOVE_IDS.length + created}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
