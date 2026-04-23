/**
 * Fix tenant tour assignments:
 *  1. Remove irrelevant tours from 5 tenants
 *  2. Seed tours for 4 empty tenants
 *
 * Usage: railway run npx ts-node src/scripts/fix-tenant-tour-assignments.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Types } from 'mongoose';

// ── Part 1: Remove irrelevant tour assignments ──────────────────────

// Attraction IDs to REMOVE from each tenant's tours
const REMOVALS: Record<string, string[]> = {
  // horse-riding-hurghada: remove everything except horse riding tours
  '699895e47169d9820932b9ba': [
    '699895e47169d9820932b9fd', // Hurghada Luxury Spa
    '699895e47169d9820932ba0c', // Orange Bay Island Excursion
    '699895e47169d9820932ba0f', // Parasailing
    '699895e47169d9820932b9e2', // Camel Riding
    '699895e47169d9820932b9e5', // Giftun Island Snorkeling
    '699895e47169d9820932b9eb', // Deep Sea Fishing
    '699895e47169d9820932b9f1', // Luxury Yacht Cruise
    '699895e47169d9820932b9f7', // Private City Tour
    '699895e47169d9820932b9fa', // Snorkeling Adventure
  ],
  // hurghada-snorkeling: remove non-snorkeling tours
  '699895e47169d9820932b9cb': [
    '699895e47169d9820932b9fd', // Hurghada Luxury Spa
    '699895e47169d9820932ba0c', // Orange Bay Island Excursion (generic)
    '699895e47169d9820932ba0f', // Parasailing
    '699895e47169d9820932b9e2', // Camel Riding
    '699895e47169d9820932b9e8', // Horse Riding on Beach
    '699895e47169d9820932b9eb', // Deep Sea Fishing
    '699895e47169d9820932b9f1', // Luxury Yacht Cruise
    '699895e47169d9820932b9f7', // Private City Tour
  ],
  // camel-safari-hurghada: remove horse riding
  '69cf5d42af49d480e4d15db7': [
    '699895e47169d9820932b9e8', // Horse Riding on Hurghada Beach
    '699895e47169d9820932ba2a', // Camel Ride at the Pyramids of Giza
  ],
  // makadi-bay-safari-center: remove horse riding
  '69cf5d42af49d480e4d15db8': [
    '699895e47169d9820932b9e8', // Horse Riding on Hurghada Beach
    '699895e47169d9820932b9e2', // Camel Riding in Hurghada Desert
  ],
  // royal-cruise-hurghada: remove off-city and non-cruise products
  '69cf5d42af49d480e4d15db6': [
    '699895e47169d9820932ba0f', // Parasailing in Hurghada
    '699895e47169d9820932b9d9', // Cairo Night Cruise on the Nile
    '699895e47169d9820932ba1b', // Sunset Felucca Ride on the Nile
    '69d75ab864766bb00708e502', // Pyramids, Museum Visit & Dinner Cruise Combo
    '69d75c5064766bb00708e535', // Pyramids Museum & Dinner Cruise Combo
    '699895e47169d9820932ba2d', // Sharm El Sheikh Dinner Cruise
  ],
  // sea-horse-sahl-hashesh: keep only this client's dedicated horse/safari inventory
  '69cf5d42af49d480e4d15db5': [
    '699895e47169d9820932b9e2', // Camel Riding in Hurghada Desert
    '699895e47169d9820932b9e8', // Horse Riding on Hurghada Beach
  ],
};

// ── Part 2: Seed tours for empty tenants ────────────────────────────

interface TourSeed {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  duration: string;
  priceFrom: number;
  pricingOptions: Array<{ id: string; name: string; description: string; price: number }>;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  addons: Array<{ id: string; name: string; description: string; price: number }>;
}

const CAIRO_FROM_HURGHADA_TOURS: TourSeed[] = [
  {
    slug: 'cairo-day-trip-pyramids-museum',
    title: 'Cairo Day Trip: Pyramids & Egyptian Museum',
    shortDescription: 'Full day tour from Hurghada to Cairo visiting the Pyramids of Giza and the Egyptian Museum.',
    description: 'Travel from Hurghada to Cairo by private air-conditioned vehicle. Visit the Great Pyramids of Giza, the Sphinx, and the Egyptian Museum with its treasures of Tutankhamun. Includes lunch at a local restaurant and all entrance fees.',
    category: 'day-trips', duration: '14 hours', priceFrom: 65,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full tour', price: 65 },
      { id: 'child', name: 'Child (6-12)', description: 'Full tour', price: 45 },
    ],
    highlights: ['Great Pyramids of Giza & Sphinx', 'Egyptian Museum', 'Lunch included', 'Private AC vehicle', 'Expert Egyptologist guide'],
    inclusions: ['Private transport from Hurghada', 'Entrance fees', 'Lunch', 'English-speaking Egyptologist'],
    exclusions: ['Gratuities', 'Personal expenses', 'Inside pyramid entry'],
    addons: [{ id: 'pyramid-entry', name: 'Inside Pyramid Entry', description: 'Enter the Great Pyramid', price: 20 }],
  },
  {
    slug: 'cairo-overnight-pyramids-khan-khalili',
    title: 'Cairo Overnight: Pyramids, Old Cairo & Khan El Khalili',
    shortDescription: 'Two-day Cairo experience with pyramids, Coptic Cairo, Islamic quarter, and shopping bazaars.',
    description: 'Enjoy a two-day immersive Cairo trip from Hurghada. Day one covers the Pyramids, Sphinx, and Saqqara. Overnight at a 4-star hotel. Day two explores Old Cairo — Coptic churches, the Citadel, and the famous Khan El Khalili bazaar.',
    category: 'day-trips', duration: '2 days', priceFrom: 150,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full 2-day tour', price: 150 },
      { id: 'child', name: 'Child (6-12)', description: 'Full 2-day tour', price: 100 },
    ],
    highlights: ['2-day comprehensive Cairo experience', 'Pyramids, Sphinx & Saqqara', 'Khan El Khalili bazaar', '4-star hotel overnight', 'Coptic Cairo & Citadel'],
    inclusions: ['All transport', 'Hotel night (4-star)', 'Breakfast & 2 lunches', 'All entrance fees', 'Egyptologist guide'],
    exclusions: ['Dinner', 'Gratuities', 'Shopping'],
    addons: [{ id: 'nile-dinner', name: 'Nile Dinner Cruise', description: 'Evening cruise with dinner and show', price: 35 }],
  },
  {
    slug: 'cairo-pyramids-sakkara-dahshur',
    title: 'Cairo Tour: Pyramids, Sakkara & Dahshur',
    shortDescription: 'Visit all three pyramid sites — Giza, Sakkara step pyramid, and the Red & Bent Pyramids at Dahshur.',
    description: 'For pyramid enthusiasts, this tour covers all three major pyramid complexes. Start at Giza with the Great Pyramid and Sphinx, continue to Sakkara to see the Step Pyramid of Djoser, then drive to Dahshur for the unique Red and Bent Pyramids — far fewer crowds.',
    category: 'day-trips', duration: '15 hours', priceFrom: 75,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full tour', price: 75 },
      { id: 'child', name: 'Child (6-12)', description: 'Full tour', price: 50 },
    ],
    highlights: ['Three pyramid complexes in one day', 'Giza, Sakkara & Dahshur', 'Step Pyramid, Red Pyramid, Bent Pyramid', 'Fewer crowds at Dahshur', 'Expert Egyptologist'],
    inclusions: ['Private transport', 'All entrance fees', 'Lunch', 'Guide', 'Water'],
    exclusions: ['Gratuities', 'Inside pyramid entry'],
    addons: [{ id: 'camel', name: 'Camel Ride at Pyramids', description: '30 min camel ride near the Sphinx', price: 15 }],
  },
  {
    slug: 'cairo-pyramids-nile-dinner-cruise',
    title: 'Cairo Day Trip with Nile Dinner Cruise',
    shortDescription: 'Visit the Pyramids by day, enjoy a Nile dinner cruise with belly dancing by night.',
    description: 'A magical day-into-night Cairo experience. Explore the Pyramids and Sphinx during the day, enjoy free time for shopping, then board a 5-star Nile cruise for dinner with live music, a Tanoura show, and belly dancing.',
    category: 'day-trips', duration: '18 hours', priceFrom: 95,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full day + dinner cruise', price: 95 },
      { id: 'child', name: 'Child (6-12)', description: 'Full day + dinner cruise', price: 65 },
    ],
    highlights: ['Pyramids of Giza & Sphinx', '5-star Nile dinner cruise', 'Belly dancing & Tanoura show', 'Late return (arrive back ~2am)', 'Unforgettable day and night'],
    inclusions: ['Transport', 'Entrance fees', 'Lunch', 'Dinner cruise', 'Guide'],
    exclusions: ['Drinks on cruise', 'Gratuities'],
    addons: [{ id: 'sound-light', name: 'Pyramids Sound & Light Show', description: 'Evening sound and light show at Giza', price: 25 }],
  },
  {
    slug: 'cairo-private-vip-tour-hurghada',
    title: 'Private VIP Cairo Tour from Hurghada',
    shortDescription: 'Luxury private Cairo tour with personal Egyptologist, premium vehicle, and VIP access.',
    description: 'The ultimate Cairo day trip experience. Travel in a luxury vehicle with your own Egyptologist. Skip the lines at the Pyramids, enjoy a gourmet lunch overlooking the Sphinx, and get VIP access to the Egyptian Museum.',
    category: 'day-trips', duration: '14 hours', priceFrom: 120,
    pricingOptions: [
      { id: 'per-person', name: 'Per Person (min 2)', description: 'VIP experience', price: 120 },
    ],
    highlights: ['Private luxury vehicle', 'Personal Egyptologist', 'Skip-the-line access', 'Gourmet lunch with Sphinx view', 'Flexible itinerary'],
    inclusions: ['Premium private transport', 'All entrance fees + VIP access', 'Gourmet lunch', 'Private Egyptologist', 'Water & snacks'],
    exclusions: ['Gratuities'],
    addons: [{ id: 'flight', name: 'Domestic Flight Upgrade', description: 'Fly Cairo↔Hurghada instead of driving', price: 80 }],
  },
];

const CAIRO_PACKAGES_TOURS: TourSeed[] = [
  {
    slug: 'cairo-3-day-highlights-package',
    title: '3-Day Cairo Highlights Package',
    shortDescription: 'Comprehensive 3-day Cairo package covering all major sites with hotel and meals included.',
    description: 'The complete Cairo experience in 3 days. Day 1: Pyramids, Sphinx, and Memphis. Day 2: Egyptian Museum, Citadel, and Khan El Khalili. Day 3: Coptic Cairo, Al-Azhar, and Nile felucca ride. Includes 4-star hotel, all meals, and transfers.',
    category: 'tours', duration: '3 days', priceFrom: 250,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: '3-day package', price: 250 },
      { id: 'child', name: 'Child (6-12)', description: '3-day package', price: 170 },
    ],
    highlights: ['3 full days of sightseeing', 'All major Cairo landmarks', '4-star hotel (2 nights)', 'All meals included', 'Private Egyptologist'],
    inclusions: ['Airport/hotel transfers', 'Hotel accommodation', 'All meals', 'Entrance fees', 'Guide'],
    exclusions: ['Flights', 'Gratuities', 'Personal shopping'],
    addons: [{ id: 'upgrade-5star', name: '5-Star Hotel Upgrade', description: 'Upgrade to Marriott or Hilton', price: 60 }],
  },
  {
    slug: 'cairo-alexandria-2-day-combo',
    title: 'Cairo & Alexandria 2-Day Combo',
    shortDescription: 'Visit Cairo Pyramids one day and the Mediterranean city of Alexandria the next.',
    description: 'Combine Egypt\'s two greatest cities. Day 1 explores the Pyramids and Egyptian Museum. Day 2 drives to Alexandria for the Citadel of Qaitbay, Bibliotheca Alexandrina, Montazah Palace, and seafood lunch on the corniche.',
    category: 'tours', duration: '2 days', priceFrom: 180,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: '2-day combo', price: 180 },
      { id: 'child', name: 'Child (6-12)', description: '2-day combo', price: 120 },
    ],
    highlights: ['Two iconic Egyptian cities', 'Pyramids + Bibliotheca Alexandrina', 'Mediterranean seafood lunch', 'Qaitbay Citadel & Montazah Palace', '4-star hotel overnight'],
    inclusions: ['All transport', 'Hotel', 'Lunches', 'Entrance fees', 'Guide'],
    exclusions: ['Dinner', 'Gratuities'],
    addons: [{ id: 'alex-extra', name: 'Alexandria Catacombs', description: 'Visit the Catacombs of Kom El Shoqafa', price: 10 }],
  },
  {
    slug: 'cairo-luxor-aswan-5-day-package',
    title: '5-Day Egypt Grand Tour: Cairo, Luxor & Aswan',
    shortDescription: 'The ultimate Egypt tour covering Cairo, Luxor temples, Valley of the Kings, and Aswan.',
    description: 'See the best of Egypt in 5 days. Start in Cairo with the Pyramids and Museum. Fly to Luxor for Karnak, Valley of the Kings, and Hatshepsut Temple. Continue to Aswan for Philae Temple and a felucca sail. All flights, hotels, and meals included.',
    category: 'tours', duration: '5 days', priceFrom: 550,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: '5-day grand tour', price: 550 },
      { id: 'child', name: 'Child (6-12)', description: '5-day grand tour', price: 380 },
    ],
    highlights: ['Cairo, Luxor & Aswan in 5 days', 'Domestic flights included', 'Valley of the Kings', 'Philae Temple & Nile felucca', '4-star hotels throughout'],
    inclusions: ['All flights', 'Hotels (4 nights)', 'All meals', 'Entrance fees', 'Egyptologist guide'],
    exclusions: ['Gratuities', 'Personal expenses'],
    addons: [{ id: 'abu-simbel', name: 'Abu Simbel Day Trip', description: 'Add Abu Simbel temple visit from Aswan', price: 70 }],
  },
  {
    slug: 'cairo-museum-pyramids-sound-light',
    title: 'Cairo: Pyramids, Museum & Sound and Light Show',
    shortDescription: 'Full day at the Pyramids and Museum, plus the spectacular evening Sound and Light show.',
    description: 'A packed Cairo day that extends into the evening. Tour the Pyramids and Sphinx in the morning, visit the Egyptian Museum after lunch, then return to Giza for the famous Sound and Light show as the Pyramids are illuminated and the Sphinx narrates Egypt\'s history.',
    category: 'tours', duration: '16 hours', priceFrom: 85,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full day + show', price: 85 },
      { id: 'child', name: 'Child (6-12)', description: 'Full day + show', price: 55 },
    ],
    highlights: ['Pyramids & Sphinx', 'Egyptian Museum', 'Sound & Light Show at night', 'Full day experience', 'All fees included'],
    inclusions: ['Transport from Hurghada', 'Entrance fees', 'Lunch', 'Sound & Light Show ticket', 'Guide'],
    exclusions: ['Dinner', 'Gratuities'],
    addons: [{ id: 'quad', name: 'Quad Ride at Pyramids', description: '30 min ATV ride around the pyramids', price: 15 }],
  },
];

const LUXOR_TOURS: TourSeed[] = [
  {
    slug: 'luxor-day-trip-valley-kings',
    title: 'Luxor Day Trip: Valley of the Kings & Karnak',
    shortDescription: 'Visit the Valley of the Kings, Hatshepsut Temple, and the magnificent Karnak Temple complex.',
    description: 'Travel from Hurghada to Luxor to explore the ancient world\'s greatest open-air museum. Visit the Valley of the Kings where Tutankhamun was discovered, the mortuary temple of Queen Hatshepsut, the Colossi of Memnon, and the vast Karnak Temple complex.',
    category: 'day-trips', duration: '14 hours', priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full tour', price: 55 },
      { id: 'child', name: 'Child (6-12)', description: 'Full tour', price: 35 },
    ],
    highlights: ['Valley of the Kings (3 tombs)', 'Karnak Temple complex', 'Hatshepsut mortuary temple', 'Colossi of Memnon', 'Egyptologist guide'],
    inclusions: ['Private transport from Hurghada', 'All entrance fees', 'Lunch', 'Expert guide', 'Water'],
    exclusions: ['Gratuities', 'Tutankhamun tomb entry'],
    addons: [
      { id: 'tut-tomb', name: 'Tutankhamun Tomb Entry', description: 'Enter the tomb of Tutankhamun', price: 20 },
      { id: 'balloon', name: 'Hot Air Balloon at Sunrise', description: 'Early morning balloon ride over West Bank', price: 45 },
    ],
  },
  {
    slug: 'luxor-hot-air-balloon-temples',
    title: 'Luxor Hot Air Balloon & Temple Tour',
    shortDescription: 'Sunrise hot air balloon over the West Bank, then explore Luxor and Karnak temples.',
    description: 'Start with a magical sunrise hot air balloon flight over the Valley of the Kings, Hatshepsut Temple, and the green Nile valley. After landing, continue to Luxor Temple and the awe-inspiring Karnak Temple. A perfect combination of adventure and history.',
    category: 'adventure', duration: '15 hours', priceFrom: 95,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Balloon + temples', price: 95 },
      { id: 'child', name: 'Child (8-12)', description: 'Balloon + temples', price: 70 },
    ],
    highlights: ['Sunrise balloon over ancient Luxor', 'Aerial views of Valley of the Kings', 'Karnak & Luxor temples', 'Once-in-a-lifetime experience', 'Professional balloon operators'],
    inclusions: ['Transport', 'Balloon flight', 'Temple entrance fees', 'Lunch', 'Guide'],
    exclusions: ['Gratuities', 'Personal expenses'],
    addons: [{ id: 'west-bank', name: 'West Bank Tombs Visit', description: 'Add Valley of the Kings after balloon', price: 25 }],
  },
  {
    slug: 'luxor-private-full-day-east-west',
    title: 'Private Luxor Full Day: East & West Banks',
    shortDescription: 'Comprehensive private tour of both Luxor banks — temples, tombs, and the Nile.',
    description: 'The most thorough Luxor day trip available. West Bank: Valley of the Kings, Valley of the Queens, Hatshepsut Temple, Medinet Habu, and the Colossi of Memnon. East Bank: Karnak and Luxor temples. Private vehicle and personal Egyptologist.',
    category: 'day-trips', duration: '16 hours', priceFrom: 85,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full day both banks', price: 85 },
      { id: 'child', name: 'Child (6-12)', description: 'Full day both banks', price: 55 },
    ],
    highlights: ['Both East and West Banks', '7+ major sites', 'Valley of Kings AND Queens', 'Private vehicle & guide', 'The most comprehensive Luxor tour'],
    inclusions: ['Private AC vehicle', 'All entrance fees', 'Lunch', 'Personal Egyptologist', 'Water'],
    exclusions: ['Gratuities', 'Special tomb entries'],
    addons: [{ id: 'felucca', name: 'Nile Felucca Sunset', description: 'Sunset felucca sail before return', price: 15 }],
  },
  {
    slug: 'luxor-overnight-dendera-abydos',
    title: 'Luxor 2-Day: Temples, Tombs, Dendera & Abydos',
    shortDescription: 'Two-day Luxor trip adding the rarely visited Dendera zodiac temple and Abydos.',
    description: 'Go beyond the standard Luxor tour. Day one covers the classic sites. Day two takes you to Dendera — home of the famous zodiac ceiling — and Abydos, where the mysterious Osireion and King List are located. Far fewer tourists, incredibly preserved colors.',
    category: 'tours', duration: '2 days', priceFrom: 160,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: '2-day tour', price: 160 },
      { id: 'child', name: 'Child (6-12)', description: '2-day tour', price: 110 },
    ],
    highlights: ['Off-the-beaten-path temples', 'Dendera zodiac ceiling', 'Abydos King List', 'Standard Luxor sites + hidden gems', '4-star hotel overnight'],
    inclusions: ['All transport', 'Hotel', 'Meals', 'Entrance fees', 'Expert Egyptologist'],
    exclusions: ['Gratuities'],
    addons: [{ id: 'balloon', name: 'Hot Air Balloon (Day 1)', description: 'Sunrise balloon before sightseeing', price: 45 }],
  },
  {
    slug: 'luxor-express-karnak-valley-kings',
    title: 'Luxor Express: Karnak & Valley of the Kings',
    shortDescription: 'Budget-friendly Luxor tour focusing on the two must-see highlights.',
    description: 'Short on time or budget? This express Luxor tour covers the two absolute must-see sites: the Karnak Temple complex and the Valley of the Kings. Early departure, efficient scheduling, back in Hurghada by evening.',
    category: 'day-trips', duration: '12 hours', priceFrom: 45,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Express tour', price: 45 },
      { id: 'child', name: 'Child (6-12)', description: 'Express tour', price: 30 },
    ],
    highlights: ['Budget-friendly Luxor option', 'Karnak Temple', 'Valley of the Kings (3 tombs)', 'Early return to Hurghada', 'All essentials covered'],
    inclusions: ['Transport', 'Entrance fees', 'Lunch box', 'Guide', 'Water'],
    exclusions: ['Gratuities', 'Extra tomb entries'],
    addons: [{ id: 'hatshepsut', name: 'Add Hatshepsut Temple', description: 'Quick stop at the mortuary temple', price: 10 }],
  },
];

const PARASAILING_TOURS: TourSeed[] = [
  {
    slug: 'parasailing-hurghada-adventure',
    title: 'Parasailing Adventure in Hurghada',
    shortDescription: 'Soar 100 meters above the Red Sea with stunning views of Hurghada coastline.',
    description: 'Experience the thrill of parasailing over the crystal-clear Red Sea. Fly solo or tandem at heights up to 100 meters with panoramic views of the Hurghada coastline, coral reefs below, and the desert mountains in the distance. Safe, modern equipment and experienced operators.',
    category: 'adventure', duration: '1 hour', priceFrom: 35,
    pricingOptions: [
      { id: 'solo', name: 'Solo Flight', description: 'Fly alone', price: 35 },
      { id: 'tandem', name: 'Tandem (2 persons)', description: 'Fly together', price: 55 },
    ],
    highlights: ['Fly 100m above the Red Sea', 'Panoramic coastline views', 'Solo or tandem options', 'Modern safety equipment', 'Boat ride included'],
    inclusions: ['Parasailing flight', 'Safety equipment', 'Boat ride', 'Hotel transfers', 'Insurance'],
    exclusions: ['Gratuities', 'Photos'],
    addons: [{ id: 'photo', name: 'Photo & Video Package', description: 'GoPro footage of your flight', price: 15 }],
  },
  {
    slug: 'parasailing-jet-ski-combo-hurghada',
    title: 'Parasailing & Jet Ski Combo',
    shortDescription: 'Double the adrenaline — parasailing over the sea plus a high-speed jet ski session.',
    description: 'Get your adrenaline fix with this two-activity water sports combo. Start with a thrilling parasailing flight over the Red Sea, then hop on a powerful jet ski for 30 minutes of high-speed fun. Perfect for thrill-seekers.',
    category: 'adventure', duration: '2 hours', priceFrom: 60,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Parasail + Jet Ski', price: 60 },
    ],
    highlights: ['Two activities in one session', 'Parasailing + jet ski', 'Red Sea adrenaline rush', 'All equipment provided', 'No experience needed'],
    inclusions: ['Parasailing flight', 'Jet ski (30 min)', 'Safety gear', 'Instructor', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Extra jet ski time'],
    addons: [{ id: 'banana', name: 'Add Banana Boat', description: '15-minute banana boat ride', price: 10 }],
  },
  {
    slug: 'parasailing-snorkeling-hurghada-day',
    title: 'Parasailing & Snorkeling Full Day',
    shortDescription: 'Fly above the Red Sea by parasail, then dive in for world-class snorkeling at coral reefs.',
    description: 'A perfect combination of sky and sea. Morning starts with parasailing from a speedboat, followed by a boat trip to pristine coral reefs for snorkeling. See tropical fish, coral gardens, and maybe dolphins. Lunch on board.',
    category: 'adventure', duration: '6 hours', priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full day combo', price: 55 },
      { id: 'child', name: 'Child (8-12)', description: 'Snorkeling only', price: 30 },
    ],
    highlights: ['Parasailing + snorkeling in one day', 'Visit pristine coral reefs', 'Lunch on the boat', 'All equipment included', 'Professional crew'],
    inclusions: ['Parasailing', 'Snorkeling gear', 'Boat trip', 'Lunch & drinks', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Underwater camera'],
    addons: [{ id: 'camera', name: 'Underwater Camera Rental', description: 'Waterproof camera for snorkeling', price: 10 }],
  },
  {
    slug: 'parasailing-glass-boat-hurghada',
    title: 'Parasailing & Glass Bottom Boat',
    shortDescription: 'Parasail over the sea then see coral reefs through a glass bottom boat — no swimming needed.',
    description: 'Perfect for non-swimmers! After your parasailing adventure, board a glass bottom boat to see the coral reefs and fish below without getting wet. Great for families with young children or anyone who wants to see the underwater world from above.',
    category: 'adventure', duration: '2.5 hours', priceFrom: 40,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Parasail + glass boat', price: 40 },
      { id: 'child', name: 'Child (4-12)', description: 'Glass boat only', price: 20 },
    ],
    highlights: ['No swimming required', 'See coral reefs through glass', 'Family-friendly', 'Parasailing + boat combo', 'Great for non-swimmers'],
    inclusions: ['Parasailing flight', 'Glass bottom boat tour', 'Soft drinks', 'Hotel transfers'],
    exclusions: ['Gratuities'],
    addons: [{ id: 'fish-feeding', name: 'Fish Feeding', description: 'Feed tropical fish from the boat', price: 5 }],
  },
  {
    slug: 'water-sports-mega-combo-hurghada',
    title: 'Water Sports Mega Combo: 5 Activities',
    shortDescription: 'Parasailing, jet ski, banana boat, tube ride, and snorkeling — the ultimate water day.',
    description: 'The ultimate Red Sea water sports package. Five activities in one action-packed day: parasailing, jet ski, banana boat, tube ride (sofa), and snorkeling at a coral reef. Lunch included. Perfect for groups and adventure seekers.',
    category: 'adventure', duration: '5 hours', priceFrom: 85,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'All 5 activities', price: 85 },
      { id: 'child', name: 'Child (10-16)', description: 'All 5 activities', price: 65 },
    ],
    highlights: ['5 water sports in 1 day', 'Parasailing, jet ski, banana, tube, snorkeling', 'Lunch on the beach', 'All equipment included', 'Action-packed full day'],
    inclusions: ['All 5 activities', 'Safety equipment', 'Lunch & drinks', 'Hotel transfers', 'Instructor'],
    exclusions: ['Gratuities', 'Extra activity rounds'],
    addons: [{ id: 'flyboard', name: 'Add Flyboarding', description: '15 minutes of flyboarding', price: 30 }],
  },
];

const TENANT_TOURS: Record<string, { tenantSlug: string; destination: { city: string; country: string; coordinates: { lat: number; lng: number } }; tours: TourSeed[] }> = {
  '699895e47169d9820932b9b8': { // cairo-tour-from-hurghada
    tenantSlug: 'cairo-tour-from-hurghada',
    destination: { city: 'Cairo', country: 'Egypt', coordinates: { lat: 29.9792, lng: 31.1342 } },
    tours: CAIRO_FROM_HURGHADA_TOURS,
  },
  '699895e47169d9820932b9c4': { // cairo-tours-packages
    tenantSlug: 'cairo-tours-packages',
    destination: { city: 'Cairo', country: 'Egypt', coordinates: { lat: 29.9792, lng: 31.1342 } },
    tours: CAIRO_PACKAGES_TOURS,
  },
  '699895e47169d9820932b9bd': { // luxor-tour-from-hurghada
    tenantSlug: 'luxor-tour-from-hurghada',
    destination: { city: 'Luxor', country: 'Egypt', coordinates: { lat: 25.6872, lng: 32.6396 } },
    tours: LUXOR_TOURS,
  },
  '699895e47169d9820932b9c2': { // parasailing-hurghada
    tenantSlug: 'parasailing-hurghada',
    destination: { city: 'Hurghada', country: 'Egypt', coordinates: { lat: 27.2579, lng: 33.8116 } },
    tours: PARASAILING_TOURS,
  },
};

async function main(): Promise<void> {
  await connectDatabase();

  try {
    // ── Part 1: Remove irrelevant tour assignments ──
    console.log('=== PART 1: Removing irrelevant tour assignments ===\n');

    for (const [tenantId, attractionIds] of Object.entries(REMOVALS)) {
      const tenant = await Tenant.findById(tenantId).select('slug name');
      console.log(`${tenant?.name || tenantId}:`);

      for (const attractionId of attractionIds) {
        const result = await Attraction.updateOne(
          { _id: new Types.ObjectId(attractionId) },
          { $pull: { tenantIds: new Types.ObjectId(tenantId) } }
        );
        const attr = await Attraction.findById(attractionId).select('title');
        if (result.modifiedCount > 0) {
          console.log(`  REMOVED  ${attr?.title || attractionId}`);
        } else {
          console.log(`  SKIP     ${attr?.title || attractionId} (already removed)`);
        }
      }
      console.log('');
    }

    // ── Part 2: Seed tours for empty tenants ──
    console.log('=== PART 2: Seeding tours for empty tenants ===\n');

    for (const [tenantId, config] of Object.entries(TENANT_TOURS)) {
      const tenant = await Tenant.findById(tenantId).select('slug name');
      if (!tenant) {
        console.log(`Tenant ${tenantId} not found — skipping.`);
        continue;
      }
      console.log(`${tenant.name} (${tenant.slug}):`);

      let created = 0;
      let skipped = 0;

      for (const tour of config.tours) {
        const exists = await Attraction.findOne({ slug: tour.slug });
        if (exists) {
          console.log(`  SKIP  ${tour.slug}`);
          skipped++;
          continue;
        }

        await Attraction.create({
          slug: tour.slug,
          title: tour.title,
          shortDescription: tour.shortDescription,
          description: tour.description,
          images: ['https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/placeholder.jpg'],
          category: tour.category,
          destination: config.destination,
          duration: tour.duration,
          languages: ['English', 'Arabic', 'German'],
          rating: 4.4 + Math.round(Math.random() * 5) / 10,
          reviewCount: 8 + Math.floor(Math.random() * 50),
          priceFrom: tour.priceFrom,
          currency: 'USD',
          pricingOptions: tour.pricingOptions,
          addons: tour.addons,
          entryWindows: [
            { label: 'Morning', startTime: '07:00', endTime: '08:00' },
            { label: 'Afternoon', startTime: '13:00', endTime: '14:00' },
          ],
          itinerary: [],
          highlights: tour.highlights,
          inclusions: tour.inclusions,
          exclusions: tour.exclusions,
          meetingPoint: {
            address: `Hotel lobby pickup, ${config.destination.city}`,
            instructions: 'Our driver will meet you at your hotel lobby.',
            mapUrl: `https://maps.google.com/?q=${config.destination.coordinates.lat},${config.destination.coordinates.lng}`,
          },
          cancellationPolicy: 'Free cancellation up to 24 hours before',
          instantConfirmation: true,
          mobileTicket: true,
          badges: ['free-cancellation', 'instant-confirm'],
          availability: { type: 'time-slots', advanceBooking: 30 },
          tenantIds: [new Types.ObjectId(tenantId)],
          status: 'active',
          featured: false,
        });
        console.log(`  ADD   ${tour.title} ($${tour.priceFrom})`);
        created++;
      }

      console.log(`  → Created: ${created}, Skipped: ${skipped}\n`);
    }

    console.log('Done.');
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
