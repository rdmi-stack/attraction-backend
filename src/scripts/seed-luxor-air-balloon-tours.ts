/**
 * Seed 8 brand-exclusive Luxor Air Balloon flights with AI-generated cover
 * images. Idempotent: skips tours whose slug already exists.
 *
 * Usage:
 *   railway run npx ts-node src/scripts/seed-luxor-air-balloon-tours.ts
 *   (or local)  npx ts-node src/scripts/seed-luxor-air-balloon-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'luxor-air-balloon';

const FLIGHTS = [
  {
    slug: 'sunrise-balloon-valley-of-the-kings',
    title: 'Sunrise Balloon over the Valley of the Kings',
    shortDescription: 'The signature flight — first light over Hatshepsut, Valley of the Kings, and the Nile from 4,500 feet.',
    description:
      "Our most-booked flight. Pickup from your Luxor hotel at 04:30. Liftoff from the West Bank at 05:45. ~45 minutes airborne over Hatshepsut Temple, the Valley of the Kings, the Colossi of Memnon and the Nile. Soft landing in farmland, champagne breakfast, signed flight certificate. EAA-licensed pilot, weather-conservative dispatch, full safety briefing pre-flight.",
    duration: '~45 min flight · 3 hr total',
    priceFrom: 130,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Standard basket · max 16 pax', price: 130 },
      { id: 'child', name: 'Child (8–12)', description: 'Standard basket · max 16 pax', price: 90 },
    ],
    addons: [
      { id: 'photos',    name: 'Digital Photo Package', description: 'In-basket + landing shots, delivered same day', price: 25 },
      { id: 'breakfast', name: 'Premium Breakfast Upgrade', description: 'Hot Egyptian breakfast spread', price: 15 },
      { id: 'cert',      name: 'Framed Flight Certificate', description: 'Signed and framed', price: 12 },
    ],
    highlights: ['Hatshepsut Temple at first light', 'Valley of the Kings fly-over', 'Colossi of Memnon overhead', 'Champagne breakfast on landing', 'EAA-licensed pilot'],
    inclusions: ['Hotel pickup & drop-off', 'Safety briefing', '~45 min flight', 'Champagne breakfast', 'Signed flight certificate', 'EAA-licensed pilot'],
    exclusions: ['Tips', 'Photo package (available as add-on)'],
    imagePrompt: 'Cinematic aerial photograph from a hot air balloon at sunrise over Hatshepsut Temple in Luxor Egypt, terraced limestone colonnades catching first light, deep purple-to-orange dawn sky, photorealistic professional travel photography, soft warm cinematic color grade, 16:9.',
  },
  {
    slug: 'couples-champagne-sunrise-flight',
    title: 'Couples Champagne Sunrise Flight',
    shortDescription: 'For two. Same sunrise flight + private champagne table on landing + premium photo package.',
    description:
      "The signature flight elevated for couples and honeymooners. Same 04:30 pickup and ~45 minute sunrise route over the West Bank, but with a private candlelit champagne table set up in the cane fields on landing, a premium digital photo package included, and a hand-written flight certificate signed by your pilot.",
    duration: '~45 min flight · 3.5 hr total',
    priceFrom: 245,
    pricingOptions: [
      { id: 'couple', name: 'For Two (couple)', description: 'Standard basket, private champagne table on landing', price: 245 },
    ],
    addons: [
      { id: 'roses',    name: 'Rose Bouquet',        description: 'Fresh Egyptian roses on the table', price: 25 },
      { id: 'breakfast-couple', name: 'Hot Couples Breakfast', description: 'Private hot breakfast spread', price: 30 },
    ],
    highlights: ['Sunrise over the Valley of the Kings', 'Private champagne table on landing', 'Premium digital photo package included', 'Hand-written certificate', 'Romantic add-ons available'],
    inclusions: ['Hotel pickup & drop-off', '~45 min flight', 'Private champagne table', 'Premium photo package', 'Hand-written flight certificate'],
    exclusions: ['Tips', 'Floral add-ons'],
    imagePrompt: 'Romantic photograph of a couple in casual elegant travel clothes silhouetted in a hot air balloon basket at sunrise over Luxor Egypt, the balloon envelope catching golden first light above, the Nile glowing far below, photorealistic cinematic travel photography, warm romantic color palette.',
  },
  {
    slug: 'private-charter-balloon-4',
    title: 'Private Charter Balloon (up to 4)',
    shortDescription: 'An entire basket reserved for your party. Up to four passengers, no strangers, full flexibility on route timing.',
    description:
      "Charter an entire luxury basket for your group of up to four. No strangers, no other passengers, no compromises on hover time. Your pilot tailors the route to your preferences — extra time over Hatshepsut, lower passes over the Valley, or a longer Nile transit. Private champagne breakfast on landing.",
    duration: '~60 min flight · 3.5 hr total',
    priceFrom: 980,
    pricingOptions: [
      { id: 'party-4', name: 'Private (1–4 pax)', description: 'Entire basket for your group', price: 980 },
    ],
    addons: [
      { id: 'extra-pax', name: 'Add 5th Guest',        description: 'Per extra guest (max 6 total)', price: 220 },
      { id: 'photos-pro', name: 'Pro Photo Package',   description: 'In-flight portraits + landing', price: 65 },
    ],
    highlights: ['Entire basket reserved for your party', 'Tailored route', 'Extended hover holds', 'Private champagne breakfast', 'Personalised pilot'],
    inclusions: ['Hotel pickup & drop-off', '~60 min flight', 'Private basket', 'Champagne breakfast', 'Signed certificates'],
    exclusions: ['Tips', 'Additional guests (available as add-on)'],
    imagePrompt: 'Cinematic photograph of a luxury private hot air balloon basket at sunrise over Luxor Egypt, small group of four passengers in casual elegant clothes inside, the pilot operating the burners, the Theban necropolis golden below, photorealistic travel photography.',
  },
  {
    slug: 'photographers-pre-dawn-flight',
    title: "Photographer's Pre-Dawn Flight",
    shortDescription: 'Launch 30 minutes earlier. Max 8 passengers. Tripod-stable basket. Fifteen-minute hover holds.',
    description:
      "Built for the lens. We launch 30 minutes earlier than the standard sunrise flight so you are airborne while the sky is still 4:50 AM cobalt — the only operator in Luxor that offers this slot. Maximum eight passengers per basket (not the usual sixteen), with locked-down tripod corners and 15-minute hover holds over the Valley of the Kings. Pre-book 14 days minimum.",
    duration: '~75 min flight · 4 hr total',
    priceFrom: 180,
    pricingOptions: [
      { id: 'photographer', name: 'Photographer', description: 'Tripod-stable basket · max 8 pax', price: 180 },
    ],
    addons: [
      { id: 'private-corner', name: 'Reserved Basket Corner', description: 'Locked corner spot for your tripod', price: 35 },
      { id: 'extra-hover',    name: 'Extra Hover Hold',       description: 'Additional 10-minute hold at the spot of your choice', price: 50 },
    ],
    highlights: ['Pre-dawn 04:50 AM cobalt launch window', 'Max 8 passengers per basket', 'Tripod-stable basket with locked corners', '15-minute hover holds over Valley of the Kings', 'Pilot routes for light angles'],
    inclusions: ['Hotel pickup at 03:45', '~75 min flight', 'Tripod corner space', '15-min hover holds', 'Champagne breakfast', 'Signed certificate'],
    exclusions: ['Tips', 'Equipment rental'],
    imagePrompt: 'Cinematic photograph of a professional landscape photographer with a large camera and tripod set up at the corner of a hot air balloon basket at pre-dawn over Luxor Egypt, deep cobalt blue sky with first hint of orange at horizon, the photographer focused and composed, photorealistic editorial travel photography.',
  },
  {
    slug: 'hatshepsut-aerial-flight',
    title: 'Hatshepsut Temple Aerial Tour',
    shortDescription: 'Focused flight path — extended hover and lower altitude over the terraced temple at golden hour.',
    description:
      "A focused route that maximises time over Deir el-Bahari — Queen Hatshepsut's mortuary temple. The pilot keeps the balloon at lower altitude for closer detail on the colonnades and the cliff face behind, with two extended hovers as the sun crests. Best month: October to March, when the light angle is most dramatic.",
    duration: '~50 min flight · 3 hr total',
    priceFrom: 135,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Standard basket · max 16 pax', price: 135 },
      { id: 'child', name: 'Child (8–12)', description: 'Standard basket · max 16 pax', price: 95 },
    ],
    addons: [
      { id: 'photos', name: 'Digital Photo Package', description: 'In-basket + landing shots', price: 25 },
    ],
    highlights: ['Focused route over Hatshepsut', 'Lower altitude for detail', 'Two extended hovers', 'Best months: Oct–Mar', 'EAA-licensed pilot'],
    inclusions: ['Hotel pickup & drop-off', '~50 min flight', 'Champagne breakfast', 'Signed certificate'],
    exclusions: ['Tips', 'Photo package (available as add-on)'],
    imagePrompt: 'Aerial photograph from a hot air balloon hovering low over Hatshepsut mortuary temple in Luxor Egypt at golden hour, the three terraces and ramped colonnades clearly detailed, deep shadow lines from the eastern cliffs behind, photorealistic professional landscape photography.',
  },
  {
    slug: 'family-adventure-flight',
    title: 'Family Adventure Flight (kids 8+)',
    shortDescription: 'Kid-friendly basket configuration, shorter route, lower altitude. Designed for families with children 8 and up.',
    description:
      "A flight specifically configured for families. Shorter route (~30 min airborne) at slightly lower altitude, with a basket grouped so children can stand on the included step boxes to see over the edge. Same EAA-licensed pilot, same safety standards, but paced for first-time balloonists with kids 8+.",
    duration: '~30 min flight · 2.5 hr total',
    priceFrom: 115,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Family basket', price: 115 },
      { id: 'child', name: 'Child (8–12)', description: 'Family basket · step boxes provided', price: 75 },
    ],
    addons: [
      { id: 'family-photo', name: 'Family Photo Package', description: 'Group portraits in flight + landing', price: 30 },
      { id: 'kids-cert',    name: 'Kids Flight Certificate', description: 'Personalised + signed by pilot', price: 10 },
    ],
    highlights: ['Family basket with step boxes', 'Shorter ~30 min route', 'Lower altitude', 'Same EAA-licensed pilot', 'Kids welcome from 8+'],
    inclusions: ['Hotel pickup & drop-off', '~30 min flight', 'Champagne for parents · juice for kids', 'Personalised kids certificate'],
    exclusions: ['Tips', 'Photo package (available as add-on)'],
    imagePrompt: 'Photograph of a happy family of four (two parents and two children aged 9 and 11) in a hot air balloon basket at sunrise over Luxor Egypt, the children standing on step boxes peering over the wicker edge, all smiling, soft golden first light, photorealistic family travel photography.',
  },
  {
    slug: 'karnak-sunset-balloon',
    title: 'Sunset Balloon over Karnak',
    shortDescription: 'Rare evening slot — October to March only. Flight path over Karnak Temple with the sun setting behind the Nile.',
    description:
      "Almost no one in Luxor operates evening flights. We do, October through March only, on calm-wind evenings — about eight slots per month. Liftoff at 16:30 from the West Bank with the path crossing the Nile to put Karnak Temple beneath you as the sun sets. Premium evening champagne tasting on landing.",
    duration: '~50 min flight · 3 hr total',
    priceFrom: 155,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Standard basket · max 12 pax', price: 155 },
      { id: 'child', name: 'Child (8–12)', description: 'Standard basket · max 12 pax', price: 110 },
    ],
    addons: [
      { id: 'tasting', name: 'Premium Champagne Tasting',  description: 'Three-glass flight on landing', price: 35 },
    ],
    highlights: ['Rare evening slot · Oct–Mar only', 'Crossing the Nile to Karnak', 'Sun setting over the West Bank', 'Champagne tasting on landing', 'Max 12 passengers'],
    inclusions: ['Hotel pickup at 15:30', '~50 min flight', 'Evening champagne tasting', 'Signed certificate'],
    exclusions: ['Tips', 'Premium tasting upgrade'],
    imagePrompt: 'Cinematic photograph of a hot air balloon at sunset over Karnak Temple in Luxor Egypt, the massive pylons and obelisks bathed in deep golden and rose light, the Nile river glowing red in the background, photorealistic professional landscape photography, dramatic warm color grade.',
  },
  {
    slug: 'luxor-grand-vista-90min',
    title: 'Grand Vista 90-Minute Flight',
    shortDescription: 'Extended 90-minute route. Both banks of the Nile, all major sites, longer hover holds. Premium pilot.',
    description:
      "Our longest flight — a full 90 minutes airborne instead of the standard 45. The extended route crosses both banks of the Nile, taking in Hatshepsut, the Valley of the Kings, the Colossi, then crossing to the east bank for Karnak and the modern town, before returning to land. Operated by our most senior pilot.",
    duration: '~90 min flight · 4 hr total',
    priceFrom: 220,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Premium basket · max 12 pax', price: 220 },
      { id: 'child', name: 'Child (8–12)', description: 'Premium basket · max 12 pax', price: 160 },
    ],
    addons: [
      { id: 'photos-pro', name: 'Pro Photo Package', description: 'In-flight + landing portraits + drone shots', price: 70 },
      { id: 'breakfast-grand', name: 'Grand Breakfast Spread', description: 'Hot Egyptian breakfast on white linen', price: 25 },
    ],
    highlights: ['90-minute airborne · double the standard', 'Both banks of the Nile', 'Hatshepsut + Valley + Colossi + Karnak', 'Operated by senior pilot', 'Max 12 passengers'],
    inclusions: ['Hotel pickup & drop-off', '~90 min flight', 'Champagne breakfast', 'Signed certificate'],
    exclusions: ['Tips', 'Photo / breakfast upgrades'],
    imagePrompt: 'Wide cinematic aerial photograph from a hot air balloon at sunrise over the Nile river in Luxor Egypt, looking across to both banks — Karnak Temple in the distance on one side, Hatshepsut Temple and the Theban cliffs on the other, soft golden first light, photorealistic, breathtaking wide landscape, professional travel photography.',
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
    let i = 0;

    for (const flight of FLIGHTS) {
      i++;
      const exists = await Attraction.findOne({ slug: flight.slug });
      if (exists) {
        console.log(`[${i}/${FLIGHTS.length}] SKIP  ${flight.slug} (exists)`);
        skipped++;
        continue;
      }

      console.log(`[${i}/${FLIGHTS.length}] ${flight.title}`);

      // Generate cover image
      let imageUrl = '';
      try {
        console.log(`  Generating image…`);
        const { base64, mimeType } = await generateImageFromPrompt({
          prompt: flight.imagePrompt,
          size: '1536x1024',
          quality: 'medium',
          outputFormat: 'jpeg',
        });
        const dataUri = `data:${mimeType};base64,${base64}`;
        const uploaded = await uploadBase64Image(dataUri, `tours/${flight.slug}`);
        imageUrl = uploaded.url;
        console.log(`  ✅ ${imageUrl}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ⚠️ Image failed: ${msg} — proceeding without`);
      }

      await Attraction.create({
        slug: flight.slug,
        title: flight.title,
        shortDescription: flight.shortDescription,
        description: flight.description,
        images: imageUrl ? [imageUrl] : [],
        category: 'flights',
        destination: {
          city: 'Luxor',
          country: 'Egypt',
          coordinates: { lat: 25.7188, lng: 32.6014 },
        },
        duration: flight.duration,
        languages: ['English', 'Arabic', 'German', 'French'],
        rating: 4.8 + Math.round(Math.random() * 2) / 10,
        reviewCount: 80 + Math.floor(Math.random() * 200),
        priceFrom: flight.priceFrom,
        currency: 'USD',
        pricingOptions: flight.pricingOptions,
        addons: flight.addons,
        entryWindows: [
          { label: 'Sunrise Departure', startTime: '04:30', endTime: '05:00' },
        ],
        itinerary: [],
        highlights: flight.highlights,
        inclusions: flight.inclusions,
        exclusions: flight.exclusions,
        meetingPoint: {
          address: 'West Bank Launch Site, Luxor',
          instructions: 'Hotel pickup at 04:30 is included. The driver will meet you in your hotel lobby.',
          mapUrl: 'https://maps.google.com/?q=25.7188,32.6014',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'free-cancellation', 'instant-confirm'],
        availability: { type: 'date-only', advanceBooking: 14 },
        tenantIds: [tenant._id],
        status: 'active',
        featured: true,
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
