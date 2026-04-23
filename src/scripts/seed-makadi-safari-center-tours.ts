/**
 * Seed Makadi Bay Safari Center tours from client's GetYourGuide catalog (supplier:380448).
 * Generates images via gpt-image-1.5 medium quality.
 *
 * Usage: railway run npx ts-node src/scripts/seed-makadi-safari-center-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'makadi-bay-safari-center';

const TOURS = [
  {
    slug: 'makadi-oasis-sunset-camel-stargazing',
    title: 'Oasis Sunset Tour with Camel Ride and Stargazing',
    shortDescription: 'Visit a desert oasis at sunset, ride camels through golden dunes, and stargaze under the Milky Way.',
    description: 'Our top-rated experience. Drive to a hidden desert oasis as the sun sets, ride camels through golden dunes in the fading light, then settle into a Bedouin camp for tea, dinner, and guided stargazing with zero light pollution. A magical evening in the Egyptian desert.',
    category: 'adventure', duration: '5 hours', priceFrom: 40,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full oasis experience', price: 40 },
      { id: 'child', name: 'Child (6-12)', description: 'Full experience', price: 25 },
      { id: 'private', name: 'Private Group (up to 4)', description: 'Exclusive private tour', price: 140 },
    ],
    addons: [
      { id: 'telescope', name: 'Telescope Upgrade', description: 'Professional telescope stargazing', price: 12 },
      { id: 'bbq', name: 'BBQ Dinner Upgrade', description: 'Premium BBQ instead of standard dinner', price: 10 },
    ],
    highlights: ['Hidden desert oasis visit', 'Camel ride at sunset', 'Stargazing under the Milky Way', 'Bedouin tea & dinner', 'Rated 4.7★ by 900+ guests'],
    inclusions: ['4x4 transfer', 'Camel ride', 'Oasis visit', 'Dinner', 'Tea & drinks', 'Stargazing', 'Hotel pickup'],
    exclusions: ['Gratuities', 'Alcoholic beverages'],
    itinerary: [
      { time: '15:00', duration: '30 min', title: 'Hotel Pickup', description: 'Comfortable 4x4 pickup from your hotel.' },
      { time: '15:30', duration: '45 min', title: 'Desert Drive to Oasis', description: 'Scenic drive through the Eastern Desert.' },
      { time: '16:15', duration: '1 hr', title: 'Camel Ride', description: 'Mount your camel and ride through golden dunes towards the oasis.' },
      { time: '17:15', duration: '30 min', title: 'Oasis Visit', description: 'Explore the hidden oasis, take photos, enjoy Bedouin tea.' },
      { time: '17:45', duration: '30 min', title: 'Sunset Viewing', description: 'Watch the sunset from the dunes — prime photo opportunity.' },
      { time: '18:15', duration: '45 min', title: 'Dinner at Camp', description: 'Traditional Bedouin dinner with live music.' },
      { time: '19:00', duration: '30 min', title: 'Stargazing', description: 'Guided stargazing session in the dark desert sky.' },
      { time: '19:30', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Warm jacket (desert gets cold at night)', 'Camera', 'Comfortable closed shoes', 'Sunglasses', 'Cash for tips'],
    imagePrompt: 'Desert oasis at sunset in Egyptian Sahara near Hurghada, palm trees around water pool, camels resting, golden sky, tourists on camel ride approaching oasis.',
  },
  {
    slug: 'makadi-desert-safari-quad-buggy-dinner',
    title: 'Desert Safari with Quad, Buggy & Dinner Show',
    shortDescription: 'Adrenaline-packed safari with quad biking, dune buggy driving, and a Bedouin dinner show.',
    description: 'The ultimate desert adrenaline rush. Start with a quad bike ride across sand dunes, then switch to a powerful dune buggy for off-road thrills. End the evening at a Bedouin camp with a traditional dinner, belly dancing show, and fire performance. Rated 4.7★ by 1,200+ guests.',
    category: 'adventure', duration: '4 hours', priceFrom: 35,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Quad + buggy + dinner', price: 35 },
      { id: 'child', name: 'Child (8-12)', description: 'Shared vehicles + dinner', price: 22 },
      { id: 'private', name: 'Private Option', description: 'Private guide & vehicles', price: 120 },
    ],
    addons: [
      { id: 'camel', name: 'Add Camel Ride', description: '30-min camel ride at camp', price: 8 },
      { id: 'shisha', name: 'Shisha', description: 'Traditional hookah at camp', price: 5 },
    ],
    highlights: ['Quad bike + dune buggy combo', 'Bedouin dinner with belly dancing', 'Fire performance show', 'Rated 4.7★ by 1,200+ guests', 'Hotel pickup & drop-off'],
    inclusions: ['Quad bike', 'Dune buggy', 'Safety gear', 'Dinner', 'Show', 'Tea', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Photos'],
    itinerary: [
      { time: '15:00', duration: '20 min', title: 'Hotel Pickup & Briefing', description: 'Pickup and safety instructions at the safari camp.' },
      { time: '15:20', duration: '45 min', title: 'Quad Bike Ride', description: 'Ride quad bikes across sand dunes and open desert.' },
      { time: '16:05', duration: '45 min', title: 'Dune Buggy', description: 'Switch to a buggy for off-road thrills through terrain.' },
      { time: '16:50', duration: '30 min', title: 'Bedouin Camp Arrival', description: 'Tea, rest, and camp welcome.' },
      { time: '17:20', duration: '1 hr', title: 'Dinner & Show', description: 'Traditional dinner with belly dancing and fire show.' },
      { time: '18:20', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunglasses', 'Light jacket', 'Camera', 'Cash for tips'],
    imagePrompt: 'Desert safari quad biking and dune buggy in Egyptian desert at golden hour, sand dunes, tourists riding ATVs, dust clouds, adventure action shot.',
  },
  {
    slug: 'makadi-desert-experience-quad-buggy-camel',
    title: 'Hurghada Desert Experience with Quad, Buggy & Camel',
    shortDescription: 'Three desert activities in one trip — quad biking, buggy driving, and camel riding through the Sahara.',
    description: 'Our most popular combo. Experience the desert three ways: race across dunes on a quad bike, navigate terrain in a buggy, then slow down with a peaceful camel ride. Includes Bedouin tea stop and stunning desert panoramas. Rated 4.8★ by 2,200+ guests — our highest-rated product.',
    category: 'adventure', duration: '4.5 hours', priceFrom: 18,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'All 3 activities', price: 18 },
      { id: 'child', name: 'Child (8-12)', description: 'Shared vehicles + camel', price: 12 },
    ],
    addons: [
      { id: 'dinner', name: 'Add BBQ Dinner', description: 'Stay for Bedouin BBQ dinner', price: 12 },
      { id: 'photo', name: 'Photo Package', description: 'Professional desert photos', price: 8 },
    ],
    highlights: ['3 activities: quad + buggy + camel', 'Rated 4.8★ by 2,200+ guests', 'Bedouin tea stop', 'Budget-friendly starting price', 'No experience needed'],
    inclusions: ['Quad bike', 'Buggy', 'Camel ride', 'Tea', 'Safety gear', 'Water', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Dinner (available as add-on)'],
    itinerary: [
      { time: '14:00', duration: '20 min', title: 'Pickup & Safety Briefing', description: 'Hotel pickup and driving instructions.' },
      { time: '14:20', duration: '1 hr', title: 'Quad Bike Ride', description: 'Ride across dunes and open desert.' },
      { time: '15:20', duration: '45 min', title: 'Dune Buggy', description: 'Navigate varied terrain in a buggy.' },
      { time: '16:05', duration: '45 min', title: 'Camel Ride', description: 'Peaceful camel trek through the desert.' },
      { time: '16:50', duration: '20 min', title: 'Bedouin Tea', description: 'Relax with traditional tea at camp.' },
      { time: '17:10', duration: '20 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunscreen', 'Sunglasses', 'Camera', 'Water bottle'],
    imagePrompt: 'Three desert activities in one image - quad bike, dune buggy, and camel in Egyptian desert, tourists enjoying safari, golden sand dunes, warm light.',
  },
  {
    slug: 'makadi-desert-safari-camel-dinner-show',
    title: 'Desert Safari with Camel Ride & Dinner Show',
    shortDescription: 'Classic desert safari with a camel trek, traditional Bedouin dinner, belly dancing, and entertainment.',
    description: 'The classic Hurghada desert experience. Ride a camel through the desert at sunset, arrive at a Bedouin camp for a freshly prepared dinner, then enjoy live entertainment including belly dancing, a tanoura spin show, and fire performance. A memorable evening under the stars.',
    category: 'tours', duration: '5 hours', priceFrom: 38,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full experience', price: 38 },
      { id: 'child', name: 'Child (4-12)', description: 'Full experience', price: 22 },
    ],
    addons: [
      { id: 'quad', name: 'Add Quad Ride', description: '30-min quad ride before camel', price: 10 },
      { id: 'stargazing', name: 'Stargazing Extension', description: 'Stay late for guided stargazing', price: 8 },
    ],
    highlights: ['Camel ride at sunset', 'Traditional Bedouin dinner', 'Belly dancing & tanoura show', 'Fire performance', 'Starlit desert atmosphere'],
    inclusions: ['Camel ride', 'Dinner', 'Shows', 'Tea & drinks', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'Alcoholic beverages'],
    itinerary: [
      { time: '15:30', duration: '30 min', title: 'Hotel Pickup', description: 'Comfortable transfer to desert camp.' },
      { time: '16:00', duration: '1 hr', title: 'Camel Ride', description: 'Sunset camel trek through golden dunes.' },
      { time: '17:00', duration: '30 min', title: 'Camp Welcome', description: 'Tea, henna, and camp exploration.' },
      { time: '17:30', duration: '1 hr', title: 'Dinner', description: 'Traditional Bedouin dinner freshly prepared.' },
      { time: '18:30', duration: '45 min', title: 'Entertainment', description: 'Belly dancing, tanoura spinning, and fire show.' },
      { time: '19:15', duration: '15 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Warm layer for evening', 'Comfortable trousers for camel', 'Camera', 'Cash for tips'],
    imagePrompt: 'Bedouin camp dinner show in Egyptian desert, belly dancer performing, campfire, camels nearby, starry night sky, tourists seated on cushions.',
  },
  {
    slug: 'makadi-oasis-sunset-camel-stars-premium',
    title: 'Oasis Sunset with Camel Ride & Stars — Premium',
    shortDescription: 'Small group premium oasis experience with extended camel ride, gourmet dinner, and telescope stargazing.',
    description: 'Our premium small-group version of the oasis sunset tour. Longer camel ride, gourmet Bedouin dinner with extra courses, professional telescope for planet and star viewing, and a desert guide who shares ancient navigation stories. Maximum 8 guests for an intimate experience.',
    category: 'adventure', duration: '6 hours', priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Premium small group', price: 55 },
      { id: 'child', name: 'Child (6-12)', description: 'Premium small group', price: 35 },
    ],
    addons: [
      { id: 'blanket', name: 'Desert Blanket', description: 'Take-home Bedouin woven blanket', price: 12 },
    ],
    highlights: ['Small group — max 8 guests', 'Extended camel ride', 'Gourmet Bedouin dinner', 'Professional telescope stargazing', 'Rated 4.8★ by 330+ guests'],
    inclusions: ['4x4 transfer', 'Extended camel ride', 'Oasis visit', 'Gourmet dinner', 'Telescope', 'Tea & drinks', 'Hotel pickup'],
    exclusions: ['Gratuities'],
    itinerary: [
      { time: '15:00', duration: '30 min', title: 'Private Pickup', description: 'Small group pickup — max 8 guests.' },
      { time: '15:30', duration: '1.5 hr', title: 'Extended Camel Ride', description: 'Longer route through varied desert terrain to the oasis.' },
      { time: '17:00', duration: '30 min', title: 'Oasis Exploration', description: 'Explore the oasis and surrounding desert.' },
      { time: '17:30', duration: '30 min', title: 'Sunset Viewing', description: 'Premium sunset viewpoint with complimentary beverages.' },
      { time: '18:00', duration: '1 hr', title: 'Gourmet Dinner', description: 'Multi-course Bedouin gourmet dinner with premium ingredients.' },
      { time: '19:00', duration: '1 hr', title: 'Telescope Stargazing', description: 'Professional telescope session — see planets, nebulae, Milky Way.' },
      { time: '20:00', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Warm jacket', 'Camera with night mode', 'Comfortable shoes', 'Cash for tips'],
    imagePrompt: 'Small group stargazing in Egyptian desert with professional telescope, Milky Way clearly visible, Bedouin camp with gourmet dinner setup, camels resting.',
  },
  {
    slug: 'makadi-quad-buggy-oriental-show',
    title: 'Hurghada Quad Biking & Buggy Safari with Oriental Show',
    shortDescription: 'Quad and buggy desert adventure followed by an authentic oriental dinner show with live music.',
    description: 'Combine desert adrenaline with cultural entertainment. Ride quad bikes and buggies across the desert, then settle in for a spectacular oriental show featuring belly dancing, tanoura spinning, fire eating, and live Arabic music — all accompanied by a traditional Egyptian dinner.',
    category: 'adventure', duration: '5 hours', priceFrom: 20,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Quad + buggy + show', price: 20 },
      { id: 'child', name: 'Child (8-12)', description: 'Shared vehicles + show', price: 14 },
    ],
    addons: [
      { id: 'camel', name: 'Add Camel Ride', description: 'Pre-show camel trek', price: 8 },
    ],
    highlights: ['Quad bike + buggy combo', 'Full oriental dinner show', 'Belly dancing + tanoura + fire show', 'Live Arabic music', 'Budget-friendly'],
    inclusions: ['Quad bike', 'Buggy', 'Dinner', 'Oriental show', 'Safety gear', 'Tea', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Photos'],
    itinerary: [
      { time: '15:00', duration: '20 min', title: 'Pickup & Briefing', description: 'Hotel pickup and safety brief.' },
      { time: '15:20', duration: '45 min', title: 'Quad Bike Ride', description: 'Quad biking across desert dunes.' },
      { time: '16:05', duration: '45 min', title: 'Buggy Safari', description: 'Dune buggy through varied terrain.' },
      { time: '16:50', duration: '30 min', title: 'Camp Break', description: 'Tea and rest at Bedouin camp.' },
      { time: '17:20', duration: '45 min', title: 'Dinner', description: 'Traditional Egyptian dinner.' },
      { time: '18:05', duration: '1 hr', title: 'Oriental Show', description: 'Full show: belly dancing, tanoura, fire eating, live music.' },
      { time: '19:05', duration: '25 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunglasses', 'Camera', 'Light jacket', 'Cash for tips'],
    imagePrompt: 'Oriental dinner show in desert camp near Hurghada, tanoura dancer spinning, colorful lights, fire performer, quad bikes parked in background, festive atmosphere.',
  },
  {
    slug: 'makadi-atv-safari-sand-mountain',
    title: 'Hurghada ATV Safari to Sand Mountain & Desert Views',
    shortDescription: 'High-speed ATV quad ride to Sand Mountain with panoramic desert views and Bedouin tea.',
    description: 'An adrenaline-pumping ATV adventure to the famous Sand Mountain near Hurghada. Ride powerful quad bikes through varied desert terrain — flat plains, rocky valleys, and towering dunes. Reach the summit of Sand Mountain for breathtaking 360° desert views, then enjoy Bedouin tea before the ride back.',
    category: 'adventure', duration: '2.5 hours', priceFrom: 50,
    pricingOptions: [
      { id: 'single', name: 'Single Rider', description: 'Own ATV', price: 50 },
      { id: 'double', name: 'Double Rider', description: 'Shared ATV', price: 65 },
      { id: 'private', name: 'Private Tour', description: 'Private guide & route', price: 95 },
    ],
    addons: [
      { id: 'gopro', name: 'GoPro Rental', description: 'Action camera for the ride', price: 10 },
    ],
    highlights: ['Sand Mountain summit — 360° views', 'Powerful ATV quad bikes', 'Varied desert terrain', 'Bedouin tea stop', 'Rated 4.8★ by 300+ guests'],
    inclusions: ['ATV quad bike', 'Helmet & goggles', 'Water', 'Bedouin tea', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'Photos'],
    itinerary: [
      { time: '08:00', duration: '20 min', title: 'Pickup & Briefing', description: 'Hotel pickup and ATV driving instructions.' },
      { time: '08:20', duration: '45 min', title: 'ATV Ride to Sand Mountain', description: 'Ride through flat desert and rocky terrain.' },
      { time: '09:05', duration: '30 min', title: 'Sand Mountain Summit', description: '360° panoramic views from the top.' },
      { time: '09:35', duration: '15 min', title: 'Bedouin Tea Stop', description: 'Tea and photos at a desert camp.' },
      { time: '09:50', duration: '30 min', title: 'Return Ride', description: 'Scenic route back through valleys.' },
      { time: '10:20', duration: '20 min', title: 'Hotel Drop-off', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunscreen', 'Sunglasses', 'Dust scarf or bandana', 'Camera', 'Water'],
    imagePrompt: 'ATV quad bike on top of sand mountain in Egyptian desert near Hurghada, panoramic desert view, rider posing with helmet, dramatic landscape.',
  },
  {
    slug: 'makadi-desert-hiking-yoga-camel-sunset',
    title: 'Desert Hiking, Yoga & Camel Ride at Sunset',
    shortDescription: 'A wellness desert experience — guided hiking, sunset yoga session, and a peaceful camel ride.',
    description: 'A unique fusion of adventure and wellness. Hike through scenic desert trails, then practice yoga on a sand dune as the sun sets over the Red Sea mountains. Finish with a peaceful camel ride back to camp for herbal tea and light refreshments. Perfect for mindful travelers.',
    category: 'tours', duration: '5.5 hours', priceFrom: 55,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Hiking + yoga + camel', price: 55 },
    ],
    addons: [
      { id: 'dinner', name: 'Add Bedouin Dinner', description: 'Stay for dinner after yoga', price: 12 },
    ],
    highlights: ['Desert hiking through scenic trails', 'Sunset yoga on sand dunes', 'Peaceful camel ride', 'Herbal tea & refreshments', 'Rated 4.9★ — unique wellness experience'],
    inclusions: ['Guided hike', 'Yoga session', 'Camel ride', 'Tea & refreshments', 'Hotel transfers', 'Yoga mat'],
    exclusions: ['Gratuities', 'Dinner (available as add-on)'],
    itinerary: [
      { time: '14:30', duration: '30 min', title: 'Pickup', description: 'Hotel collection and drive to desert trail.' },
      { time: '15:00', duration: '1.5 hr', title: 'Desert Hiking', description: 'Guided hike through scenic desert trails and rock formations.' },
      { time: '16:30', duration: '1 hr', title: 'Sunset Yoga', description: 'Yoga session on a sand dune overlooking the desert.' },
      { time: '17:30', duration: '45 min', title: 'Camel Ride', description: 'Peaceful camel ride back to camp in twilight.' },
      { time: '18:15', duration: '30 min', title: 'Herbal Tea & Refreshments', description: 'Relax at camp with tea and light bites.' },
      { time: '18:45', duration: '15 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Yoga-friendly clothing', 'Trainers/hiking shoes', 'Water bottle', 'Sunscreen', 'Yoga mat (optional — provided)'],
    imagePrompt: 'Yoga session on sand dune at sunset in Egyptian desert, woman in yoga pose on mat, golden light, camel waiting nearby, peaceful desert landscape.',
  },
  {
    slug: 'makadi-canyon-jeep-dinner-stars',
    title: 'Canyon Jeep Tour, Dinner & Stars Experience',
    shortDescription: 'Off-road jeep adventure through desert canyons, followed by a gourmet dinner and stargazing.',
    description: 'Explore hidden desert canyons in a 4x4 jeep — navigate narrow rocky passages, discover ancient geological formations, and reach viewpoints with stunning desert panoramas. Then enjoy a gourmet dinner at a secluded camp followed by guided stargazing. Rated 4.9★.',
    category: 'adventure', duration: '5 hours', priceFrom: 80,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Jeep + dinner + stars', price: 80 },
      { id: 'child', name: 'Child (8-12)', description: 'Full experience', price: 50 },
    ],
    addons: [
      { id: 'camel', name: 'Add Camel Ride', description: 'Camel ride to the canyon entrance', price: 12 },
    ],
    highlights: ['Off-road jeep through desert canyons', 'Ancient geological formations', 'Gourmet dinner at secluded camp', 'Guided stargazing', 'Rated 4.9★'],
    inclusions: ['4x4 jeep', 'Canyon tour', 'Gourmet dinner', 'Stargazing', 'Tea & drinks', 'Hotel transfers', 'Expert guide'],
    exclusions: ['Gratuities'],
    itinerary: [
      { time: '14:00', duration: '30 min', title: 'Pickup', description: 'Hotel pickup in a 4x4 jeep.' },
      { time: '14:30', duration: '1.5 hr', title: 'Canyon Exploration', description: 'Navigate narrow canyons, discover rock formations and fossils.' },
      { time: '16:00', duration: '30 min', title: 'Desert Viewpoint', description: 'Panoramic views from a high plateau.' },
      { time: '16:30', duration: '30 min', title: 'Camp Setup', description: 'Arrive at secluded camp, relax with tea.' },
      { time: '17:00', duration: '1 hr', title: 'Gourmet Dinner', description: 'Multi-course dinner under the open sky.' },
      { time: '18:00', duration: '45 min', title: 'Stargazing', description: 'Guided stargazing with constellation stories.' },
      { time: '18:45', duration: '15 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Warm jacket', 'Sturdy shoes', 'Camera', 'Binoculars (optional)', 'Cash for tips'],
    imagePrompt: 'Jeep driving through narrow desert canyon in Egyptian Eastern Desert, dramatic rock walls, 4x4 vehicle navigating rocky terrain, warm sunset light.',
  },
  {
    slug: 'makadi-sunset-oasis-horse-ride-stargazing',
    title: 'Sunset Oasis Safari with Horse Ride & Stargazing',
    shortDescription: 'Ride a horse through the desert to a hidden oasis at sunset, then stargaze under clear skies.',
    description: 'A romantic desert adventure. Ride a horse across the golden desert at sunset, arrive at a secluded oasis, and watch the sky transform from gold to deep blue. Enjoy Bedouin tea and a light dinner, then lie back for stargazing in one of the darkest skies on Earth. Rated 4.9★.',
    category: 'adventure', duration: '5 hours', priceFrom: 40,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Horse ride + oasis + stars', price: 40 },
      { id: 'child', name: 'Child (8-12)', description: 'Pony ride option', price: 28 },
    ],
    addons: [
      { id: 'dinner-upgrade', name: 'Full Dinner Upgrade', description: 'BBQ dinner instead of light meal', price: 10 },
    ],
    highlights: ['Horse ride at sunset', 'Hidden oasis visit', 'Stargazing in darkest skies', 'Bedouin tea & dinner', 'Rated 4.9★ by 240+ guests'],
    inclusions: ['Horse ride', 'Oasis visit', 'Light dinner', 'Tea & drinks', 'Stargazing', 'Hotel transfers'],
    exclusions: ['Gratuities'],
    itinerary: [
      { time: '15:00', duration: '30 min', title: 'Pickup', description: 'Hotel collection and drive to stables.' },
      { time: '15:30', duration: '1.5 hr', title: 'Horse Ride', description: 'Ride through desert towards the hidden oasis at sunset.' },
      { time: '17:00', duration: '30 min', title: 'Oasis Visit', description: 'Explore the oasis, take photos.' },
      { time: '17:30', duration: '30 min', title: 'Light Dinner', description: 'Bedouin tea and light dinner at camp.' },
      { time: '18:00', duration: '45 min', title: 'Stargazing', description: 'Lie back and watch the stars appear.' },
      { time: '18:45', duration: '15 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Long trousers for riding', 'Closed shoes', 'Warm layer', 'Camera'],
    imagePrompt: 'Horse riding at sunset in Egyptian desert near oasis, rider on horse crossing golden sand, palm tree oasis in background, dramatic orange sunset sky.',
  },
  {
    slug: 'makadi-camel-horse-offroad-jeep',
    title: 'Camel Ride, Horse Ride & Off-Road Jeep Tour',
    shortDescription: 'Three ways to explore the desert — camel, horse, and 4x4 jeep through varied terrain.',
    description: 'A comprehensive desert experience combining three modes of transport. Start with a jeep ride to remote desert locations, then ride a horse across open plains, and finish with a camel trek through the dunes. Includes a Bedouin tea stop with panoramic views.',
    category: 'adventure', duration: '3.5 hours', priceFrom: 60,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'All 3 activities', price: 60 },
      { id: 'child', name: 'Child (6-12)', description: 'Adapted activities', price: 38 },
    ],
    addons: [
      { id: 'quad', name: 'Add Quad Ride', description: '30 min quad bike session', price: 15 },
    ],
    highlights: ['3 transport modes: jeep + horse + camel', 'Varied desert terrain', 'Small group experience', 'Bedouin tea stop', 'Rated 4.8★'],
    inclusions: ['Jeep ride', 'Horse ride', 'Camel ride', 'Tea', 'Water', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'Lunch'],
    itinerary: [
      { time: '14:00', duration: '20 min', title: 'Pickup', description: 'Hotel collection by jeep.' },
      { time: '14:20', duration: '45 min', title: 'Jeep Safari', description: 'Off-road drive to remote desert locations.' },
      { time: '15:05', duration: '45 min', title: 'Horse Ride', description: 'Ride across open desert plains.' },
      { time: '15:50', duration: '45 min', title: 'Camel Trek', description: 'Gentle camel ride through the dunes.' },
      { time: '16:35', duration: '20 min', title: 'Bedouin Tea', description: 'Tea with panoramic views at camp.' },
      { time: '16:55', duration: '25 min', title: 'Return', description: 'Jeep transfer back to hotel.' },
    ],
    whatToBring: ['Comfortable trousers', 'Closed shoes', 'Sunscreen', 'Camera', 'Water'],
    imagePrompt: 'Desert tour with jeep, horse, and camel together in Egyptian desert landscape, tourists on different animals and vehicle, golden sand dunes.',
  },
  {
    slug: 'makadi-desert-quad-safari-dinner-stargazing',
    title: 'Hurghada Desert Quad Safari with Dinner & Stargazing',
    shortDescription: 'Quad bike across the desert, enjoy a Bedouin dinner, and stargaze in the clear desert sky.',
    description: 'A perfect evening in the desert. Start with an exhilarating quad bike ride across sand dunes and open terrain, then park up at a Bedouin camp for a traditional dinner with live music. After dinner, lie back and gaze at the stars — the desert sky is one of the clearest on Earth.',
    category: 'adventure', duration: '3.5 hours', priceFrom: 18,
    pricingOptions: [
      { id: 'single', name: 'Single Quad', description: 'Own quad bike', price: 18 },
      { id: 'double', name: 'Double Quad', description: 'Shared quad', price: 25 },
    ],
    addons: [
      { id: 'buggy', name: 'Buggy Upgrade', description: 'Dune buggy instead of quad', price: 10 },
    ],
    highlights: ['Quad bike safari', 'Bedouin dinner with live music', 'Desert stargazing', 'Budget-friendly', 'Small group — max 12'],
    inclusions: ['Quad bike', 'Safety gear', 'Dinner', 'Tea', 'Stargazing', 'Hotel transfers'],
    exclusions: ['Gratuities'],
    itinerary: [
      { time: '16:00', duration: '20 min', title: 'Pickup & Briefing', description: 'Hotel pickup and quad bike safety brief.' },
      { time: '16:20', duration: '1 hr', title: 'Quad Safari', description: 'Ride across dunes and open desert.' },
      { time: '17:20', duration: '30 min', title: 'Camp Arrival', description: 'Tea and rest at Bedouin camp.' },
      { time: '17:50', duration: '45 min', title: 'Dinner', description: 'Traditional dinner with live music.' },
      { time: '18:35', duration: '30 min', title: 'Stargazing', description: 'Desert stargazing — Milky Way visible.' },
      { time: '19:05', duration: '25 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Warm jacket', 'Closed shoes', 'Camera', 'Cash for tips'],
    imagePrompt: 'Quad bike parked at Bedouin camp under starry sky in Egyptian desert, campfire, dinner setup, tourists stargazing, Milky Way visible.',
  },
  {
    slug: 'makadi-sea-mountains-atv-tour',
    title: 'Sea and Mountains ATV Quad Bike Tour',
    shortDescription: 'ATV ride from desert to coast — experience both mountain terrain and Red Sea views.',
    description: 'A unique route that takes you from the desert mountains to the Red Sea coast on a quad bike. Navigate rocky mountain trails, descend through valleys, and emerge with stunning panoramic views of the Red Sea. A completely different ATV experience from standard dune tours.',
    category: 'adventure', duration: '3 hours', priceFrom: 30,
    pricingOptions: [
      { id: 'single', name: 'Single Rider', description: 'Own ATV', price: 30 },
      { id: 'double', name: 'Double Rider', description: 'Shared ATV', price: 42 },
    ],
    addons: [
      { id: 'snorkel', name: 'Add Beach Snorkeling', description: 'Snorkeling at the coast arrival', price: 12 },
    ],
    highlights: ['Mountains to sea route', 'Rocky mountain trails', 'Red Sea panoramic views', 'Unique non-standard route', 'Varied terrain'],
    inclusions: ['ATV quad', 'Helmet & goggles', 'Water', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'Snorkeling (available as add-on)'],
    itinerary: [
      { time: '08:00', duration: '20 min', title: 'Pickup', description: 'Hotel pickup and drive to starting point.' },
      { time: '08:20', duration: '1 hr', title: 'Mountain Trail Ride', description: 'ATV ride through rocky mountain terrain.' },
      { time: '09:20', duration: '30 min', title: 'Coastal Viewpoint', description: 'Reach the ridge with Red Sea panoramic views.' },
      { time: '09:50', duration: '45 min', title: 'Descent to Coast', description: 'Ride down valleys towards the sea.' },
      { time: '10:35', duration: '25 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunscreen', 'Sunglasses', 'Camera', 'Dust bandana'],
    imagePrompt: 'ATV quad bike on mountain trail overlooking Red Sea coast near Hurghada Egypt, rocky desert terrain, blue sea in distance, adventurous riding.',
  },
  {
    slug: 'makadi-mount-shaib-sandboarding',
    title: 'Mount Shaib El Banat Tour with Sandboarding',
    shortDescription: 'Hike to Mount Shaib El Banat and sandboard down the massive dunes — an extreme desert adventure.',
    description: 'Trek to the legendary Mount Shaib El Banat — one of the highest sand mountains near Hurghada. Hike to the summit for breathtaking views, then grab a sandboard and surf down the massive dunes. An extreme adventure rated 5.0★ by returning guests.',
    category: 'adventure', duration: '6.5 hours', priceFrom: 80,
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Hike + sandboarding', price: 80 },
    ],
    addons: [
      { id: 'lunch', name: 'Desert Picnic Lunch', description: 'Packed lunch at the summit', price: 12 },
    ],
    highlights: ['Mount Shaib El Banat summit', 'Sandboarding down massive dunes', 'Extreme adventure', 'Rated 5.0★', 'Stunning panoramic views'],
    inclusions: ['4x4 transfer', 'Guided hike', 'Sandboard', 'Water & snacks', 'Hotel transfers'],
    exclusions: ['Gratuities', 'Lunch (available as add-on)'],
    itinerary: [
      { time: '07:00', duration: '30 min', title: 'Pickup', description: 'Early hotel pickup for the drive to Mount Shaib.' },
      { time: '07:30', duration: '1.5 hr', title: 'Drive to Mount Shaib', description: '4x4 transfer to the base of Mount Shaib El Banat.' },
      { time: '09:00', duration: '1.5 hr', title: 'Hike to Summit', description: 'Guided hike up the sand mountain with rest stops.' },
      { time: '10:30', duration: '30 min', title: 'Summit Views', description: '360° views and photo opportunities.' },
      { time: '11:00', duration: '1 hr', title: 'Sandboarding', description: 'Multiple runs down the massive dunes.' },
      { time: '12:00', duration: '30 min', title: 'Rest & Refreshments', description: 'Water and snacks at the base.' },
      { time: '12:30', duration: '1 hr', title: 'Return Drive', description: '4x4 transfer back to hotel.' },
    ],
    whatToBring: ['Hiking boots or sturdy trainers', 'Sunscreen SPF50', 'Hat', 'Water (extra)', 'Camera', 'Old clothes (sand gets everywhere)'],
    imagePrompt: 'Sandboarding down massive sand dune at Mount Shaib El Banat Egypt, person on sandboard descending steep golden dune, dramatic desert mountain landscape.',
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
        subcategory: tour.slug.includes('quad') || tour.slug.includes('atv') || tour.slug.includes('buggy') ? 'quad-biking' : tour.slug.includes('camel') ? 'camel-ride' : tour.slug.includes('jeep') ? 'jeep-safari' : tour.slug.includes('horse') ? 'horse-riding' : 'safari',
        destination: { city: 'Makadi Bay', country: 'Egypt', coordinates: { lat: 27.1167, lng: 33.9000 } },
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
        accessibility: ['Wheelchair not accessible', 'Not recommended for pregnant travelers', 'Moderate physical fitness required'],
        gettingThere: [
          { mode: 'Hotel Pickup', description: 'Complimentary pickup from any hotel in Makadi Bay, Sahl Hasheesh, and Hurghada. Driver will meet you at the lobby.' },
          { mode: 'Self Drive', description: 'Drive to Safari Camp, Makadi Bay Road, Hurghada. Free parking available.' },
        ],
        highlights: tour.highlights,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        meetingPoint: {
          address: 'Hotel lobby pickup, Makadi Bay / Hurghada',
          instructions: 'Our driver will collect you from your hotel lobby 15 minutes before departure. Please wear comfortable clothes and closed shoes.',
          mapUrl: 'https://maps.google.com/?q=27.1167,33.9000',
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before the start time for a full refund.',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['free-cancellation', 'instant-confirm'],
        availability: { type: 'time-slots', advanceBooking: 30 },
        seo: {
          metaTitle: `${tour.title} | Makadi Bay Safari Center`,
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

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
    console.log(`Total Makadi Bay Safari Center tours: ${2 + created}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
