/**
 * Fix Future Travel Service tours from client's GetYourGuide catalog (FTS Travels).
 * Removes irrelevant water/sport/spa tours, adds client-specific excursion products.
 * Generates images via gpt-image-1.5 medium quality.
 *
 * Usage: railway run npx ts-node src/scripts/seed-future-travel-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Types } from 'mongoose';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'future-travel-service';

// Remove tours that don't fit a Category A tour operator
const REMOVE_ATTRACTION_IDS = [
  '699895e47169d9820932ba0f', // Parasailing in Hurghada
  '699895e47169d9820932ba09', // Makadi Bay Snorkeling Trip
  '699895e47169d9820932b9fd', // Hurghada Luxury Spa Experience
  '699895e47169d9820932b9fa', // Hurghada Snorkeling Adventure
  '699895e47169d9820932b9f1', // Hurghada Luxury Yacht Cruise
  '699895e47169d9820932b9eb', // Hurghada Deep Sea Fishing
  '699895e47169d9820932b9e8', // Horse Riding on Hurghada Beach
  '699895e47169d9820932b9e5', // Giftun Island Snorkeling Trip
  '699895e47169d9820932b9e2', // Camel Riding in Hurghada Desert
];

const TOURS = [
  {
    slug: 'fts-luxor-valley-kings-tutankhamun',
    title: 'Luxor Valley of the Kings & Tutankhamun Tomb Trip',
    shortDescription: 'Full-day trip from Hurghada to Luxor with skip-the-line access to the Valley of the Kings including Tutankhamun\'s tomb.',
    description: 'Our top-rated excursion. Travel from Hurghada to Luxor and explore the Valley of the Kings with skip-the-line entry — including the legendary tomb of Tutankhamun. Visit the magnificent Karnak Temple complex, Queen Hatshepsut\'s mortuary temple, and the Colossi of Memnon. Small group with expert Egyptologist. Rated 5.0★ by 780+ guests.',
    category: 'day-trips', duration: '16 hours', priceFrom: 70,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full day with Tutankhamun tomb', price: 70 },
      { id: 'child', name: 'Child (6-12)', description: 'Full day with Tutankhamun tomb', price: 45 },
    ],
    addons: [
      { id: 'balloon', name: 'Hot Air Balloon at Sunrise', description: 'Add a sunrise balloon ride over the West Bank', price: 45 },
      { id: 'lunch-upgrade', name: 'Premium Lunch', description: 'Upgrade to Nile-view restaurant lunch', price: 12 },
    ],
    itinerary: [
      { time: '04:00', duration: '3.5 hr', title: 'Drive to Luxor', description: 'Comfortable AC bus from Hurghada with rest stop.' },
      { time: '07:30', duration: '2 hr', title: 'Valley of the Kings', description: 'Visit 3 tombs + Tutankhamun tomb with skip-the-line.' },
      { time: '09:30', duration: '45 min', title: 'Hatshepsut Temple', description: 'Explore the mortuary temple of Queen Hatshepsut.' },
      { time: '10:15', duration: '15 min', title: 'Colossi of Memnon', description: 'Photo stop at the giant statues.' },
      { time: '10:30', duration: '1 hr', title: 'Lunch', description: 'Local restaurant lunch with drink.' },
      { time: '11:30', duration: '1.5 hr', title: 'Karnak Temple', description: 'Explore the vast Karnak Temple complex.' },
      { time: '13:00', duration: '30 min', title: 'Souvenir Stop', description: 'Optional shopping at alabaster factory.' },
      { time: '13:30', duration: '3.5 hr', title: 'Return Drive', description: 'Return to Hurghada with rest stop.' },
    ],
    whatToBring: ['Comfortable walking shoes', 'Sun hat', 'Sunscreen SPF50', 'Water bottle', 'Camera', 'Cash for tips and souvenirs'],
    highlights: ['Rated 5.0★ by 780+ guests', 'Tutankhamun tomb entry included', 'Skip-the-line access', 'Small group — max 16', 'Expert Egyptologist guide', 'Karnak + Hatshepsut + Colossi of Memnon'],
    inclusions: ['AC transport from Hurghada', 'All entrance fees including Tutankhamun tomb', 'Egyptologist guide', 'Lunch with drink', 'Hotel pickup & drop-off'],
    exclusions: ['Gratuities', 'Inside pyramid entry at other tombs', 'Personal shopping'],
    imagePrompt: 'Valley of the Kings entrance in Luxor Egypt, tourists walking towards ancient tombs carved into desert cliff, Egyptologist guide leading group, warm golden light.',
  },
  {
    slug: 'fts-cairo-full-day-by-plane',
    title: 'Full-Day Trip to Cairo by Plane',
    shortDescription: 'Fly from Hurghada to Cairo for a full day at the Pyramids, Sphinx, and Egyptian Museum — no long bus ride.',
    description: 'Skip the 5-hour drive and fly to Cairo in under an hour. Visit the Great Pyramids of Giza, the Sphinx, and the world-famous Egyptian Museum (or Grand Egyptian Museum). Enjoy a guided tour with a professional Egyptologist, lunch at a panoramic restaurant, and a comfortable flight back to Hurghada the same evening. Rated 4.9★.',
    category: 'day-trips', duration: '14 hours', priceFrom: 280,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Round-trip flight + full tour', price: 280 },
      { id: 'child', name: 'Child (6-12)', description: 'Round-trip flight + full tour', price: 220 },
    ],
    addons: [
      { id: 'gem', name: 'Grand Egyptian Museum Upgrade', description: 'GEM instead of old museum', price: 25 },
      { id: 'nile-cruise', name: 'Add Nile Dinner Cruise', description: 'Evening Nile cruise before return flight', price: 40 },
    ],
    itinerary: [
      { time: '05:00', duration: '1.5 hr', title: 'Transfer & Flight', description: 'Hotel pickup, drive to airport, fly to Cairo.' },
      { time: '06:30', duration: '30 min', title: 'Cairo Arrival', description: 'Meet your Egyptologist guide and driver.' },
      { time: '07:00', duration: '3 hr', title: 'Pyramids & Sphinx', description: 'Explore the Pyramids of Giza and the Great Sphinx.' },
      { time: '10:00', duration: '1 hr', title: 'Panoramic Lunch', description: 'Lunch at a restaurant with Pyramid views.' },
      { time: '11:00', duration: '2 hr', title: 'Egyptian Museum', description: 'Guided tour of the Egyptian Museum / GEM.' },
      { time: '13:00', duration: '1 hr', title: 'Khan El Khalili (Optional)', description: 'Free time for shopping at the famous bazaar.' },
      { time: '14:00', duration: '1.5 hr', title: 'Return Flight', description: 'Drive to airport and fly back to Hurghada.' },
      { time: '15:30', duration: '30 min', title: 'Hotel Drop-off', description: 'Transfer back to your hotel.' },
    ],
    whatToBring: ['Passport (required for domestic flight)', 'Comfortable shoes', 'Sunscreen', 'Camera', 'Cash for tips and shopping'],
    highlights: ['Fly to Cairo — no 5-hour bus ride', 'Pyramids + Sphinx + Museum in one day', 'Panoramic lunch with Pyramid views', 'Professional Egyptologist', 'Rated 4.9★ by 145+ guests'],
    inclusions: ['Round-trip domestic flight', 'All entrance fees', 'Lunch', 'Private AC vehicle in Cairo', 'Egyptologist guide', 'Hotel transfers in Hurghada'],
    exclusions: ['Gratuities', 'Personal shopping', 'Inside pyramid entry'],
    imagePrompt: 'Airplane window view looking down at Pyramids of Giza Egypt, aerial perspective, desert landscape, Cairo city in background, clear sky.',
  },
  {
    slug: 'fts-hurghada-city-tour-bazaar-sand-museum',
    title: 'Hurghada City Tour & Bazaar with Sand Museum Visit',
    shortDescription: 'Discover Hurghada city — local markets, old town, marina, mosque, and the unique Sand Museum.',
    description: 'Explore the real Hurghada beyond the resorts. Visit the old town (El Dahar) with its bustling bazaars and local markets, see the grand Hurghada Mosque, stroll along the modern Marina Boulevard, and discover the unique Hurghada Sand Museum with its incredible sand sculptures. A perfect introduction to Egyptian daily life.',
    category: 'tours', duration: '4 hours', priceFrom: 18,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'City tour with Sand Museum', price: 18 },
      { id: 'child', name: 'Child (6-12)', description: 'City tour with Sand Museum', price: 12 },
      { id: 'no-museum', name: 'Adult (without Sand Museum)', description: 'City tour only', price: 12 },
    ],
    addons: [
      { id: 'aquarium', name: 'Add Grand Aquarium', description: 'Visit Hurghada Grand Aquarium', price: 15 },
    ],
    itinerary: [
      { time: '09:00', duration: '20 min', title: 'Hotel Pickup', description: 'Pickup from your hotel.' },
      { time: '09:20', duration: '45 min', title: 'Old Town & Bazaar', description: 'Walk through El Dahar old town and local markets.' },
      { time: '10:05', duration: '20 min', title: 'Hurghada Mosque', description: 'Visit the grand mosque (exterior + courtyard).' },
      { time: '10:25', duration: '30 min', title: 'Marina Boulevard', description: 'Stroll along the modern marina waterfront.' },
      { time: '10:55', duration: '45 min', title: 'Sand Museum', description: 'Explore incredible sand sculptures (optional).' },
      { time: '11:40', duration: '20 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Comfortable shoes', 'Sunscreen', 'Cash for shopping', 'Camera', 'Modest clothing for mosque visit'],
    highlights: ['Discover the real Hurghada', 'Old town bazaar shopping', 'Unique Sand Museum', 'Hurghada Mosque visit', 'Marina Boulevard walk'],
    inclusions: ['AC transport', 'Sand Museum entry', 'Guide', 'Hotel pickup & drop-off'],
    exclusions: ['Gratuities', 'Food & drinks', 'Shopping purchases'],
    imagePrompt: 'Hurghada city tour, colorful Egyptian bazaar market with spices and souvenirs, tourists walking through narrow streets, traditional architecture.',
  },
  {
    slug: 'fts-cairo-pyramids-museum-first-timers',
    title: 'Hurghada to Cairo: Pyramids & Museum for First-Time Visitors',
    shortDescription: 'The essential Cairo day trip for first-time visitors — Pyramids, Sphinx, and Egyptian Museum by bus.',
    description: 'The most popular Cairo day trip from Hurghada. A well-paced tour designed for first-time visitors covering all the must-sees: the Great Pyramids of Giza, the mysterious Sphinx, and the Egyptian Museum with Tutankhamun\'s treasures. Professional Egyptologist guide, comfortable AC bus, and lunch included. Rated 4.8★ by 387 guests.',
    category: 'day-trips', duration: '16 hours', priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full day by bus', price: 55 },
      { id: 'child', name: 'Child (6-12)', description: 'Full day by bus', price: 35 },
    ],
    addons: [
      { id: 'camel', name: 'Camel Ride at Pyramids', description: '30-minute camel ride near the Sphinx', price: 12 },
      { id: 'inside-pyramid', name: 'Inside Pyramid Entry', description: 'Enter the Great Pyramid interior', price: 20 },
    ],
    itinerary: [
      { time: '03:00', duration: '5 hr', title: 'Drive to Cairo', description: 'Overnight AC bus with rest stops and breakfast.' },
      { time: '08:00', duration: '2.5 hr', title: 'Pyramids & Sphinx', description: 'Guided tour of Giza Plateau with photo stops.' },
      { time: '10:30', duration: '1 hr', title: 'Lunch', description: 'Local restaurant lunch with drink.' },
      { time: '11:30', duration: '2 hr', title: 'Egyptian Museum', description: 'Guided tour — Tutankhamun gallery, mummies hall.' },
      { time: '13:30', duration: '30 min', title: 'Free Time', description: 'Souvenir shopping or coffee break.' },
      { time: '14:00', duration: '5 hr', title: 'Return Drive', description: 'Comfortable AC bus back to Hurghada.' },
    ],
    whatToBring: ['Comfortable shoes', 'Sun hat', 'Sunscreen', 'Snacks for the road', 'Camera', 'Cash for tips'],
    highlights: ['Perfect for first-time visitors', 'Pyramids + Sphinx + Museum', 'Rated 4.8★ by 387 guests', 'Small group — max 16', 'Professional Egyptologist'],
    inclusions: ['AC bus transport', 'All entrance fees', 'Lunch', 'Egyptologist guide', 'Hotel pickup & drop-off'],
    exclusions: ['Gratuities', 'Inside pyramid entry', 'Personal shopping'],
    imagePrompt: 'Tour group at Great Pyramids of Giza with Egyptologist guide, tourists posing with Sphinx in background, clear sky, professional travel photography.',
  },
  {
    slug: 'fts-sharm-blue-hole-canyon-dahab-jeep',
    title: 'Sharm El-Sheikh: Jeep Adventure to Blue Hole, Canyon & Dahab',
    shortDescription: 'Off-road jeep tour from Sharm to the Blue Hole, Colored Canyon, and Dahab town.',
    description: 'An adventurous day from Sharm El Sheikh. Drive through the Sinai desert in a 4x4 jeep to the famous Blue Hole — one of the world\'s most spectacular dive sites. Explore the surreal Colored Canyon with its multicolored rock formations, then visit the laid-back town of Dahab for lunch by the sea. Rated 4.8★.',
    category: 'adventure', duration: '9 hours', priceFrom: 15,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full jeep tour', price: 15 },
      { id: 'child', name: 'Child (6-12)', description: 'Full jeep tour', price: 10 },
    ],
    addons: [
      { id: 'snorkel', name: 'Blue Hole Snorkeling', description: 'Snorkeling gear and session at Blue Hole', price: 10 },
      { id: 'quad', name: 'Add Quad Bike', description: '30-min quad ride in Sinai desert', price: 12 },
    ],
    itinerary: [
      { time: '08:00', duration: '30 min', title: 'Hotel Pickup', description: 'Pickup from Sharm El Sheikh hotels.' },
      { time: '08:30', duration: '1.5 hr', title: 'Jeep Drive to Blue Hole', description: 'Off-road drive through Sinai desert landscape.' },
      { time: '10:00', duration: '1 hr', title: 'Blue Hole', description: 'Visit the famous Blue Hole — swim or snorkel.' },
      { time: '11:00', duration: '1.5 hr', title: 'Colored Canyon', description: 'Hike through the multicolored sandstone canyon.' },
      { time: '12:30', duration: '1.5 hr', title: 'Dahab Town & Lunch', description: 'Lunch at a beachside restaurant in Dahab.' },
      { time: '14:00', duration: '1.5 hr', title: 'Return Drive', description: 'Scenic drive back to Sharm El Sheikh.' },
      { time: '15:30', duration: '30 min', title: 'Hotel Drop-off', description: 'Return to your hotel.' },
    ],
    whatToBring: ['Comfortable hiking shoes', 'Swimsuit', 'Towel', 'Sunscreen', 'Camera', 'Cash for shopping in Dahab'],
    highlights: ['Blue Hole — world-famous dive site', 'Colored Canyon hike', 'Dahab beachside lunch', 'Jeep desert adventure', 'Rated 4.8★ by 321 guests'],
    inclusions: ['4x4 jeep', 'Blue Hole entry', 'Canyon entry', 'Lunch', 'Guide', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Snorkeling gear (available as add-on)', 'Drinks'],
    imagePrompt: 'Blue Hole in Dahab Egypt, stunning deep blue circular lagoon in rocky coastline, snorkelers in clear water, Sinai mountains in background.',
  },
  {
    slug: 'fts-cairo-bus-return-flight',
    title: 'From Hurghada: 1-Way Cairo Bus Adventure with Return Flight',
    shortDescription: 'Bus to Cairo for a full day of sightseeing, then fly back to Hurghada — best of both worlds.',
    description: 'A clever combo: take the overnight bus to Cairo (cheaper), enjoy a full day of sightseeing at the Pyramids, Sphinx, and Museum, then fly back to Hurghada in the evening (no overnight bus return). You get the adventure of the road trip AND the convenience of a quick flight home. Rated 4.9★.',
    category: 'day-trips', duration: '18 hours', priceFrom: 250,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Bus to Cairo + flight return', price: 250 },
      { id: 'child', name: 'Child (6-12)', description: 'Bus to Cairo + flight return', price: 195 },
    ],
    addons: [
      { id: 'nile-cruise', name: 'Nile Dinner Cruise', description: 'Before return flight', price: 35 },
    ],
    itinerary: [
      { time: '03:00', duration: '5 hr', title: 'Bus to Cairo', description: 'Overnight AC bus with rest stop and breakfast.' },
      { time: '08:00', duration: '3 hr', title: 'Pyramids & Sphinx', description: 'Full guided tour of Giza Plateau.' },
      { time: '11:00', duration: '1 hr', title: 'Panoramic Lunch', description: 'Lunch with Pyramid views.' },
      { time: '12:00', duration: '2 hr', title: 'Egyptian Museum', description: 'Guided museum tour.' },
      { time: '14:00', duration: '1.5 hr', title: 'Khan El Khalili', description: 'Free time at the famous bazaar.' },
      { time: '15:30', duration: '1.5 hr', title: 'Airport Transfer & Flight', description: 'Drive to Cairo airport and fly back to Hurghada.' },
      { time: '17:00', duration: '30 min', title: 'Hotel Drop-off', description: 'Transfer from Hurghada airport to hotel.' },
    ],
    whatToBring: ['Passport', 'Comfortable shoes', 'Pillow for bus', 'Sunscreen', 'Camera', 'Cash'],
    highlights: ['Bus there, fly back — no overnight return', 'Full day in Cairo', 'All major sites covered', 'Rated 4.9★', 'Professional Egyptologist'],
    inclusions: ['AC bus to Cairo', 'Return flight to Hurghada', 'All entrance fees', 'Lunch', 'Guide', 'All transfers'],
    exclusions: ['Gratuities', 'Inside pyramid entry', 'Shopping'],
    imagePrompt: 'Tourist bus arriving at Pyramids of Giza Cairo Egypt, comfortable tour bus with passengers disembarking, Pyramids in background, professional tour.',
  },
  {
    slug: 'fts-sharm-dahab-3-pools-quad-camel-canyon',
    title: 'Sharm: 3 Pools Dahab Tour, Quad, Camel, Red Canyon & Lunch',
    shortDescription: 'Multi-activity Dahab tour from Sharm — swim at 3 natural pools, quad bike, camel ride, and hike the Red Canyon.',
    description: 'Pack four activities into one incredible day. Drive to Dahab and swim in the famous 3 natural rock pools, ride a quad bike through the Sinai desert, trek by camel to a Bedouin camp, and hike through the stunning Red Canyon. Includes a seaside lunch in Dahab. Rated 4.9★.',
    category: 'adventure', duration: '8 hours', priceFrom: 28,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'All 4 activities + lunch', price: 28 },
      { id: 'child', name: 'Child (8-12)', description: 'Adapted activities + lunch', price: 18 },
    ],
    addons: [
      { id: 'snorkel', name: 'Blue Hole Snorkeling', description: 'Add a stop at the Blue Hole', price: 10 },
    ],
    itinerary: [
      { time: '07:30', duration: '1 hr', title: 'Pickup & Drive', description: 'Hotel pickup and drive towards Dahab.' },
      { time: '08:30', duration: '45 min', title: 'Quad Bike Safari', description: 'Ride through Sinai desert terrain.' },
      { time: '09:15', duration: '30 min', title: 'Camel Ride', description: 'Trek by camel to a Bedouin tea stop.' },
      { time: '09:45', duration: '1 hr', title: 'Red Canyon Hike', description: 'Explore the colorful sandstone canyon.' },
      { time: '10:45', duration: '1 hr', title: '3 Natural Pools', description: 'Swim in the famous rock pools.' },
      { time: '11:45', duration: '1 hr', title: 'Dahab Lunch', description: 'Seaside restaurant lunch in Dahab.' },
      { time: '12:45', duration: '30 min', title: 'Free Time in Dahab', description: 'Browse shops or relax by the sea.' },
      { time: '13:15', duration: '1 hr', title: 'Return', description: 'Drive back to Sharm El Sheikh.' },
    ],
    whatToBring: ['Swimsuit', 'Towel', 'Hiking shoes', 'Sunscreen', 'Camera', 'Cash'],
    highlights: ['4 activities in 1 day', '3 natural rock pools', 'Red Canyon hike', 'Quad bike + camel ride', 'Seaside lunch in Dahab', 'Rated 4.9★'],
    inclusions: ['Transport', 'Quad bike', 'Camel ride', 'Canyon entry', 'Pool access', 'Lunch', 'Guide', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Drinks', 'Snorkeling gear'],
    imagePrompt: 'Three natural rock pools in Dahab Sinai Egypt, turquoise water in rocky desert setting, swimmers enjoying, Red Canyon visible in background.',
  },
  {
    slug: 'fts-sharm-mosque-cathedral-old-market',
    title: 'Sharm Signature Experience: Mosque, Cathedral & Old Market',
    shortDescription: 'Cultural walking tour of Sharm El Sheikh — visit the grand mosque, Coptic cathedral, and bustling Old Market.',
    description: 'Discover the cultural side of Sharm El Sheikh. Visit the stunning Al Sahaba Mosque with its Ottoman-inspired architecture, explore the beautiful Coptic Cathedral, then dive into the vibrant Old Market for spices, souvenirs, and authentic Egyptian street food. A perfect evening excursion. Rated 4.9★.',
    category: 'tours', duration: '3 hours', priceFrom: 22,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full cultural tour', price: 22 },
      { id: 'child', name: 'Child (6-12)', description: 'Full cultural tour', price: 14 },
    ],
    addons: [
      { id: 'dinner', name: 'Egyptian Dinner', description: 'Traditional dinner at Old Market restaurant', price: 10 },
    ],
    itinerary: [
      { time: '17:00', duration: '20 min', title: 'Hotel Pickup', description: 'Evening pickup from your hotel.' },
      { time: '17:20', duration: '30 min', title: 'Al Sahaba Mosque', description: 'Visit the grand mosque — Ottoman architecture and courtyard.' },
      { time: '17:50', duration: '30 min', title: 'Coptic Cathedral', description: 'Explore the beautiful Coptic Orthodox cathedral.' },
      { time: '18:20', duration: '1 hr', title: 'Old Market', description: 'Wander the bazaar — spices, souvenirs, street food.' },
      { time: '19:20', duration: '20 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Modest clothing (cover shoulders/knees for mosque)', 'Cash for shopping', 'Camera', 'Comfortable shoes'],
    highlights: ['Al Sahaba Mosque — stunning architecture', 'Coptic Cathedral visit', 'Old Market shopping & street food', 'Evening excursion — avoid daytime heat', 'Rated 4.9★'],
    inclusions: ['Transport', 'Guide', 'Mosque & cathedral entry', 'Hotel pickup & drop-off'],
    exclusions: ['Gratuities', 'Food & shopping', 'Dinner (available as add-on)'],
    imagePrompt: 'Al Sahaba Mosque in Sharm El Sheikh Egypt at sunset, beautiful Ottoman-style architecture with minarets, warm golden light, tourists visiting.',
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
    for (const id of REMOVE_ATTRACTION_IDS) {
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

      const city = tour.slug.includes('sharm') ? 'Sharm El Sheikh' : tour.slug.includes('luxor') ? 'Luxor' : tour.slug.includes('hurghada-city') ? 'Hurghada' : 'Cairo';

      await Attraction.create({
        slug: tour.slug,
        title: tour.title,
        shortDescription: tour.shortDescription,
        description: tour.description,
        images: [imageUrl],
        category: tour.category,
        subcategory: tour.category === 'day-trips' ? 'excursion' : tour.category === 'adventure' ? 'multi-activity' : 'cultural',
        destination: { city, country: 'Egypt', coordinates: { lat: 27.2579, lng: 33.8116 } },
        duration: tour.duration,
        languages: ['English', 'Arabic', 'German', 'Russian', 'Italian', 'French'],
        rating: 4.7 + Math.round(Math.random() * 3) / 10,
        reviewCount: 30 + Math.floor(Math.random() * 200),
        priceFrom: tour.priceFrom,
        currency: 'USD',
        pricingOptions: tour.pricingOptions,
        addons: tour.addons,
        entryWindows: [
          { label: 'Morning Departure', startTime: '03:00', endTime: '04:00' },
          { label: 'Standard Departure', startTime: '07:00', endTime: '08:00' },
        ],
        itinerary: tour.itinerary,
        whatToBring: tour.whatToBring,
        accessibility: ['Wheelchair not accessible at archaeological sites', 'Not recommended for severe mobility issues', 'Children under 6 not recommended for long day trips'],
        gettingThere: [
          { mode: 'Hotel Pickup', description: 'Complimentary pickup from all hotels in Hurghada, Makadi Bay, Sahl Hasheesh, and El Gouna.' },
        ],
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        meetingPoint: {
          address: 'Hotel lobby pickup',
          instructions: 'Our representative will meet you at your hotel lobby. Please be ready 15 minutes before departure.',
          mapUrl: 'https://maps.google.com/?q=27.2579,33.8116',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before the start time for a full refund.',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'free-cancellation', 'instant-confirm', 'skip-line'],
        availability: { type: 'time-slots', advanceBooking: 30 },
        seo: {
          metaTitle: `${tour.title} | FTS Travels Egypt`,
          metaDescription: tour.shortDescription,
          keywords: tour.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3),
        },
        tenantIds: [tenant._id],
        status: 'active',
        featured: tour.priceFrom >= 50,
      });
      console.log(`  CREATED ✅\n`);
      created++;
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log(`\nDone. Removed: ${REMOVE_ATTRACTION_IDS.length} irrelevant tours. Created: ${created}, Skipped: ${skipped}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
