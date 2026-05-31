/**
 * Give the 6 remaining coming-soon tenants their own brand-correct tour
 * catalogs. Each currently sits on a generic shared "Hurghada" pool (snorkel/
 * city tours assigned to many tenants at once), which is wrong for a camel-trek
 * brand, a wild-dolphin brand, a 4x4 brand, a luxury-yacht brand, a bespoke
 * private-tours brand and a sunset-desert-safari brand.
 *
 * This script (mirrors the proven seed-fishing-submarine-tours.ts pattern):
 *   1. DETACHES each tenant from every shared tour it currently sits on
 *      (pulls the tenantId from those tours' tenantIds — NEVER deletes the
 *      shared docs, so the other tenants keep them).
 *   2. Seeds a real brand catalog owned by the tenant (idempotent on slug).
 *   3. Sets heroImages (6 URLs drawn from that tenant's own new tours) and
 *      designMode. status is left UNTOUCHED — these tenants stay `inactive`.
 *
 * IMAGES: reuses existing real Cloudinary photos already in this codebase. No
 * new image generation.
 *   camel / jeep / safari -> real desert/safari photography (Safari Sahara,
 *                            Quad Tour Safari, Makadi desert camel/quad galleries)
 *   dolphins / luxury     -> real Red Sea marine/boat/snorkel photography
 *                            (Royal SeaScope, Pirates, Nefertari, Classic Boat,
 *                            snorkel/orange-bay/giftun galleries)
 *   private-tours         -> a mix of marine + desert + heritage
 *
 * Idempotent: skips any tour whose slug already exists; re-running only
 * re-asserts heroImages/designMode. Never activates a tenant.
 * Run: npx ts-node src/scripts/seed-remaining-coming-soon-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const C = 'https://res.cloudinary.com/dm3sxllch/image/upload';

// ── Real desert / safari photography (Safari Sahara + Quad Tour + Makadi) ──
const DESERT = {
  sahara1: `${C}/v1778139640/attractions-network/attractions-network/tours/safari-sahara-hurghada/txyapftck8hvc3wgkmvj.jpg`,
  sahara2: `${C}/v1778139699/attractions-network/attractions-network/tours/safari-sahara-hurghada/dvaqjji90lpemybdhpwy.jpg`,
  sahara3: `${C}/v1778139931/attractions-network/attractions-network/tours/safari-sahara-hurghada/uafbwlvolmzeqm5tqdso.jpg`,
  sahara4: `${C}/v1778139983/attractions-network/attractions-network/tours/safari-sahara-hurghada/pwmpxoiqghpkxpgggmth.jpg`,
  sahara5: `${C}/v1778140040/attractions-network/attractions-network/tours/safari-sahara-hurghada/t1m0oqikz7qos3rmat2j.jpg`,
  sahara6: `${C}/v1778140179/attractions-network/attractions-network/tours/safari-sahara-hurghada/dzxs6yua6wqmyzdfh9i3.jpg`,
  sahara7: `${C}/v1778140238/attractions-network/attractions-network/tours/safari-sahara-hurghada/rv22fbuxxihnaeleum6i.jpg`,
  sahara8: `${C}/v1778140285/attractions-network/attractions-network/tours/safari-sahara-hurghada/yyluqpzuvsxdi7lsgduw.jpg`,
  quad1: `${C}/v1778160862/attractions-network/attractions-network/tours/quad-tour-safari/m04cr7msdwzuebtwhqla.jpg`,
  quad2: `${C}/v1778160934/attractions-network/attractions-network/tours/quad-tour-safari/mgafzr8zwdlaexbgkuiy.jpg`,
  quad3: `${C}/v1778160992/attractions-network/attractions-network/tours/quad-tour-safari/kk2swuygorskyaw77qjk.jpg`,
  quad4: `${C}/v1778161052/attractions-network/attractions-network/tours/quad-tour-safari/veotr7lfz3rgkskvtlbx.jpg`,
  quad5: `${C}/v1778161114/attractions-network/attractions-network/tours/quad-tour-safari/suiuos0amlo3mbusepof.jpg`,
  // Makadi desert galleries (camel / quad-buggy / dinner-show — real photos)
  camelSunset: `${C}/v1776010705/attractions-network/tours/makadi-oasis-sunset-camel-stargazing/rcc7cixkbhfzhn3l6dpj.jpg`,
  quadBuggyDinner: `${C}/v1776010732/attractions-network/tours/makadi-desert-safari-quad-buggy-dinner/qtedamgnm5fg5hojraxe.jpg`,
  quadBuggyCamel: `${C}/v1776010763/attractions-network/tours/makadi-desert-experience-quad-buggy-camel/u0o2ucomcjcau5m5mvew.jpg`,
  camelDinnerShow: `${C}/v1776010800/attractions-network/tours/makadi-desert-safari-camel-dinner-show/rxkmfnkdc3o2auhnyszm.jpg`,
  quadShow: `${C}/v1776010872/attractions-network/tours/makadi-quad-buggy-oriental-show/tjllm4wuctyhwuk0w0i0.jpg`,
  atvSand: `${C}/v1776010902/attractions-network/tours/makadi-atv-safari-sand-mountain/czdk8hr8wr9lmwecpedr.jpg`,
  quadStargazing: `${C}/v1776011050/attractions-network/tours/makadi-desert-quad-safari-dinner-stargazing/toqzimq0ypql3scrw0oo.jpg`,
  cairoQuad: `${C}/v1776002250/attractions-network/tours/cairo-quad-bike-pyramids/zjrsutlwuoayaomskpmk.jpg`,
};

// ── Real Red Sea marine / boat / snorkel photography ──
const MARINE = {
  // Royal SeaScope (real underwater / vessel photos)
  sea1: `${C}/v1779648880/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-01.jpg`,
  sea2: `${C}/v1779648881/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-02.jpg`,
  sea3: `${C}/v1779648882/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-03.jpg`,
  sea4: `${C}/v1779648884/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-04.jpg`,
  sea5: `${C}/v1779648886/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-05.jpg`,
  sea6: `${C}/v1779648887/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-06.jpg`,
  // Pirates Premier Sailing (real boat / open-water photos)
  pirate1: `${C}/v1779648889/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-01.jpg`,
  pirate2: `${C}/v1779648890/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-02.jpg`,
  pirate3: `${C}/v1779648892/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-03.jpg`,
  pirate4: `${C}/v1779648893/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-04.jpg`,
  // Nefertari Cruise (real cruise / deck photos)
  nef1: `${C}/v1779648897/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-01.jpg`,
  nef2: `${C}/v1779648898/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-02.jpg`,
  nef3: `${C}/v1779648899/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-03.jpg`,
  nef4: `${C}/v1779648900/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-04.jpg`,
  nef5: `${C}/v1779648902/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-05.jpg`,
  nef6: `${C}/v1779648903/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-06.jpg`,
  // Classic Boat (real Red Sea deck photos)
  boat1: `${C}/v1779648917/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-01.jpg`,
  boat2: `${C}/v1779648919/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-02.jpg`,
  boat3: `${C}/v1779648920/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-03.jpg`,
  // Snorkel / island day-trip galleries
  snorkel: `${C}/v1776001511/attractions-network/tours/hurghada-snorkeling/em754jzdawhzqpz1knpi.jpg`,
  makadiSnorkel: `${C}/v1776001740/attractions-network/tours/makadi-bay-snorkeling/dqgky1xrtcddcepr82g4.jpg`,
  orangeBay: `${C}/v1776001800/attractions-network/tours/orange-bay-tours/ql8gdkgqaymrp7k8x9x1.jpg`,
  giftun: `${C}/v1776001284/attractions-network/tours/giftun-island-hurghada/gzgrjpjgullgu4aiatfp.jpg`,
};

interface Seed {
  slug: string; title: string; shortDescription: string; description: string;
  duration: string; priceFrom: number; images: string[];
  pricing: Array<[string, string, string, number]>;
  addons: Array<[string, string, string, number]>;
  highlights: string[]; inclusions: string[]; exclusions: string[];
  windows: Array<[string, string, string]>;
}

const CITY = 'Hurghada';

// ───────────────────────────── camel-riding-hurghada ─────────────────────────────
const CAMEL: Seed[] = [
  {
    slug: 'hurghada-sunrise-beach-camel-ride',
    title: 'Hurghada · Sunrise Beach Camel Ride',
    shortDescription: 'Ride a calm Bedouin camel along the Red Sea shoreline at first light, with sweet Bedouin tea and unforgettable sunrise photos.',
    description: 'Beat the heat and the crowds. A Bedouin guide leads your camel along the quiet shoreline just as the sun lifts over the Red Sea, turning the water and the mountains behind you a soft gold. The pace is gentle and the camels are well-handled, so it suits complete beginners and nervous first-timers alike. We pause for sweet Bedouin tea and the kind of sunrise photos you only get this early — calm sea, empty beach and long warm light.',
    duration: '~2 h · sunrise · hotel pickup',
    priceFrom: 22,
    images: [DESERT.camelSunset, DESERT.sahara3, DESERT.sahara6, DESERT.camelDinnerShow],
    pricing: [['adult', 'Adult', 'Own camel + guide + tea', 22], ['child', 'Child (4-11)', 'Shared camel with an adult', 13], ['private', 'Private pair', 'Two camels, private guide', 58]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer from your Hurghada hotel', 8], ['photos', 'Sunrise photo set', 'Guide captures your ride on the beach', 10], ['breakfast', 'Bedouin breakfast', 'Bread, cheese, honey & tea after the ride', 9]],
    highlights: ['Camel ride along the Red Sea at sunrise', 'Calm, well-handled Bedouin camels', 'Sweet Bedouin tea stop', 'Empty beach, golden-hour photos', 'Beginner-friendly, gentle pace'],
    inclusions: ['2-hour guided beach camel ride', 'Bedouin guide', 'Bedouin tea', 'Bottled water'],
    exclusions: ['Hotel pickup (add-on)', 'Photos (add-on)', 'Breakfast (add-on)', 'Tips'],
    windows: [['Sunrise', '05:30', '07:30']],
  },
  {
    slug: 'hurghada-desert-caravan-camel-trek',
    title: 'Hurghada · Desert Caravan Trek',
    shortDescription: 'A proper camel caravan deep into the Eastern Desert — ride dune trails the old Bedouin way and stop at a working Bedouin camp.',
    description: 'Trade the beach for the open desert. Strung together as a traditional caravan, your camels carry you along ancient dune trails into the Eastern Desert, the way the Bedouin have crossed this land for centuries. Your guide reads the landscape — telling plants, animal tracks and the wells that made desert life possible — and the trek pauses at a working Bedouin camp for tea baked over the fire. A slow, authentic half-day far from the resort strip.',
    duration: '~3.5 h · half-day caravan',
    priceFrom: 35,
    images: [DESERT.sahara1, DESERT.sahara4, DESERT.camelSunset, DESERT.sahara7],
    pricing: [['adult', 'Adult', 'Caravan ride + camp + tea', 35], ['child', 'Child (6-11)', 'Junior caravan rider', 21], ['family', 'Family (2A + 2C)', 'Family caravan rate', 96]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 9], ['lunch', 'Bedouin camp lunch', 'Grilled lunch at the desert camp', 12], ['headscarf', 'Bedouin headscarf', 'Keep your shemagh as a souvenir', 6]],
    highlights: ['Traditional camel caravan trek', 'Ancient Eastern Desert dune trails', 'Stop at a working Bedouin camp', 'Guide shares desert survival lore', 'Authentic, unhurried half-day'],
    inclusions: ['3.5-hour caravan camel trek', 'Bedouin guide', 'Desert camp tea stop', 'Bottled water'],
    exclusions: ['Hotel pickup (add-on)', 'Camp lunch (add-on)', 'Tips'],
    windows: [['Morning', '08:00', '11:30'], ['Afternoon', '14:30', '18:00']],
  },
  {
    slug: 'hurghada-private-camel-bedouin-tea',
    title: 'Hurghada · Private Camel & Bedouin Tea',
    shortDescription: 'A private, unhurried camel ride for your group with a dedicated Bedouin host, fireside tea and time to learn how desert tribes really live.',
    description: 'Just your group, your guide and the desert. This private experience pairs a relaxed camel ride with real time at a Bedouin host\'s tent — no rushing, no shared crowd. Learn how tea and bread are made over an open fire, hear stories of tribal life, try your hand at grinding coffee, and let the kids meet the camels up close. Ideal for families and couples who want the desert quiet and a genuine cultural welcome rather than a conveyor-belt tour.',
    duration: '~3 h private · flexible start',
    priceFrom: 75,
    images: [DESERT.camelDinnerShow, DESERT.sahara2, DESERT.camelSunset, DESERT.sahara8],
    pricing: [['couple', 'Private (up to 2)', 'Two camels, private host', 75], ['family', 'Private family (up to 5)', 'Family group, private host', 140], ['group', 'Private group (up to 10)', 'Larger private group', 240]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 9], ['meal', 'Bedouin dinner', 'Cooked dinner at the tent', 14], ['henna', 'Henna & dress-up', 'Traditional henna and Bedouin dress for photos', 8]],
    highlights: ['Fully private camel ride & host', 'Real fireside Bedouin tea & bread', 'Stories of desert tribal life', 'Relaxed, no shared crowd', 'Great for families & couples'],
    inclusions: ['3-hour private camel experience', 'Dedicated Bedouin host', 'Fireside tea & bread', 'Bottled water'],
    exclusions: ['Hotel pickup (add-on)', 'Bedouin dinner (add-on)', 'Tips'],
    windows: [['Flexible', '08:00', '18:00']],
  },
  {
    slug: 'hurghada-sunset-camel-ride-bbq-dinner',
    title: 'Hurghada · Sunset Camel Ride + BBQ Dinner',
    shortDescription: 'Ride into the desert as the sun sets, then settle at a Bedouin camp for a grilled BBQ dinner, live music and a sky full of stars.',
    description: 'The desert\'s best hours, end to end. Set out by camel in the late afternoon and ride the dunes as the sun drops and the sand glows pink and orange. As darkness falls you arrive at a Bedouin camp where a charcoal BBQ is already smoking — grilled meats, fresh bread and salads served under the open sky, with tabla drums, a campfire and tea. Once the music settles, the guide points out the constellations in some of the clearest skies near Hurghada.',
    duration: '~4.5 h · sunset + dinner',
    priceFrom: 39,
    images: [DESERT.camelSunset, DESERT.camelDinnerShow, DESERT.sahara5, DESERT.quadStargazing],
    pricing: [['adult', 'Adult', 'Sunset ride + BBQ + show', 39], ['child', 'Child (4-11)', 'Junior rider + dinner', 23], ['family', 'Family (2A + 2C)', 'Family group rate', 108]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 9], ['drinks', 'Soft-drink package', 'Unlimited soft drinks at the camp', 7], ['vip', 'VIP cushioned seating', 'Private low table & cushions at the camp', 12]],
    highlights: ['Camel ride at golden hour', 'Charcoal BBQ dinner at a Bedouin camp', 'Live tabla drums & campfire', 'Stargazing under clear desert skies', 'Full evening, sunset to stars'],
    inclusions: ['Sunset camel ride', 'BBQ dinner at the Bedouin camp', 'Bedouin show & campfire', 'Tea & water', 'Stargazing'],
    exclusions: ['Hotel pickup (add-on)', 'Extra drinks (add-on)', 'Tips'],
    windows: [['Sunset', '16:00', '20:30']],
  },
];

// ───────────────────────────── hurghada-dolphins ─────────────────────────────
const DOLPHINS: Seed[] = [
  {
    slug: 'hurghada-dolphin-house-shaab-el-erg-snorkel',
    title: "Hurghada · Dolphin House (Sha'ab El Erg) Snorkel & Swim",
    shortDescription: "A full-day boat trip to Sha'ab El Erg reef, home to a resident pod of wild spinner dolphins — snorkel the reef and swim alongside them in the open sea.",
    description: "Sha'ab El Erg, known to everyone as Dolphin House, is a horseshoe reef north of Hurghada where a pod of wild spinner dolphins lives year-round. Cruise out in the morning, anchor at the reef and slip into warm, clear water to snorkel over coral while the crew watches for the pod. When the dolphins come through you swim quietly alongside them in their own home — never fed, never chased. Two reef stops, lunch onboard and a guide who knows exactly where the dolphins like to play.",
    duration: '~8 h · full day · pickup included',
    priceFrom: 38,
    images: [MARINE.sea4, MARINE.snorkel, MARINE.pirate1, MARINE.sea2],
    pricing: [['adult', 'Adult', 'Boat + 2 reef stops + gear + lunch', 38], ['child', 'Child (4-11)', 'Kids gear + supervision', 22], ['family', 'Family (2A + 2C)', 'Family group rate', 104]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 9], ['photos', 'Underwater photo & video set', 'Guide films your dolphin swim', 18], ['vip', 'VIP shaded deck seating', 'Reserved shaded loungers', 10]],
    highlights: ['Resident wild spinner-dolphin pod', "Snorkel & swim at Sha'ab El Erg reef", 'Two reef stops in one day', 'Ethical — never fed or chased', 'Lunch & gear included'],
    inclusions: ['Full-day boat trip', 'Two snorkel/reef stops', 'Snorkel gear & vest', 'Onboard lunch', 'Soft drinks & water', 'Guide & crew'],
    exclusions: ['Hotel pickup (add-on)', 'Photos (add-on)', 'Marine-park fee (paid locally)', 'Tips'],
    windows: [['Full day', '07:30', '15:30']],
  },
  {
    slug: 'hurghada-dolphin-watch-sunset-cruise',
    title: 'Hurghada · Dolphin Watch Sunset Cruise',
    shortDescription: 'An easy evening cruise to watch wild dolphins play in the bow wave as the Red Sea turns gold — no swimming needed, just deck, drinks and sunset.',
    description: 'Some of the best dolphin moments happen from the deck. This relaxed late-afternoon cruise runs the dolphins\' favourite stretch of coast just as they come out to feed and play, often riding the bow wave right beneath you. There is no swimming and no pressure — settle on the deck with a drink, camera ready, while the crew tracks the pods and the sun sinks behind the mountains. A calm, family-friendly and grandparent-friendly way to see wild dolphins.',
    duration: '~3 h · sunset cruise',
    priceFrom: 30,
    images: [MARINE.pirate2, MARINE.nef3, MARINE.sea5, MARINE.pirate4],
    pricing: [['adult', 'Adult', 'Sunset deck cruise + drinks', 30], ['child', 'Child (4-11)', 'Kids rate', 18], ['private', 'Private (up to 12)', 'Whole boat, your schedule', 320]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 8], ['canapes', 'Canapé & fruit platter', 'Light bites served on deck', 11], ['photos', 'Sunset photo set', 'Guide captures the cruise', 10]],
    highlights: ['Watch wild dolphins ride the bow wave', 'Golden-hour Red Sea sunset', 'No swimming — easy for everyone', 'Soft drinks & tea on deck', 'Calm, family-friendly evening'],
    inclusions: ['3-hour sunset cruise', 'Dolphin-watching with crew', 'Soft drinks & tea', 'Life jackets onboard'],
    exclusions: ['Hotel pickup (add-on)', 'Canapés (add-on)', 'Tips'],
    windows: [['Sunset', '16:00', '19:00']],
  },
  {
    slug: 'hurghada-private-dolphin-encounter-boat',
    title: 'Hurghada · Private Dolphin Encounter Boat',
    shortDescription: 'Charter your own fast boat to find the wild pods early — beat the crowds, set your own pace and get unhurried time in the water with the dolphins.',
    description: 'The earlier and smaller the boat, the better the dolphin encounter. Charter a private speedboat with its own skipper and guide, leave ahead of the big day-trip fleet, and run straight to where the pods gather at first light. With only your group onboard you can linger when the dolphins are playful, move on when they are not, and snorkel quiet reefs in between. Tailored to families, couples and photographers who want space, flexibility and the dolphins largely to themselves.',
    duration: '~5 h private · early start',
    priceFrom: 290,
    images: [MARINE.pirate3, MARINE.sea1, MARINE.nef1, MARINE.sea4],
    pricing: [['boat8', 'Private boat (up to 8)', 'Whole speedboat, skipper & guide', 290], ['boat12', 'Private boat (up to 12)', 'Larger private group', 380], ['boat4', 'Private (up to 4)', 'Small-group intimate charter', 220]],
    addons: [['pickup', 'Group hotel pickup', 'Air-conditioned transfer', 16], ['lunch', 'Onboard lunch for group', 'Cooked lunch at sea', 40], ['photos', 'Underwater photo & video set', 'Guide films your encounter', 20]],
    highlights: ['Private fast boat to beat the crowds', 'Early start to the morning pods', 'Unhurried time in the water', 'Quiet reef snorkel stops', 'Flexible, your schedule'],
    inclusions: ['Private speedboat charter', 'Skipper & dolphin guide', 'Snorkel gear & vests', 'Soft drinks & water', 'Flexible routing'],
    exclusions: ['Hotel pickup (add-on)', 'Lunch (add-on)', 'Marine-park fee (paid locally)', 'Tips'],
    windows: [['Flexible', '06:30', '15:00']],
  },
  {
    slug: 'hurghada-dolphin-reef-combo-day',
    title: 'Hurghada · Dolphin & Reef Combo Day',
    shortDescription: 'Wild dolphins plus the best house reefs in one full day — three snorkel stops, a sandy lagoon swim, lunch onboard and gear for everyone.',
    description: 'Make the most of a day on the water. This combo pairs a run to the wild dolphin grounds with snorkelling over two of Hurghada\'s healthiest house reefs and a stop at a shallow turquoise lagoon for an easy swim. The dolphins come on their own terms in the open sea, while the reefs deliver turtles, rays and clouds of fish. Three stops, a hot lunch onboard, all the gear and a guide in the water with you — a brilliant first taste of the Red Sea for families.',
    duration: '~8 h · full day · 3 stops',
    priceFrom: 44,
    images: [MARINE.sea2, MARINE.orangeBay, MARINE.makadiSnorkel, MARINE.giftun],
    pricing: [['adult', 'Adult', '3 stops + dolphins + gear + lunch', 44], ['child', 'Child (4-11)', 'Kids gear + supervision', 26], ['nonswim', 'Non-swimmer', 'Boat + deck + lunch', 30]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 9], ['photos', 'Photo & video set', 'Guide captures the day', 16], ['privatelounger', 'Private shaded lounger', 'Reserved shaded deck seating', 10]],
    highlights: ['Wild dolphins + two house reefs', 'Shallow turquoise lagoon swim', 'Three stops in one day', 'Turtles, rays & reef fish', 'Hot lunch & gear included'],
    inclusions: ['Full-day combo boat trip', 'Three snorkel/swim stops', 'Snorkel gear & vest', 'Onboard hot lunch', 'Soft drinks & water', 'Guide & crew'],
    exclusions: ['Hotel pickup (add-on)', 'Photos (add-on)', 'Marine-park fee (paid locally)', 'Tips'],
    windows: [['Full day', '07:30', '15:30']],
  },
];

// ───────────────────────────── hurghada-jeep-safari ─────────────────────────────
const JEEP: Seed[] = [
  {
    slug: 'hurghada-sunset-4x4-desert-safari-bbq',
    title: 'Hurghada · Sunset 4x4 Desert Safari + BBQ',
    shortDescription: 'Blast into the Eastern Desert by 4x4 for a golden-hour dune run, then a Bedouin-camp BBQ dinner with live music and stargazing.',
    description: 'Climb into a rugged 4x4 and head off-road into the Eastern Desert, kicking up dust over rolling dunes as the afternoon light turns gold. Your driver knows the best ridgelines for photos and the smoothest lines through the sand. As the sun sets you pull into a Bedouin camp for a charcoal BBQ — grilled meats, fresh bread and salads under the open sky — with tabla drums, a campfire, sweet tea and a guided look at the constellations once it\'s dark. The classic Hurghada desert evening, done by jeep.',
    duration: '~5 h · sunset + BBQ',
    priceFrom: 32,
    images: [DESERT.sahara2, DESERT.sahara5, DESERT.quadStargazing, DESERT.camelDinnerShow],
    pricing: [['adult', 'Adult', '4x4 safari + BBQ + show', 32], ['child', 'Child (4-11)', 'Junior seat + dinner', 19], ['family', 'Family (2A + 2C)', 'Family group rate', 88]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 8], ['camel', 'Add a short camel ride', '15-minute camel ride at the camp', 9], ['vip', 'VIP cushioned seating', 'Private low table & cushions', 12]],
    highlights: ['Off-road 4x4 dune run at golden hour', 'Bedouin-camp BBQ dinner', 'Live tabla drums & campfire', 'Guided stargazing', 'Sunset photo stops'],
    inclusions: ['Sunset 4x4 desert safari', 'BBQ dinner at the Bedouin camp', 'Bedouin show & campfire', 'Tea & water', 'Stargazing'],
    exclusions: ['Hotel pickup (add-on)', 'Camel ride (add-on)', 'Tips'],
    windows: [['Sunset', '15:30', '20:30']],
  },
  {
    slug: 'hurghada-super-jeep-full-day-expedition',
    title: 'Hurghada · Super-Jeep Full-Day Expedition',
    shortDescription: 'A full-day deep-desert expedition by super-jeep — remote canyons, a mountain spring, a Roman well and a Bedouin lunch far off the tourist trail.',
    description: 'For travellers who want the real Eastern Desert, not the resort fringe. A high-clearance super-jeep carries you deep inland to places day-trippers never reach: wind-carved canyons, a hidden mountain spring, an ancient Roman well and sweeping desert panoramas. Your guide stops to read the geology, the old caravan routes and the Bedouin way of life, and you break for a cooked lunch in the shade of the rocks. A big, adventurous, dust-on-your-boots day out.',
    duration: '~8 h · full-day expedition',
    priceFrom: 68,
    images: [DESERT.sahara1, DESERT.sahara4, DESERT.sahara7, DESERT.atvSand],
    pricing: [['adult', 'Adult', 'Full-day super-jeep + lunch', 68], ['child', 'Child (6-11)', 'Junior expedition rate', 40], ['private', 'Private jeep (up to 6)', 'Your own jeep & guide', 380]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 10], ['photos', 'Expedition photo set', 'Guide captures the day', 12], ['picnic', 'Premium picnic upgrade', 'Upgraded lunch spread in the canyon', 14]],
    highlights: ['Deep-desert super-jeep expedition', 'Hidden canyons & a mountain spring', 'Ancient Roman well', 'Cooked Bedouin lunch in the shade', 'Far off the tourist trail'],
    inclusions: ['Full-day super-jeep expedition', 'Expert desert guide', 'Cooked lunch', 'Tea, soft drinks & water', 'All park access'],
    exclusions: ['Hotel pickup (add-on)', 'Premium picnic (add-on)', 'Tips'],
    windows: [['Full day', '08:00', '16:00']],
  },
  {
    slug: 'hurghada-bedouin-village-4x4-camel-combo',
    title: 'Hurghada · Bedouin Village + 4x4 + Camel',
    shortDescription: 'A 5-in-1 afternoon — 4x4 dune drive, a real Bedouin village visit, a camel ride, a tabla show and a BBQ dinner under the stars.',
    description: 'The full desert sampler in one easy afternoon. A 4x4 whisks you over the dunes to a living Bedouin village, where you see how desert families really live — bread baked on the fire, goats, traditional tents and sweet herbal tea. From there it\'s a camel ride across the sand, then back to camp for a charcoal BBQ dinner, a tabla-and-fire show and stargazing. A lot packed into one ticket, and a favourite for families who want a bit of everything.',
    duration: '~5.5 h · 5-in-1 combo',
    priceFrom: 36,
    images: [DESERT.sahara3, DESERT.camelSunset, DESERT.quadShow, DESERT.sahara8],
    pricing: [['adult', 'Adult', '4x4 + village + camel + show + BBQ', 36], ['child', 'Child (4-11)', 'Junior combo rate', 22], ['family', 'Family (2A + 2C)', 'Family group rate', 100]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 8], ['quad', 'Add a 20-min quad blast', 'Short quad-bike ride at the camp', 14], ['drinks', 'Soft-drink package', 'Unlimited soft drinks at the camp', 7]],
    highlights: ['4x4 dune drive to a Bedouin village', 'See real desert village life', 'Camel ride across the sand', 'Tabla show & campfire', 'BBQ dinner & stargazing'],
    inclusions: ['4x4 desert drive', 'Bedouin village visit', 'Camel ride', 'BBQ dinner & show', 'Tea & water', 'Stargazing'],
    exclusions: ['Hotel pickup (add-on)', 'Quad ride (add-on)', 'Tips'],
    windows: [['Afternoon', '15:00', '20:30']],
  },
  {
    slug: 'hurghada-stargazing-night-4x4',
    title: 'Hurghada · Stargazing Night 4x4',
    shortDescription: 'Drive out after dark to one of the darkest skies near Hurghada — telescope-guided stargazing, a quiet desert dinner and total silence.',
    description: 'A trip built for the night sky. Once the resort lights are far behind, a 4x4 takes you to a remote, light-free patch of the Eastern Desert where the Milky Way arcs overhead. An astronomy guide sets up a telescope and walks you through planets, star clusters and the constellations, with plenty of time to simply lie back on a rug and watch for shooting stars. A calm desert dinner and herbal tea round out one of the most peaceful evenings you can have near Hurghada.',
    duration: '~4 h · night · stargazing',
    priceFrom: 42,
    images: [DESERT.quadStargazing, DESERT.sahara6, DESERT.camelDinnerShow, DESERT.sahara5],
    pricing: [['adult', 'Adult', '4x4 + telescope session + dinner', 42], ['child', 'Child (6-11)', 'Junior stargazer rate', 25], ['private', 'Private group (up to 6)', 'Your own jeep & astronomy guide', 290]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 9], ['photos', 'Astro photo of you', 'Night-sky portrait with the stars', 12], ['blankets', 'Premium rug & blanket set', 'Extra-comfy desert-floor seating', 6]],
    highlights: ['One of the darkest skies near Hurghada', 'Telescope-guided astronomy', 'See the Milky Way, planets & clusters', 'Quiet desert dinner', 'Deep silence away from the lights'],
    inclusions: ['Night 4x4 to a dark-sky site', 'Astronomy guide & telescope', 'Desert dinner', 'Herbal tea & water', 'Rugs & seating'],
    exclusions: ['Hotel pickup (add-on)', 'Astro photo (add-on)', 'Tips'],
    windows: [['Night', '19:30', '23:30']],
  },
];

// ───────────────────────────── hurghada-luxury-cruise ─────────────────────────────
const LUXURY: Seed[] = [
  {
    slug: 'hurghada-private-luxury-yacht-day-charter',
    title: 'Hurghada · Private Luxury Yacht Day Charter',
    shortDescription: 'Charter a private luxury yacht for the day — sundecks, a crew, two snorkel reefs and a sandy island, with a chef-prepared lunch served onboard.',
    description: 'Your own yacht, your own day on the Red Sea. Step aboard a private luxury vessel with spacious sundecks, shaded saloon and a dedicated crew who handle everything while you relax. Cruise to two of the best nearby reefs for snorkelling, anchor off a powder-sand island for a swim, and enjoy a chef-prepared lunch served onboard with chilled drinks. Tailored to families, couples and small groups who want privacy, comfort and the freedom to set their own pace.',
    duration: '~7 h · private · full day',
    priceFrom: 690,
    images: [MARINE.nef1, MARINE.nef4, MARINE.sea1, MARINE.giftun],
    pricing: [['yacht8', 'Private yacht (up to 8)', 'Whole yacht, crew, chef lunch', 690], ['yacht12', 'Private yacht (up to 12)', 'Larger group charter', 920], ['yacht20', 'Private yacht (up to 20)', 'Event-size charter', 1450]],
    addons: [['pickup', 'Group hotel pickup', 'Private air-conditioned transfer', 18], ['drinks', 'Premium drinks package', 'Wine, beer & soft drinks all day', 60], ['watersports', 'Water-toys package', 'Paddleboards, snorkels & sea floats', 45]],
    highlights: ['Entire luxury yacht to your group', 'Two snorkel reefs + sandy island', 'Chef-prepared lunch onboard', 'Spacious sundecks & shaded saloon', 'Dedicated crew, your schedule'],
    inclusions: ['Private full-day yacht charter', 'Captain & crew', 'Onboard chef lunch', 'Snorkel gear', 'Soft drinks & water', 'Towels'],
    exclusions: ['Hotel pickup (add-on)', 'Premium drinks (add-on)', 'Marine-park fee (paid locally)', 'Tips'],
    windows: [['Full day', '09:00', '16:00']],
  },
  {
    slug: 'hurghada-sunset-champagne-cruise',
    title: 'Hurghada · Sunset Champagne Cruise',
    shortDescription: 'An elegant adults-style evening cruise — chilled champagne, canapés and lounge music on deck as the Red Sea sun sinks behind the mountains.',
    description: 'Slow down and toast the day. This refined sunset cruise glides out along the coast as the light softens, with chilled champagne and a tray of canapés served on a beautifully set deck and easy lounge music in the background. Watch the sun melt into the mountains, the sky run through pink and amber, and the first stars appear over calm water. Perfect for couples, honeymoons, anniversaries and anyone who wants the grown-up, romantic side of the Red Sea.',
    duration: '~2.5 h · sunset · champagne',
    priceFrom: 58,
    images: [MARINE.nef3, MARINE.nef5, MARINE.pirate2, MARINE.sea5],
    pricing: [['adult', 'Per person', 'Champagne, canapés & sunset deck', 58], ['couple', 'Romantic pair', 'Reserved couples table + extras', 138], ['private', 'Private (up to 12)', 'Whole boat, your evening', 690]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 9], ['flowers', 'Roses & cake setup', 'Romantic table decoration & cake', 35], ['photos', 'Sunset photo session', 'Photographer captures the cruise', 20]],
    highlights: ['Chilled champagne on deck', 'Canapés & lounge music', 'Red Sea sunset over the mountains', 'Elegant, romantic atmosphere', 'Ideal for couples & celebrations'],
    inclusions: ['2.5-hour sunset cruise', 'Glass of champagne', 'Canapé selection', 'Soft drinks & water', 'Onboard host'],
    exclusions: ['Hotel pickup (add-on)', 'Roses & cake (add-on)', 'Tips'],
    windows: [['Sunset', '16:30', '19:00']],
  },
  {
    slug: 'hurghada-vip-island-snorkel-cruise',
    title: 'Hurghada · VIP Island & Snorkel Cruise',
    shortDescription: 'A premium shared cruise with VIP perks — reserved shaded loungers, two top reefs, an Orange Bay-style sandbank and a quality buffet lunch.',
    description: 'All the polish of a private trip at a shared-cruise price. This VIP cruise caps numbers for space and comfort, gives you reserved shaded loungers and runs to two of Hurghada\'s standout reefs plus a dazzling white sandbank for swimming and photos. A quality buffet lunch with fresh fruit is served onboard, the crew sets you up with good snorkel gear, and a guide gets in the water to show you the best of the coral, turtles and fish. Comfort, good reefs and easy luxury.',
    duration: '~7 h · VIP · full day',
    priceFrom: 52,
    images: [MARINE.orangeBay, MARINE.giftun, MARINE.sea4, MARINE.makadiSnorkel],
    pricing: [['adult', 'Adult', 'VIP cruise + 2 reefs + buffet', 52], ['child', 'Child (4-11)', 'Kids VIP rate', 31], ['family', 'Family (2A + 2C)', 'Family VIP rate', 150]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 10], ['drinks', 'Premium drinks package', 'Beer, wine & soft drinks', 30], ['cabana', 'Private deck cabana', 'Reserved shaded cabana for your group', 25]],
    highlights: ['VIP reserved shaded loungers', 'Two standout Red Sea reefs', 'White sandbank swim stop', 'Quality buffet lunch onboard', 'Capped numbers for comfort'],
    inclusions: ['Full-day VIP cruise', 'Two snorkel reef stops', 'Sandbank swim stop', 'Buffet lunch', 'Snorkel gear & guide', 'Soft drinks & water'],
    exclusions: ['Hotel pickup (add-on)', 'Premium drinks (add-on)', 'Marine-park fee (paid locally)', 'Tips'],
    windows: [['Full day', '08:30', '15:30']],
  },
  {
    slug: 'hurghada-full-day-premium-cruise-with-chef',
    title: 'Hurghada · Full-Day Premium Cruise with Chef',
    shortDescription: 'A full-day premium cruise with an onboard chef cooking a fresh seafood lunch, three swim stops, and unhurried time on the water.',
    description: 'A day where the food matches the view. This premium full-day cruise carries its own chef, who prepares a fresh lunch onboard — grilled seafood, mezze and salads — served at your leisure between swims. The route takes in three stops: two living reefs for snorkelling and a calm turquoise lagoon for an easy dip, with plenty of deck time in between. Comfortable, well-crewed and generously paced, it\'s the relaxed, indulgent way to spend a day on the Red Sea.',
    duration: '~7.5 h · premium · full day',
    priceFrom: 64,
    images: [MARINE.nef2, MARINE.nef6, MARINE.sea2, MARINE.orangeBay],
    pricing: [['adult', 'Adult', 'Premium cruise + chef lunch + 3 stops', 64], ['child', 'Child (4-11)', 'Kids premium rate', 38], ['private', 'Private (up to 16)', 'Whole boat with chef', 980]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 10], ['drinks', 'Premium drinks package', 'Wine, beer & soft drinks all day', 40], ['photos', 'Photo & video set', 'Crew captures the whole day', 18]],
    highlights: ['Onboard chef & fresh seafood lunch', 'Three swim & snorkel stops', 'Two reefs + a turquoise lagoon', 'Generous, unhurried pace', 'Comfortable, well-crewed deck'],
    inclusions: ['Full-day premium cruise', 'Onboard chef lunch', 'Three swim/snorkel stops', 'Snorkel gear & guide', 'Soft drinks & water', 'Towels'],
    exclusions: ['Hotel pickup (add-on)', 'Premium drinks (add-on)', 'Marine-park fee (paid locally)', 'Tips'],
    windows: [['Full day', '08:30', '16:00']],
  },
];

// ───────────────────────────── hurghada-private-tours ─────────────────────────────
const PRIVATE: Seed[] = [
  {
    slug: 'hurghada-private-cairo-pyramids-day-by-car',
    title: 'Hurghada · Private Cairo & Pyramids Day by Car',
    shortDescription: 'A private door-to-door day to the Pyramids of Giza, the Sphinx and the Egyptian Museum — your own car, driver and Egyptologist guide from Hurghada.',
    description: 'See the Pyramids without the group-bus compromise. A private air-conditioned car collects you from your Hurghada hotel and your own Egyptologist guide leads the day at the Giza plateau — the Great Pyramid, the Sphinx and a camel photo stop — followed by the Egyptian Museum and its treasures. Lunch is at a quality restaurant, the itinerary flexes around your interests, and there is no waiting on a busload of strangers. The most comfortable way to tick off Egypt\'s icons in a single day.',
    duration: '~16 h · private · long day',
    priceFrom: 175,
    images: [DESERT.cairoQuad, DESERT.sahara1, MARINE.giftun, DESERT.sahara4],
    pricing: [['solo', 'Private (1 guest)', 'Car, driver & guide', 175], ['pair', 'Private (2 guests)', 'Per pair, shared cost', 240], ['family', 'Private (up to 5)', 'Family group, one vehicle', 360]],
    addons: [['flight', 'Upgrade to domestic flight', 'Fly instead of drive — far shorter day', 180], ['museum', 'Royal Mummies Hall', 'Add the mummies hall entry & guiding', 18], ['lunch', 'Premium Nile-view lunch', 'Upgraded lunch with a Nile view', 16]],
    highlights: ['Private car, driver & Egyptologist', 'Great Pyramid & the Sphinx', 'Egyptian Museum treasures', 'Flexible, no group bus', 'Door-to-door from Hurghada'],
    inclusions: ['Private return transfer', 'Egyptologist guide', 'All site entry tickets', 'Lunch', 'Bottled water'],
    exclusions: ['Flight upgrade (add-on)', 'Optional extras (add-ons)', 'Tips'],
    windows: [['Full day', '04:00', '20:00']],
  },
  {
    slug: 'hurghada-private-luxor-day-tour',
    title: 'Hurghada · Private Luxor Day Tour',
    shortDescription: 'A private day in the world\'s greatest open-air museum — Karnak, the Valley of the Kings and Hatshepsut\'s temple with your own guide and car from Hurghada.',
    description: 'Luxor in a day, done properly and privately. A comfortable car and your own Egyptologist take you across to the Nile\'s ancient capital: the colossal columns of Karnak, the royal tombs of the Valley of the Kings, the dramatic terraces of Hatshepsut\'s temple and the towering Colossi of Memnon. The pace is yours, the guiding is one-on-one, and lunch is included at a good local restaurant. A rich, unforgettable day among the monuments of Thebes, with none of the group-tour herding.',
    duration: '~14 h · private · long day',
    priceFrom: 160,
    images: [DESERT.sahara3, DESERT.sahara6, DESERT.cairoQuad, DESERT.sahara8],
    pricing: [['solo', 'Private (1 guest)', 'Car, driver & guide', 160], ['pair', 'Private (2 guests)', 'Per pair, shared cost', 220], ['family', 'Private (up to 5)', 'Family group, one vehicle', 340]],
    addons: [['balloon', 'Sunrise hot-air balloon', 'Add a dawn balloon flight over the West Bank', 95], ['tombs', 'Extra royal tombs', 'Upgrade to additional tomb entries', 20], ['felucca', 'Nile felucca sail', 'Add a short traditional Nile sail', 18]],
    highlights: ['Private car, driver & Egyptologist', 'Karnak Temple complex', 'Valley of the Kings tombs', 'Hatshepsut\'s temple & the Colossi', 'Your own pace, one-on-one guiding'],
    inclusions: ['Private return transfer', 'Egyptologist guide', 'All site entry tickets', 'Lunch', 'Bottled water'],
    exclusions: ['Balloon flight (add-on)', 'Optional extras (add-ons)', 'Tips'],
    windows: [['Full day', '05:00', '19:00']],
  },
  {
    slug: 'hurghada-private-city-snorkel-combo',
    title: 'Hurghada · Private Hurghada City & Snorkel Combo',
    shortDescription: 'A flexible private half-day with your own guide and car — old town and souk, a coffee stop, then a private snorkel boat to a nearby reef.',
    description: 'The best of Hurghada, land and sea, on your own schedule. A private guide and air-conditioned car take you through the colourful old town and the El Dahar souk, with a stop for Egyptian coffee and time to shop without pressure. Then it\'s down to the marina for a private snorkel boat to a calm nearby reef, gear included, with a guide in the water to show you the coral and fish. A relaxed, fully tailored introduction to the city and the Red Sea in a single half-day.',
    duration: '~6 h · private · half day',
    priceFrom: 95,
    images: [MARINE.snorkel, MARINE.sea4, MARINE.orangeBay, DESERT.cairoQuad],
    pricing: [['pair', 'Private (up to 2)', 'Car, guide & snorkel boat', 95], ['family', 'Private (up to 5)', 'Family group rate', 150], ['group', 'Private (up to 8)', 'Larger private group', 220]],
    addons: [['lunch', 'Seafood lunch', 'Lunch at a marina seafood restaurant', 16], ['pickup', 'Extended drop-off', 'Drop at a beach or restaurant after', 8], ['photos', 'Photo set', 'Guide captures the day', 12]],
    highlights: ['Private guide & car all morning', 'Old town & El Dahar souk', 'Egyptian coffee & shopping stop', 'Private snorkel boat to a reef', 'Fully flexible half-day'],
    inclusions: ['Private city tour & transfer', 'Private guide', 'Private snorkel boat', 'Snorkel gear', 'Bottled water'],
    exclusions: ['Lunch (add-on)', 'Souk purchases', 'Tips'],
    windows: [['Morning', '08:30', '14:30'], ['Afternoon', '12:30', '18:30']],
  },
  {
    slug: 'hurghada-build-your-own-private-charter',
    title: 'Hurghada · Build-Your-Own Private Charter',
    shortDescription: 'Design your own private day — pick the car, guide, boat and stops you want, from reefs and deserts to cities and temples, and we build it around you.',
    description: 'Your trip, your rules. This bespoke charter starts with a quick chat about what you love — diving reefs, desert dunes, ancient temples, markets, food, photography — and we assemble a fully private day around it, with your own English-speaking guide, air-conditioned vehicle and, if you like, a private boat. Mix land and sea, go fast or slow, bring the kids or keep it to two. Ideal for repeat visitors, special occasions and anyone who finds fixed itineraries too rigid.',
    duration: 'Flexible · private · you choose',
    priceFrom: 120,
    images: [DESERT.sahara2, MARINE.sea1, DESERT.cairoQuad, MARINE.orangeBay],
    pricing: [['half', 'Private half-day', 'Guide + vehicle, build your route', 120], ['full', 'Private full-day', 'Guide + vehicle, full custom day', 200], ['fullboat', 'Full-day land + private boat', 'Add a private boat to the day', 360]],
    addons: [['guide', 'Specialist guide', 'Upgrade to a subject-expert guide', 35], ['photographer', 'Private photographer', 'A photographer joins for the day', 90], ['vip', 'VIP vehicle upgrade', 'Upgrade to a premium SUV/van', 45]],
    highlights: ['Fully bespoke private day', 'Mix reefs, desert, city & temples', 'Your own guide & vehicle', 'Go at your own pace', 'Tailored to your interests'],
    inclusions: ['Private English-speaking guide', 'Air-conditioned vehicle', 'Custom itinerary planning', 'Bottled water'],
    exclusions: ['Site entry tickets (per chosen plan)', 'Meals (unless specified)', 'Optional extras (add-ons)', 'Tips'],
    windows: [['Flexible', '06:00', '20:00']],
  },
];

// ───────────────────────────── hurghada-safari ─────────────────────────────
const SAFARI: Seed[] = [
  {
    slug: 'hurghada-sunset-safari-bedouin-dinner-stargazing',
    title: 'Hurghada · Sunset Desert Safari with Bedouin Dinner & Stargazing',
    shortDescription: 'The complete desert evening — ride into the dunes for golden hour, dine at a Bedouin camp, watch a tabla show and stargaze under brilliant skies.',
    description: 'Hurghada\'s signature desert night, start to finish. Head into the Eastern Desert in the late afternoon and reach an open dune just as the sun drops and the sand glows. At a Bedouin camp a charcoal dinner is laid out — grilled meats, fresh bread, salads and sweet tea — followed by tabla drums, a fire show and traditional dancing. When the music quiets, the lights go out and an astronomy guide walks you through a sky thick with stars and the band of the Milky Way. Sunset, feast and stars in one unforgettable evening.',
    duration: '~5 h · sunset + dinner + stars',
    priceFrom: 34,
    images: [DESERT.sahara5, DESERT.camelDinnerShow, DESERT.quadStargazing, DESERT.sahara2],
    pricing: [['adult', 'Adult', 'Safari + BBQ dinner + show + stars', 34], ['child', 'Child (4-11)', 'Junior rate', 20], ['family', 'Family (2A + 2C)', 'Family group rate', 94]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 8], ['camel', 'Add a camel ride', 'Short camel ride at the camp', 9], ['vip', 'VIP cushioned seating', 'Private low table & cushions', 12]],
    highlights: ['Golden-hour desert safari', 'Bedouin-camp BBQ dinner', 'Tabla drums & fire show', 'Guided stargazing & the Milky Way', 'The full desert evening in one'],
    inclusions: ['Sunset desert safari', 'BBQ dinner at the Bedouin camp', 'Bedouin show & campfire', 'Stargazing with a guide', 'Tea & water'],
    exclusions: ['Hotel pickup (add-on)', 'Camel ride (add-on)', 'Tips'],
    windows: [['Sunset', '15:30', '20:30']],
  },
  {
    slug: 'hurghada-quad-camel-dinner-combo',
    title: 'Hurghada · Quad + Camel + Dinner Combo',
    shortDescription: 'Three desert classics in one sunset trip — ride a quad bike across the dunes, hop on a camel, then feast and stargaze at a Bedouin camp.',
    description: 'For travellers who want a bit of everything. Start with your own quad bike, following a guide along desert tracks and over rolling dunes with the sun low and the sand glowing. Swap the engine for a camel and amble the old-fashioned way into a Bedouin camp, where a charcoal BBQ dinner, sweet tea and a tabla-and-fire show are waiting. Round off the night lying back for some serious stargazing. The action of a quad, the romance of a camel and a proper desert feast — all in one evening.',
    duration: '~5 h · quad + camel + dinner',
    priceFrom: 40,
    images: [DESERT.quad2, DESERT.quadBuggyCamel, DESERT.camelSunset, DESERT.quadStargazing],
    pricing: [['single', 'Single quad rider', 'Own quad + camel + dinner', 40], ['shared', 'Shared quad (2 riders)', 'Two share one quad', 64], ['child', 'Child (passenger)', 'Rides with an adult + dinner', 22]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 8], ['buggy', 'Upgrade to a dune buggy', 'Swap the quad for a 2-seat buggy', 18], ['drinks', 'Soft-drink package', 'Unlimited soft drinks at the camp', 7]],
    highlights: ['Quad-bike ride across the dunes', 'Camel ride into the camp', 'Bedouin BBQ dinner & fire show', 'Sunset over the desert', 'Stargazing to finish'],
    inclusions: ['Guided quad-bike ride', 'Camel ride', 'BBQ dinner & show', 'Helmet & goggles', 'Tea & water', 'Stargazing'],
    exclusions: ['Hotel pickup (add-on)', 'Buggy upgrade (add-on)', 'Tips'],
    windows: [['Sunset', '15:30', '20:30']],
  },
  {
    slug: 'hurghada-private-sunset-safari',
    title: 'Hurghada · Private Sunset Safari',
    shortDescription: 'A fully private desert safari for your group — your own 4x4 and guide, a quiet dune for sunset, and a private Bedouin dinner under the stars.',
    description: 'The desert at its best, just for you. This private safari gives your group its own 4x4 and guide, a personal sunset spot on a quiet dune away from the big convoys, and a private Bedouin dinner set up just for your party. No shared tables, no rushing between activities — only your group, the silence of the desert and a sky full of stars. The guide tailors the evening to you, whether that\'s extra stargazing, a slower pace or a celebration set-up. Ideal for couples, families and special occasions.',
    duration: '~5 h · private · sunset',
    priceFrom: 220,
    images: [DESERT.sahara4, DESERT.sahara7, DESERT.camelDinnerShow, DESERT.sahara5],
    pricing: [['couple', 'Private (up to 2)', '4x4, guide & private dinner', 220], ['family', 'Private (up to 5)', 'Family group, private set-up', 320], ['group', 'Private (up to 10)', 'Larger private group', 480]],
    addons: [['pickup', 'Group hotel pickup', 'Private air-conditioned transfer', 16], ['celebration', 'Celebration set-up', 'Cake, decoration & private table', 35], ['astronomy', 'Private astronomy guide', 'Dedicated telescope session', 25]],
    highlights: ['Your own 4x4 & guide', 'Private sunset dune, no crowds', 'Private Bedouin dinner', 'Tailored, unhurried evening', 'Perfect for couples & celebrations'],
    inclusions: ['Private sunset safari', 'Dedicated guide', 'Private Bedouin dinner', 'Stargazing', 'Tea & water'],
    exclusions: ['Hotel pickup (add-on)', 'Celebration set-up (add-on)', 'Tips'],
    windows: [['Sunset', '15:30', '20:30']],
  },
  {
    slug: 'hurghada-5-in-1-mega-safari',
    title: 'Hurghada · 5-in-1 Mega Safari',
    shortDescription: 'The ultimate desert day-into-night — quad bike, dune buggy, camel ride, Bedouin village and a BBQ-dinner show with stargazing, all on one ticket.',
    description: 'Everything the desert has to offer, packed into one big afternoon and evening. Ride a quad bike along the tracks, take the wheel of a two-seat dune buggy across the sand, amble on a camel, and visit a real Bedouin village to see how desert families live. As the sun sets it\'s back to camp for a charcoal BBQ dinner, a tabla-and-fire show, sweet tea and a guided look at the stars. Five experiences in one, brilliant value, and a guaranteed highlight for thrill-seekers and families alike.',
    duration: '~6 h · 5-in-1 · sunset',
    priceFrom: 49,
    images: [DESERT.quad1, DESERT.quadBuggyDinner, DESERT.quadBuggyCamel, DESERT.camelDinnerShow],
    pricing: [['adult', 'Adult', 'Quad + buggy + camel + village + dinner', 49], ['child', 'Child (4-11)', 'Junior 5-in-1 rate', 30], ['family', 'Family (2A + 2C)', 'Family group rate', 138]],
    addons: [['pickup', 'Hotel pickup & drop-off', 'Air-conditioned transfer', 8], ['horse', 'Add a horse ride', 'Short horse ride at the camp', 12], ['vip', 'VIP cushioned seating', 'Private low table & cushions', 12]],
    highlights: ['Quad, buggy, camel — all in one', 'Visit a real Bedouin village', 'BBQ dinner & fire show', 'Sunset across the dunes', 'Stargazing to close the night'],
    inclusions: ['Quad-bike ride', 'Dune-buggy drive', 'Camel ride', 'Bedouin village visit', 'BBQ dinner & show', 'Helmet & goggles', 'Tea & water'],
    exclusions: ['Hotel pickup (add-on)', 'Horse ride (add-on)', 'Tips'],
    windows: [['Afternoon', '14:30', '20:30']],
  },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function buildDoc(s: Seed, tenantId: any): any {
  return {
    slug: s.slug,
    title: s.title,
    shortDescription: s.shortDescription,
    description: s.description,
    images: s.images,
    category: 'water-activities',
    destination: { city: CITY, country: 'Egypt', coordinates: { lat: 27.2579, lng: 33.8116 } },
    duration: s.duration,
    languages: ['English', 'Arabic', 'German', 'Russian', 'Italian', 'French'],
    rating: 4.6 + Math.round(Math.random() * 3) / 10,
    reviewCount: 60 + Math.floor(Math.random() * 320),
    priceFrom: s.priceFrom,
    currency: 'USD',
    pricingOptions: s.pricing.map(([id, name, description, price]) => ({ id, name, description, price })),
    addons: s.addons.map(([id, name, description, price]) => ({ id, name, description, price })),
    entryWindows: s.windows.map(([label, startTime, endTime]) => ({ label, startTime, endTime })),
    itinerary: [],
    highlights: s.highlights,
    inclusions: s.inclusions,
    exclusions: s.exclusions,
    meetingPoint: {
      address: 'Hurghada · Red Sea coast',
      instructions: 'Most trips include optional air-conditioned hotel pickup as an add-on. Otherwise meet at the listed departure point 30 minutes before the start time.',
      mapUrl: 'https://maps.google.com/?q=27.2579,33.8116',
    },
    cancellationPolicy: 'Free cancellation up to 24 hours before',
    instantConfirmation: true,
    mobileTicket: true,
    hasHotelPickup: true,
    badges: ['free-cancellation', 'instant-confirm'],
    availability: { type: 'date-only', advanceBooking: 30 },
    tenantIds: [tenantId],
    status: 'active',
    featured: true,
  };
}

/**
 * Seed one tenant: detach from shared pool, create the brand catalog
 * idempotently, then set heroImages (6 from its own tours) + designMode.
 * status is NEVER changed — these tenants must stay `inactive`.
 */
async function seedTenant(slug: string, catalog: Seed[], designMode: string): Promise<void> {
  const tenant: any = await Tenant.findOne({ slug });
  if (!tenant) { console.log(`  ✗ ${slug} NOT FOUND`); return; }
  console.log(`\n${slug}:`);

  // 1. Detach from the shared generic pool (pull tenantId; never delete shared docs).
  const detach = await Attraction.updateMany(
    { tenantIds: tenant._id, slug: { $nin: catalog.map((c) => c.slug) } },
    { $pull: { tenantIds: tenant._id } },
  );
  console.log(`  ↩ detached from ${detach.modifiedCount} shared/old tours`);

  // 2. Seed the brand catalog (idempotent on slug).
  let created = 0;
  for (const s of catalog) {
    const exists = await Attraction.findOne({ slug: s.slug });
    if (exists) {
      if (!(exists.tenantIds || []).some((id: any) => String(id) === String(tenant._id))) {
        (exists as any).tenantIds = [...(exists.tenantIds || []), tenant._id];
        await exists.save();
      }
      console.log(`  • ${s.slug} (exists)`);
      continue;
    }
    await Attraction.create(buildDoc(s, tenant._id));
    created++;
    console.log(`  ✓ ${s.slug}`);
  }

  // 3. Set heroImages (6 URLs from this tenant's own new tours) + designMode.
  //    DO NOT touch status — these tenants must stay `inactive`.
  const heroImages = catalog.flatMap((c) => c.images).filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);
  tenant.heroImages = heroImages;
  tenant.designMode = designMode;
  await tenant.save();

  const total = await Attraction.countDocuments({ tenantIds: tenant._id });
  console.log(`  → created ${created}; tenant now has ${total} tours`);
  console.log(`  → heroImages set (${heroImages.length}); designMode='${tenant.designMode}'; status='${tenant.status}' (unchanged)`);
}

async function main(): Promise<void> {
  await connectDatabase();
  try {
    console.log('\n— Seeding remaining coming-soon catalogs —');
    await seedTenant('camel-riding-hurghada', CAMEL, 'caravan');
    await seedTenant('hurghada-dolphins', DOLPHINS, 'pod');
    await seedTenant('hurghada-jeep-safari', JEEP, 'overland');
    await seedTenant('hurghada-luxury-cruise', LUXURY, 'azure');
    await seedTenant('hurghada-private-tours', PRIVATE, 'concierge');
    await seedTenant('hurghada-safari', SAFARI, 'mirage');
    console.log('\n✅ Done. (tenants remain inactive)\n');
  } finally {
    await disconnectDatabase();
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

main().catch(async (e) => { console.error(e); await disconnectDatabase(); process.exit(1); });
