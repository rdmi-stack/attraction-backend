/**
 * Seed additional tours for Desert Fox Safari tenant.
 *
 * Adds 8 safari/desert-themed tours assigned exclusively to the
 * desert-fox-safari tenant. Idempotent: skips tours whose slug
 * already exists.
 *
 * Usage:
 *   railway run npx ts-node src/scripts/seed-desert-fox-tours.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Types } from 'mongoose';

const TENANT_SLUG = 'desert-fox-safari';

const TOURS = [
  {
    slug: 'desert-fox-sunset-quad-safari',
    title: 'Sunset Quad Bike Safari',
    shortDescription: 'Race across golden dunes on a powerful quad bike as the sun sets over the Egyptian desert.',
    description: 'Experience the thrill of quad biking through the Hurghada desert at golden hour. Our expert guides lead you through towering sand dunes and open desert plains. Stop at a Bedouin village for traditional tea and watch the spectacular Red Sea sunset before riding back under the stars.',
    category: 'adventure',
    subcategory: 'quad-biking',
    duration: '3 hours',
    priceFrom: 35,
    images: [
      'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/desert-fox-safari/quad-sunset.jpg',
    ],
    pricingOptions: [
      { id: 'adult', name: 'Adult (Single Quad)', description: 'One rider per quad bike', price: 35 },
      { id: 'double', name: 'Double Quad', description: 'Two riders per quad bike', price: 50 },
    ],
    addons: [
      { id: 'gopro', name: 'GoPro Rental', description: 'Action camera rental for the ride', price: 10 },
      { id: 'photo', name: 'Photo Package', description: 'Professional photos during the tour', price: 15 },
    ],
    entryWindows: [
      { label: 'Afternoon', startTime: '15:00', endTime: '15:30' },
      { label: 'Late Afternoon', startTime: '16:00', endTime: '16:30' },
    ],
    highlights: ['Adrenaline-pumping quad ride through real desert dunes', 'Bedouin village tea stop', 'Stunning Red Sea sunset views', 'All safety gear provided', 'Hotel pickup & drop-off included'],
    inclusions: ['Quad bike with fuel', 'Helmet and goggles', 'Bedouin tea', 'Hotel transfers', 'English-speaking guide'],
    exclusions: ['Personal expenses', 'Gratuities', 'Photos (available as add-on)'],
    itinerary: [
      { time: '15:00', duration: '30 min', title: 'Pickup & Safety Briefing', description: 'Hotel pickup and safety instructions at the safari camp.' },
      { time: '15:30', duration: '1 hr', title: 'Desert Quad Ride', description: 'Ride through dunes and open desert following the guide.' },
      { time: '16:30', duration: '30 min', title: 'Bedouin Village', description: 'Traditional tea and rest at an authentic Bedouin settlement.' },
      { time: '17:00', duration: '45 min', title: 'Sunset Ride Back', description: 'Return ride with photo stops as the sun sets.' },
      { time: '17:45', duration: '15 min', title: 'Return', description: 'Drop-off at hotel.' },
    ],
    whatToBring: ['Comfortable closed-toe shoes', 'Sunglasses', 'Light long-sleeve shirt', 'Camera'],
  },
  {
    slug: 'desert-fox-super-safari-combo',
    title: 'Super Safari Combo: Quad, Camel & Bedouin Dinner',
    shortDescription: 'The ultimate desert experience — quad biking, camel riding, stargazing, and a Bedouin BBQ dinner.',
    description: 'Our signature super safari combines three desert adventures into one unforgettable evening. Start with high-speed quad biking across the dunes, switch to a camel for a serene ride to a Bedouin camp, then enjoy a traditional BBQ dinner under the stars with live entertainment.',
    category: 'adventure',
    subcategory: 'safari',
    duration: '5 hours',
    priceFrom: 55,
    images: [
      'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/desert-fox-safari/super-safari.jpg',
    ],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full combo experience', price: 55 },
      { id: 'child', name: 'Child (6-12)', description: 'Shared quad, own camel', price: 35 },
    ],
    addons: [
      { id: 'private-quad', name: 'Private Quad Upgrade', description: 'Your own quad instead of shared', price: 15 },
      { id: 'vip-dinner', name: 'VIP Dinner Upgrade', description: 'Premium BBQ with extra courses', price: 20 },
      { id: 'shisha', name: 'Shisha at Camp', description: 'Traditional shisha pipe at the Bedouin camp', price: 8 },
    ],
    entryWindows: [
      { label: 'Afternoon Departure', startTime: '14:00', endTime: '14:30' },
      { label: 'Late Departure', startTime: '15:00', endTime: '15:30' },
    ],
    highlights: ['Three adventures in one: quad, camel, dinner', 'Authentic Bedouin BBQ under the stars', 'Camel ride through desert canyon', 'Live Bedouin music and dancing', 'Stargazing in zero-light-pollution desert'],
    inclusions: ['Quad bike with fuel', 'Camel ride', 'BBQ dinner with soft drinks', 'Tea and snacks', 'All safety equipment', 'Hotel transfers', 'English guide'],
    exclusions: ['Alcoholic beverages', 'Gratuities', 'Personal expenses'],
    itinerary: [
      { time: '14:00', duration: '30 min', title: 'Hotel Pickup', description: 'Comfortable jeep transfer to the desert camp.' },
      { time: '14:30', duration: '1 hr', title: 'Quad Biking', description: 'High-speed dune adventure with your guide.' },
      { time: '15:30', duration: '45 min', title: 'Camel Ride', description: 'Peaceful camel trek to the Bedouin settlement.' },
      { time: '16:15', duration: '30 min', title: 'Bedouin Tea & Henna', description: 'Tea, henna painting, and cultural activities.' },
      { time: '16:45', duration: '1 hr', title: 'Sunset & Stargazing', description: 'Watch the sunset and early stars from the dunes.' },
      { time: '17:45', duration: '1 hr', title: 'BBQ Dinner & Show', description: 'Traditional BBQ with live Bedouin music.' },
      { time: '18:45', duration: '15 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Warm layer for evening', 'Closed shoes', 'Camera', 'Cash for tips'],
  },
  {
    slug: 'desert-fox-morning-buggy-adventure',
    title: 'Morning Dune Buggy Adventure',
    shortDescription: 'Start your day with an exhilarating dune buggy ride through the Sahara desert.',
    description: 'Beat the heat with an early morning dune buggy adventure. Drive a powerful Polaris buggy through challenging terrain, tackle steep dunes, and enjoy the crisp desert air. Perfect for adrenaline seekers who want to maximize their day.',
    category: 'adventure',
    subcategory: 'buggy',
    duration: '2 hours',
    priceFrom: 40,
    images: [
      'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/desert-fox-safari/morning-buggy.jpg',
    ],
    pricingOptions: [
      { id: 'single', name: 'Single Rider', description: 'Drive your own buggy', price: 40 },
      { id: 'passenger', name: 'Passenger Seat', description: 'Ride alongside driver', price: 25 },
    ],
    addons: [
      { id: 'breakfast', name: 'Bedouin Breakfast', description: 'Traditional flatbread and tea after the ride', price: 10 },
    ],
    entryWindows: [
      { label: 'Early Morning', startTime: '06:00', endTime: '06:30' },
      { label: 'Morning', startTime: '08:00', endTime: '08:30' },
    ],
    highlights: ['Drive a Polaris RZR buggy', 'Tackle real desert dunes', 'Cool morning temperatures', 'Small group (max 8 buggies)', 'Full safety briefing'],
    inclusions: ['Dune buggy with fuel', 'Helmet and goggles', 'Dust mask', 'Water', 'Hotel pickup & drop-off'],
    exclusions: ['Breakfast (available as add-on)', 'Gratuities'],
    itinerary: [
      { time: '06:00', duration: '20 min', title: 'Pickup & Briefing', description: 'Hotel collection and driving safety instructions.' },
      { time: '06:20', duration: '1 hr 20 min', title: 'Buggy Safari', description: 'Drive through dunes, valleys, and open desert.' },
      { time: '07:40', duration: '20 min', title: 'Return', description: 'Back at camp, transfer to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunscreen', 'Sunglasses'],
  },
  {
    slug: 'desert-fox-camel-trek-sunset',
    title: 'Camel Trek & Desert Sunset',
    shortDescription: 'A peaceful camel ride through the desert with tea at a Bedouin camp and a stunning sunset.',
    description: 'Slow down and experience the desert the traditional way — on camelback. This gentle trek takes you through golden dunes to a Bedouin camp where you will enjoy fresh tea, learn about desert culture, and witness a breathtaking sunset over the Red Sea mountains.',
    category: 'tours',
    subcategory: 'camel-ride',
    duration: '2.5 hours',
    priceFrom: 25,
    images: [
      'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/desert-fox-safari/camel-sunset.jpg',
    ],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Own camel', price: 25 },
      { id: 'child', name: 'Child (4-11)', description: 'Shares camel with adult', price: 15 },
    ],
    addons: [
      { id: 'henna', name: 'Henna Painting', description: 'Traditional hand henna design', price: 5 },
    ],
    entryWindows: [
      { label: 'Afternoon', startTime: '15:30', endTime: '16:00' },
    ],
    highlights: ['Peaceful camel ride through sand dunes', 'Authentic Bedouin tea ceremony', 'Unforgettable sunset views', 'Family-friendly — all ages welcome', 'Cultural insight into nomadic life'],
    inclusions: ['Camel ride', 'Bedouin tea', 'Hotel transfers', 'Guide'],
    exclusions: ['Gratuities', 'Personal purchases'],
    itinerary: [
      { time: '15:30', duration: '20 min', title: 'Pickup', description: 'Hotel pickup by jeep.' },
      { time: '15:50', duration: '45 min', title: 'Camel Trek', description: 'Ride through the dunes towards the Bedouin camp.' },
      { time: '16:35', duration: '30 min', title: 'Bedouin Camp', description: 'Tea, snacks, and cultural stories.' },
      { time: '17:05', duration: '30 min', title: 'Sunset', description: 'Watch the sun set from the dunes.' },
      { time: '17:35', duration: '25 min', title: 'Return', description: 'Camel ride back and hotel transfer.' },
    ],
    whatToBring: ['Comfortable trousers', 'Sun hat', 'Camera'],
  },
  {
    slug: 'desert-fox-stargazing-safari',
    title: 'Night Desert Stargazing Safari',
    shortDescription: 'Jeep into the dark desert for zero-light-pollution stargazing, telescope viewing, and Bedouin campfire.',
    description: 'Escape the city lights and discover the Milky Way like never before. Our night safari takes you deep into the Eastern Desert for a guided stargazing session with telescopes, followed by a cozy campfire with Bedouin stories, music, and hot drinks.',
    category: 'adventure',
    subcategory: 'stargazing',
    duration: '3 hours',
    priceFrom: 30,
    images: [
      'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/desert-fox-safari/stargazing.jpg',
    ],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Full stargazing experience', price: 30 },
      { id: 'child', name: 'Child (6-12)', description: 'Full experience', price: 20 },
    ],
    addons: [
      { id: 'dinner', name: 'BBQ Dinner', description: 'Add a traditional BBQ to the experience', price: 15 },
      { id: 'blanket', name: 'Desert Blanket', description: 'Take home a Bedouin-style woven blanket', price: 12 },
    ],
    entryWindows: [
      { label: 'Evening', startTime: '19:00', endTime: '19:30' },
    ],
    highlights: ['Zero light pollution — see the Milky Way', 'Telescope-guided constellation tour', 'Bedouin campfire with tea and stories', 'Jeep ride through night desert', 'Small group for intimate experience'],
    inclusions: ['4x4 jeep transfer', 'Telescope session', 'Hot drinks & snacks', 'Campfire', 'Hotel pickup & drop-off'],
    exclusions: ['Dinner (available as add-on)', 'Gratuities'],
    itinerary: [
      { time: '19:00', duration: '30 min', title: 'Pickup & Night Drive', description: 'Hotel pickup and exciting night jeep ride into the desert.' },
      { time: '19:30', duration: '1 hr', title: 'Stargazing', description: 'Guided telescope session — planets, constellations, Milky Way.' },
      { time: '20:30', duration: '45 min', title: 'Campfire', description: 'Bedouin tea, stories, and music around the fire.' },
      { time: '21:15', duration: '30 min', title: 'Return', description: 'Jeep ride back and hotel drop-off.' },
    ],
    whatToBring: ['Warm jacket (desert gets cold at night)', 'Blanket or scarf', 'Camera with night mode'],
  },
  {
    slug: 'desert-fox-private-jeep-safari',
    title: 'Private 4x4 Jeep Safari',
    shortDescription: 'Exclusive private jeep safari through canyons, wadis, and sand seas with your own guide.',
    description: 'Get the VIP desert treatment with a private 4x4 jeep safari. Your personal guide takes you off the beaten path through hidden canyons, dry river beds (wadis), and towering dune fields. Stop for photos, explore geological formations, and enjoy a private tea service in the wilderness.',
    category: 'adventure',
    subcategory: 'jeep-safari',
    duration: '4 hours',
    priceFrom: 65,
    images: [
      'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/desert-fox-safari/private-jeep.jpg',
    ],
    pricingOptions: [
      { id: 'vehicle', name: 'Private Jeep (up to 4)', description: 'Entire vehicle for your group', price: 65 },
    ],
    addons: [
      { id: 'lunch', name: 'Desert Picnic Lunch', description: 'Packed gourmet lunch enjoyed in the desert', price: 18 },
      { id: 'extra-hour', name: 'Extra Hour', description: 'Extend the safari by one hour', price: 20 },
    ],
    entryWindows: [
      { label: 'Morning', startTime: '08:00', endTime: '08:30' },
      { label: 'Afternoon', startTime: '14:00', endTime: '14:30' },
    ],
    highlights: ['Fully private — just your group', 'Off-road through hidden canyons and wadis', 'Flexible route and pace', 'Private tea service in the desert', 'Expert English-speaking guide'],
    inclusions: ['Private 4x4 jeep with driver/guide', 'Water and snacks', 'Private tea stop', 'Hotel pickup & drop-off'],
    exclusions: ['Lunch (available as add-on)', 'Gratuities'],
    itinerary: [
      { time: '08:00', duration: '30 min', title: 'Pickup', description: 'Private hotel pickup.' },
      { time: '08:30', duration: '1.5 hr', title: 'Canyon & Wadi Exploration', description: 'Navigate through canyons and dry river valleys.' },
      { time: '10:00', duration: '30 min', title: 'Desert Tea', description: 'Private tea break with panoramic views.' },
      { time: '10:30', duration: '1 hr', title: 'Sand Sea Drive', description: 'Thrilling dune driving through the open desert.' },
      { time: '11:30', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Sunscreen', 'Hat', 'Camera', 'Comfortable clothes'],
  },
  {
    slug: 'desert-fox-sandboarding-adventure',
    title: 'Sandboarding & Dune Trekking',
    shortDescription: 'Hike desert dunes and surf them on a sandboard — no experience needed.',
    description: 'Try the desert version of snowboarding! After a short jeep ride to the highest dunes near Hurghada, your guide teaches you sandboarding basics. Hike up, board down, and repeat. Great fun for all fitness levels with plenty of laughs guaranteed.',
    category: 'adventure',
    subcategory: 'sandboarding',
    duration: '2.5 hours',
    priceFrom: 30,
    images: [
      'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/desert-fox-safari/sandboarding.jpg',
    ],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'Sandboarding session', price: 30 },
      { id: 'child', name: 'Child (8-14)', description: 'Sandboarding with smaller board', price: 20 },
    ],
    addons: [
      { id: 'quad-combo', name: 'Add Quad Ride', description: '30-minute quad ride before sandboarding', price: 20 },
    ],
    entryWindows: [
      { label: 'Morning', startTime: '07:00', endTime: '07:30' },
      { label: 'Afternoon', startTime: '15:00', endTime: '15:30' },
    ],
    highlights: ['Learn to sandboard — no experience needed', 'Best dunes near Hurghada', 'Fun for families and groups', 'Refreshments included', 'All equipment provided'],
    inclusions: ['Sandboard', 'Jeep transfer to dunes', 'Water and soft drinks', 'Instructor', 'Hotel pickup & drop-off'],
    exclusions: ['Gratuities', 'Personal expenses'],
    itinerary: [
      { time: '07:00', duration: '20 min', title: 'Pickup & Transfer', description: 'Jeep ride to the best dune field.' },
      { time: '07:20', duration: '15 min', title: 'Lesson', description: 'Safety briefing and sandboarding basics.' },
      { time: '07:35', duration: '1.5 hr', title: 'Sandboarding', description: 'Hike and board the dunes at your own pace.' },
      { time: '09:05', duration: '25 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Closed shoes', 'Sunscreen', 'Sunglasses', 'Old clothes (sand gets everywhere!)'],
  },
  {
    slug: 'desert-fox-full-day-sahara-expedition',
    title: 'Full Day Sahara Expedition',
    shortDescription: 'A full-day desert expedition: jeep safari, camel riding, quad biking, sandboarding, and Bedouin feast.',
    description: 'Our most comprehensive desert adventure packs everything into one epic day. Drive deep into the Eastern Sahara by 4x4, ride camels across golden plains, quad bike over dunes, try sandboarding, visit a Bedouin village, and finish with a sunset BBQ feast. The ultimate desert day out.',
    category: 'adventure',
    subcategory: 'safari',
    duration: '8 hours',
    priceFrom: 85,
    images: [
      'https://res.cloudinary.com/dm3sxllch/image/upload/v1/attractions-network/tours/desert-fox-safari/full-day-expedition.jpg',
    ],
    pricingOptions: [
      { id: 'adult', name: 'Adult', description: 'All activities included', price: 85 },
      { id: 'child', name: 'Child (6-12)', description: 'Adapted activities', price: 55 },
    ],
    addons: [
      { id: 'private-upgrade', name: 'Private Vehicle Upgrade', description: 'Your own jeep instead of shared', price: 30 },
      { id: 'photo-pkg', name: 'Professional Photo Package', description: 'Guide takes photos all day, delivered digitally', price: 25 },
    ],
    entryWindows: [
      { label: 'Morning Start', startTime: '09:00', endTime: '09:30' },
    ],
    highlights: ['5 activities in 1 day', 'Deep Sahara exploration by 4x4', 'Camel ride, quad bike, and sandboarding all included', 'Bedouin village visit and cultural exchange', 'Full BBQ dinner with sunset and stargazing'],
    inclusions: ['4x4 jeep', 'Quad bike', 'Camel ride', 'Sandboard', 'Lunch and BBQ dinner', 'All drinks', 'Hotel transfers', 'English guide'],
    exclusions: ['Alcoholic beverages', 'Gratuities', 'Personal expenses'],
    itinerary: [
      { time: '09:00', duration: '30 min', title: 'Hotel Pickup', description: 'Comfortable jeep pickup from your hotel.' },
      { time: '09:30', duration: '1.5 hr', title: 'Jeep Safari', description: 'Deep desert drive through canyons and wadis.' },
      { time: '11:00', duration: '1 hr', title: 'Quad Biking', description: 'Adrenaline-pumping dune riding.' },
      { time: '12:00', duration: '1 hr', title: 'Sandboarding & Lunch', description: 'Sandboard the dunes, then enjoy a packed lunch.' },
      { time: '13:00', duration: '1 hr', title: 'Camel Trek', description: 'Peaceful ride across the desert plains.' },
      { time: '14:00', duration: '1.5 hr', title: 'Bedouin Village', description: 'Tea, henna, cultural activities, and rest.' },
      { time: '15:30', duration: '1 hr', title: 'Free Time & Sunset', description: 'Explore, photograph, or relax as the sun sets.' },
      { time: '16:30', duration: '1 hr', title: 'BBQ Feast', description: 'Traditional BBQ dinner under the stars.' },
      { time: '17:30', duration: '30 min', title: 'Return', description: 'Transfer back to hotel.' },
    ],
    whatToBring: ['Comfortable clothes', 'Warm layer for evening', 'Sunscreen & hat', 'Camera', 'Cash for tips and souvenirs'],
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
        console.log(`  SKIP  ${tour.slug} (already exists)`);
        skipped++;
        continue;
      }

      await Attraction.create({
        ...tour,
        destination: {
          city: 'Hurghada',
          country: 'Egypt',
          coordinates: { lat: 27.2579, lng: 33.8116 },
        },
        languages: ['English', 'Arabic', 'German'],
        rating: 4.5 + Math.round(Math.random() * 4) / 10,
        reviewCount: 10 + Math.floor(Math.random() * 40),
        currency: 'USD',
        meetingPoint: {
          address: 'Hotel lobby pickup, Hurghada',
          instructions: 'Our driver will meet you at your hotel lobby. Please be ready 10 minutes early.',
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
      console.log(`  ADD   ${tour.slug} — ${tour.title} ($${tour.priceFrom})`);
      created++;
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
