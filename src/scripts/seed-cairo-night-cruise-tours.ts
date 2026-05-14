/**
 * Seed 8 brand-exclusive Cairo Night Cruise dinner cruises with AI-generated
 * cover images. Idempotent: skips cruises whose slug already exists.
 *
 * Usage:
 *   railway run npx ts-node src/scripts/seed-cairo-night-cruise-tours.ts
 *   (or local)  npx ts-node src/scripts/seed-cairo-night-cruise-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'cairo-night-cruise';

const CRUISES = [
  {
    slug: 'sunset-felucca-dinner',
    title: 'Sunset Felucca Dinner',
    shortDescription: '90 minutes of mezze, drinks, and a short oud set on a traditional sailing felucca — Cairo at golden hour.',
    description:
      "Our most-booked early seating. Boarding 18:30 from Garden City Marina aboard Nefertiti. Cold karkadé royale aperitif as the boat pushes off, mezze of the marina laid out at your table, live oud set as the felucca catches the evening wind. Cairo Tower lights up just as the dessert is served. Return at 20:00 in time for an evening on the corniche.",
    duration: '1.5 hour cruise · 2 hr total',
    priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Standard seating · mezze + drinks', price: 55 },
      { id: 'child', name: 'Child (4–12)', description: 'Kids menu · soft drinks', price: 28 },
    ],
    addons: [
      { id: 'transport',  name: 'Hotel Transport',         description: 'Round-trip car from any Cairo hotel', price: 20 },
      { id: 'wine',       name: 'Egyptian Wine Pairing',   description: 'Two glasses of Omar Khayyam or Beausoleil', price: 18 },
      { id: 'photographer', name: 'On-Board Photographer', description: '15-min posed shots, digital delivery', price: 35 },
    ],
    highlights: ['Cairo Tower lit gold at dessert', 'Live oud aperitif set', 'Mezze of the marina', 'Sunset on the Nile', 'Smart-casual evening'],
    inclusions: ['Boarding 18:30', 'Karkadé aperitif', '5 mezze plates', 'Mineral water', 'Oud performance'],
    exclusions: ['Tips', 'Additional alcohol', 'Hotel transport (add-on)'],
    imagePrompt: 'Cinematic golden-hour photograph of a traditional Egyptian felucca sailboat on the Nile in Cairo at sunset, low warm orange light, the Cairo Tower visible on the horizon, guests dining at small tables on the foredeck under a string of warm bistro lights, photorealistic professional travel photography, sky transitioning from peach to deep blue, 16:9.',
  },
  {
    slug: 'classic-5-course-nile-dinner',
    title: 'Classic 5-Course Nile Dinner',
    shortDescription: 'The signature three-hour dinner cruise — five courses, live oud, Tanoura folkloric show.',
    description:
      "Three hours, five courses, one slow drift. The full Cairo Night Cruise menu — Salwa Helmy's seasonal Egyptian-Mediterranean tasting menu paced course-by-course across the boat's route between Garden City, Tahrir Bridge, and Maadi Corniche. Maestro Tamer plays a 7-string oud throughout. The Tanoura folkloric show runs during the dessert course on Friday and Saturday seatings.",
    duration: '3 hour cruise · 3.5 hr total',
    priceFrom: 85,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full 5-course menu + show', price: 85 },
      { id: 'child', name: 'Child (4–12)', description: 'Kids 3-course menu', price: 45 },
    ],
    addons: [
      { id: 'wine-pairing',  name: 'Sommelier Pairing',      description: 'Three glasses, paired by course', price: 32 },
      { id: 'cake',          name: 'Custom Celebration Cake', description: 'Umm Ali / chocolate / fruit · 48 hr notice', price: 35 },
      { id: 'transport',     name: 'Hotel Transport',         description: 'Round-trip car from any Cairo hotel', price: 25 },
      { id: 'private-table', name: 'Private 2-Top on Bow',   description: 'Reserved isolated table · best Nile view', price: 60 },
    ],
    highlights: ['Five courses by Chef Salwa', 'Live oud throughout', 'Tanoura folkloric show (Fri & Sat)', 'Three Cairo landmarks from the deck', 'Vegan main available'],
    inclusions: ['Boarding 19:45', 'Karkadé aperitif', '5-course menu', 'Wine OR tea/coffee', 'Live oud', 'Tanoura show (Fri/Sat)'],
    exclusions: ['Tips', 'Additional alcohol', 'Hotel transport (add-on)', 'Celebration cake (add-on)'],
    imagePrompt: 'Elegant cinematic photograph of a candlelit dinner table on a traditional Egyptian felucca at night on the Nile, Cairo skyline lit up in the background with the Cairo Tower glowing gold, five-course Egyptian-Mediterranean dishes plated artfully, warm bistro lights strung along the boats rigging above, photorealistic professional travel photography, rich warm color palette, 16:9.',
  },
  {
    slug: 'couples-anniversary-cruise',
    title: 'Couples Anniversary Cruise',
    shortDescription: 'A private 2-top on Cleopatra\'s bow. Champagne, rose petals, an on-board photographer.',
    description:
      "For anniversaries, engagements, and milestone celebrations. Aboard Cleopatra (CN-02) — our intimate 24-seat felucca — you'll have a private 2-top on the bow with an unobstructed view of the river. Champagne on arrival, rose petals on the table, a photographer for the moment. Captain Sherif personally greets your table when boarding. Three-hour cruise with full 5-course menu and a customised pace for two.",
    duration: '3 hour private cruise · 3.5 hr total',
    priceFrom: 145,
    pricingOptions: [
      { id: 'couple', name: 'For Two (couple)', description: 'Private 2-top on Cleopatra\'s bow', price: 145 },
    ],
    addons: [
      { id: 'cake-anniversary',  name: 'Custom Cake',           description: 'Umm Ali / chocolate / fruit', price: 35 },
      { id: 'roses-bouquet',     name: 'Fresh Rose Bouquet',    description: 'Egyptian roses delivered to your table', price: 25 },
      { id: 'wine-bottle',       name: 'Bottle of Wine',        description: 'Egyptian Beausoleil red or white', price: 45 },
      { id: 'proposal-coord',    name: 'Proposal Coordination', description: 'Captain coordinates the moment + signal', price: 50 },
    ],
    highlights: ['Private 2-top on Cleopatra\'s bow', 'Champagne on arrival', 'Rose petals on the table', 'On-board photographer', 'Personal greeting from Captain Sherif'],
    inclusions: ['Boarding 19:00 with red-carpet welcome', 'Champagne aperitif', '5-course menu', 'Wine OR sommelier coffee', 'Live oud', '15-min photographer session'],
    exclusions: ['Tips', 'Custom cake (add-on)', 'Floral upgrades (add-on)'],
    imagePrompt: 'Intimate romantic photograph of a candlelit private dinner for two on the bow of a traditional Egyptian felucca at night on the Nile, couple silhouetted against Cairo city lights glowing gold across the river, rose petals scattered on white linen tablecloth, two flutes of champagne, photorealistic professional travel photography, deep warm cinematic color palette, 16:9.',
  },
  {
    slug: 'tanoura-folkloric-dinner',
    title: 'Tanoura Folkloric Dinner Cruise',
    shortDescription: 'A 12-minute whirling-dervish tanoura show on the foredeck, between courses of a 3-course dinner.',
    description:
      "The traditional Sufi whirling-dervish dance, performed on the foredeck of Nefertiti as the dessert is served. A 12-minute spinning spectacle of colour and rotation under the bistro lights — accompanied by live percussion. Around the show, a 3-course Egyptian-Mediterranean dinner with mezze, mains, and umm ali. Runs every Friday and Saturday 20:00 seating.",
    duration: '2.5 hour cruise · 3 hr total',
    priceFrom: 75,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: '3-course menu + Tanoura show', price: 75 },
      { id: 'child', name: 'Child (4–12)', description: 'Kids menu + show', price: 38 },
    ],
    addons: [
      { id: 'transport',   name: 'Hotel Transport',     description: 'Round-trip car from any Cairo hotel', price: 22 },
      { id: 'wine-pair',   name: 'Wine Pairing',        description: 'Two glasses, paired by course', price: 22 },
      { id: 'photographer', name: 'Show Photo Package', description: 'Photographer captures the tanoura performance', price: 30 },
    ],
    highlights: ['12-minute Tanoura whirling dervish show', '3-course Egyptian dinner', 'Live percussion accompaniment', 'Runs Friday & Saturday 20:00', 'Family-friendly performance'],
    inclusions: ['Boarding 19:45', 'Karkadé aperitif', '3-course menu', 'Mineral water', 'Tanoura performance'],
    exclusions: ['Tips', 'Wine pairing (add-on)', 'Hotel transport (add-on)'],
    imagePrompt: 'Cinematic photograph of a traditional Egyptian tanoura whirling dervish dancer performing on the foredeck of a felucca at night on the Nile, full colourful skirts spinning in motion blur, warm bistro lights strung above, guests watching from candlelit dinner tables in the background, Cairo lights across the river, photorealistic professional cultural photography, vibrant warm color palette, 16:9.',
  },
  {
    slug: 'private-yacht-charter',
    title: 'Private Yacht Charter (up to 12)',
    shortDescription: 'A felucca all to yourselves. Up to 12 guests, custom route, custom menu, custom programme.',
    description:
      "Charter the Hathor (CN-04) for a fully private 2-hour cruise. Up to 12 guests. We work with you on the route, the menu (full 5-course, family-style, vegan, kids' menu, anything), and the entertainment (oud only, jazz quartet upgrade, or completely silent for a corporate retreat). Captain Sherif personally captains private charters where possible.",
    duration: '2 hour private cruise · 2.5 hr total',
    priceFrom: 580,
    pricingOptions: [
      { id: 'charter-12', name: 'Private (up to 12 guests)', description: 'Entire boat for your party', price: 580 },
    ],
    addons: [
      { id: 'extra-pax',    name: 'Add 13th–20th Guest',  description: 'Per extra guest above 12 (max 20 total)', price: 45 },
      { id: 'jazz-quartet', name: 'Hagrass Jazz Quartet', description: 'Live jazz instead of oud', price: 220 },
      { id: 'menu-upgrade', name: 'Premium Menu Upgrade', description: 'Lobster · prime cut · vintage wines', price: 38 },
      { id: 'extra-hour',   name: 'Extra Hour on the Water', description: 'Extend cruise by 60 minutes', price: 160 },
    ],
    highlights: ['Entire felucca for your party', 'Customised route', 'Menu to your spec', 'Choice of entertainment', 'Captain Sherif (when available)'],
    inclusions: ['Private 2-hour cruise', 'Full bar service', 'Custom menu', 'Choice of oud or jazz', 'Dedicated host'],
    exclusions: ['Tips', 'Extra hour (add-on)', 'Menu upgrades (add-on)', 'Live jazz upgrade (add-on)'],
    imagePrompt: 'Cinematic photograph of a private party of friends gathered on a traditional Egyptian felucca at night on the Nile, candlelit dinner table with multiple guests laughing, warm bistro lights overhead, Cairo skyline lit up gold across the water, photorealistic professional event photography, warm cinematic color palette, 16:9.',
  },
  {
    slug: 'family-cruise-kids-menu',
    title: 'Family Cruise + Kids Menu',
    shortDescription: 'Aboard the Isis. Family-style dinner, kids menu corner, folkloric music for children.',
    description:
      "Designed for families with children 4–14. Aboard the Isis (CN-03) — our widest, most stable felucca — you get a 2-hour cruise with family-style dinner service and a dedicated kids corner with crayons, small folkloric instruments to try (mizmar, daf), and a child-host who keeps the kids entertained while parents finish their main course. Live percussion + storytelling instead of oud.",
    duration: '2 hour cruise · 2.5 hr total',
    priceFrom: 95,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Family-style 3-course menu', price: 95 },
      { id: 'child', name: 'Child (4–12)', description: 'Kids menu + activities', price: 45 },
    ],
    addons: [
      { id: 'transport',  name: 'Hotel Transport (Family Van)', description: 'Round-trip family van from any Cairo hotel', price: 35 },
      { id: 'birthday',   name: 'Birthday Surprise',             description: 'Cake + candles + small gift + crew singing', price: 40 },
      { id: 'instruments', name: 'Take-Home Folkloric Instrument', description: 'Small handmade percussion instrument as souvenir', price: 18 },
    ],
    highlights: ['Family-style service', 'Kids corner with activities', 'Live percussion + storytelling', 'Widest, most stable boat', 'Birthday surprise add-on'],
    inclusions: ['Boarding 20:15', 'Welcome juice', 'Family-style 3-course dinner', 'Live folkloric music', 'Kids corner'],
    exclusions: ['Tips', 'Hotel van transport (add-on)', 'Birthday surprise (add-on)'],
    imagePrompt: 'Cinematic photograph of an Egyptian family with two children dining on a traditional felucca on the Nile at night, kids drawing at a small low table on the deck, parents at the main table behind, warm bistro lights overhead, Cairo skyline reflected on the water, photorealistic warm family travel photography, 16:9.',
  },
  {
    slug: 'ramadan-iftar-cruise',
    title: 'Ramadan Iftar Cruise',
    shortDescription: 'A sunset iftar served at the call to prayer, on the river, with traditional fanous-lit decor.',
    description:
      "Seasonal cruise running only during Ramadan. Aboard Bastet (CN-05), decorated with traditional fanous lanterns and Ramadan textiles. The boat departs at sunset to allow iftar to be served exactly at the maghrib call to prayer — dates and water first, then a full traditional iftar menu (lentil soup, mezze, main, dessert). Tarawih atmosphere with quiet quran recitation in the background.",
    duration: '3 hour cruise · 3.5 hr total',
    priceFrom: 70,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full iftar menu', price: 70 },
      { id: 'child', name: 'Child (4–12)', description: 'Kids iftar menu', price: 35 },
    ],
    addons: [
      { id: 'transport',     name: 'Hotel Transport',  description: 'Round-trip car from any Cairo hotel', price: 22 },
      { id: 'suhoor-bag',    name: 'Suhoor Take-Away', description: 'Small breakfast pack for the next morning', price: 18 },
      { id: 'family-table',  name: 'Reserved Family Table', description: 'Round table for 6 with extra space', price: 35 },
    ],
    highlights: ['Iftar served at the call to prayer', 'Traditional fanous-lit decor', 'Quiet tarawih atmosphere', 'Full Ramadan menu', 'Seasonal (only during Ramadan)'],
    inclusions: ['Boarding 60 min before sunset', 'Dates + water at maghrib', '4-course iftar', 'Traditional decor', 'Quiet quran recitation'],
    exclusions: ['Tips', 'Suhoor take-away (add-on)', 'Hotel transport (add-on)'],
    imagePrompt: 'Cinematic photograph of a traditional Ramadan iftar dinner on a felucca on the Nile at sunset, table set with dates, lentil soup, and Egyptian dishes, fanous lanterns strung throughout the boat in golds and reds and greens, soft warm sunset light, photorealistic professional cultural photography, rich warm color palette, 16:9.',
  },
  {
    slug: 'late-night-jazz-felucca',
    title: 'Late-Night Jazz Felucca',
    shortDescription: 'A 90-minute post-dinner cocktail cruise on the Hathor with the Hagrass Jazz Quartet.',
    description:
      "The Thursday-night signature. Aboard the Hathor (CN-04) departing 21:30, after the dinner seatings are done. The Hagrass Quartet plays a full set — piano, double bass, sax, brushes — as the felucca drifts slowly past the Maadi Corniche. A craft cocktail menu replaces dinner: arak old-fashioned, hibiscus negroni, sage gimlet. Small mezze plates available.",
    duration: '1.5 hour cruise · 2 hr total',
    priceFrom: 60,
    pricingOptions: [
      { id: 'adult', name: 'Adult (21+)', description: 'Cocktail + jazz set · adults only', price: 60 },
    ],
    addons: [
      { id: 'cocktail-flight', name: 'Cocktail Flight (3 mini drinks)', description: 'Three signature cocktails in tasting size', price: 28 },
      { id: 'mezze',           name: 'Late-Night Mezze',                 description: '4 small plates · dukkah labneh, smoked aubergine, fava', price: 22 },
      { id: 'transport',       name: 'Hotel Transport',                  description: 'Round-trip car from any Cairo hotel', price: 25 },
    ],
    highlights: ['Live Hagrass Jazz Quartet', 'Craft cocktail menu', 'Past the Maadi Corniche', 'Adults-only programme', 'Runs Thursday nights only'],
    inclusions: ['Boarding 21:15', 'Welcome arak old-fashioned', 'Full 90-min jazz set', 'Cocktail menu (pay-as-you-go)'],
    exclusions: ['Tips', 'Mezze plates (add-on)', 'Cocktail flight (add-on)'],
    imagePrompt: 'Moody cinematic photograph of a small jazz quartet performing on the foredeck of a felucca at night, piano keyboard and stand-up bass visible, warm spotlight on the musicians, the Cairo Tower lit gold in the distance, intimate adult guests watching with cocktails, photorealistic professional jazz-club photography, deep moody color palette, 16:9.',
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

    for (const cruise of CRUISES) {
      i++;
      const exists = await Attraction.findOne({ slug: cruise.slug });
      if (exists) {
        console.log(`[${i}/${CRUISES.length}] SKIP  ${cruise.slug} (exists)`);
        skipped++;
        continue;
      }

      console.log(`[${i}/${CRUISES.length}] ${cruise.title}`);

      let imageUrl = '';
      try {
        console.log(`  Generating image…`);
        const { base64, mimeType } = await generateImageFromPrompt({
          prompt: cruise.imagePrompt,
          size: '1536x1024',
          quality: 'medium',
          outputFormat: 'jpeg',
        });
        const dataUri = `data:${mimeType};base64,${base64}`;
        const uploaded = await uploadBase64Image(dataUri, `tours/${cruise.slug}`);
        imageUrl = uploaded.url;
        console.log(`  ✅ ${imageUrl}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ⚠️ Image failed: ${msg} — proceeding without`);
      }

      await Attraction.create({
        slug: cruise.slug,
        title: cruise.title,
        shortDescription: cruise.shortDescription,
        description: cruise.description,
        images: imageUrl ? [imageUrl] : [],
        category: 'dining',
        destination: {
          city: 'Cairo',
          country: 'Egypt',
          coordinates: { lat: 30.0444, lng: 31.2357 },
        },
        duration: cruise.duration,
        languages: ['English', 'Arabic', 'German', 'French'],
        rating: 4.8 + Math.round(Math.random() * 2) / 10,
        reviewCount: 80 + Math.floor(Math.random() * 220),
        priceFrom: cruise.priceFrom,
        currency: 'USD',
        pricingOptions: cruise.pricingOptions,
        addons: cruise.addons,
        entryWindows: [
          { label: 'Evening seating', startTime: '18:30', endTime: '21:30' },
        ],
        itinerary: [],
        highlights: cruise.highlights,
        inclusions: cruise.inclusions,
        exclusions: cruise.exclusions,
        meetingPoint: {
          address: 'Garden City Marina, Corniche El-Nil, Cairo',
          instructions: 'Boarding opens 20 minutes before departure. Parking is free at the marina.',
          mapUrl: 'https://maps.google.com/?q=30.0408,31.2270',
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
