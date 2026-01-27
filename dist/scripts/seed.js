"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const models_1 = require("../models");
// Import mock data structures
const categories = [
    { slug: 'museums', name: 'Museums & Galleries', icon: 'Building2', description: 'Explore world-class museums and art galleries', sortOrder: 1 },
    { slug: 'theme-parks', name: 'Theme Parks', icon: 'Ferris-wheel', description: 'Experience thrilling rides and family entertainment', sortOrder: 2 },
    { slug: 'tours', name: 'City Tours', icon: 'Map', description: 'Discover cities with guided tours and experiences', sortOrder: 3 },
    { slug: 'shows', name: 'Shows & Events', icon: 'Ticket', description: 'Enjoy live shows, concerts, and special events', sortOrder: 4 },
    { slug: 'adventures', name: 'Adventures', icon: 'Mountain', description: 'Thrilling outdoor activities and extreme sports', sortOrder: 5 },
    { slug: 'food', name: 'Food & Drink', icon: 'Utensils', description: 'Culinary experiences and food tours', sortOrder: 6 },
    { slug: 'day-trips', name: 'Day Trips', icon: 'Compass', description: 'Full-day excursions to nearby destinations', sortOrder: 7 },
    { slug: 'landmarks', name: 'Landmarks', icon: 'Landmark', description: 'Visit iconic monuments and historical sites', sortOrder: 8 },
    { slug: 'water-activities', name: 'Water Activities', icon: 'Waves', description: 'Cruises, water sports, and aquatic adventures', sortOrder: 9 },
    { slug: 'transfers', name: 'Transfers', icon: 'Car', description: 'Airport transfers and transportation services', sortOrder: 10 },
];
const destinations = [
    {
        slug: 'dubai',
        name: 'Dubai',
        country: 'UAE',
        continent: 'Asia',
        description: 'Dubai is a city of superlatives - from the world\'s tallest building to the largest shopping mall.',
        shortDescription: 'City of superlatives with world-famous attractions',
        images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80'],
        heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
        highlights: ['Burj Khalifa', 'Desert Safari', 'Dubai Mall'],
        bestTimeToVisit: 'November to March',
        timezone: 'GMT+4',
        coordinates: { lat: 25.2048, lng: 55.2708 },
        tags: ['luxury', 'family-friendly', 'shopping', 'adventure'],
        sortOrder: 1,
    },
    {
        slug: 'paris',
        name: 'Paris',
        country: 'France',
        continent: 'Europe',
        description: 'Paris, the City of Light, captivates visitors with its iconic landmarks and romantic ambiance.',
        shortDescription: 'The City of Light awaits with iconic landmarks',
        images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80'],
        heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
        highlights: ['Eiffel Tower', 'Louvre Museum', 'Versailles'],
        bestTimeToVisit: 'April to June, September to October',
        timezone: 'GMT+1',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        tags: ['romantic', 'culture', 'art', 'food'],
        sortOrder: 2,
    },
    {
        slug: 'london',
        name: 'London',
        country: 'United Kingdom',
        continent: 'Europe',
        description: 'London is a world unto itself - a vibrant mix of history and modernity.',
        shortDescription: 'Where history meets modern innovation',
        images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80'],
        heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80',
        highlights: ['London Eye', 'Tower of London', 'British Museum'],
        bestTimeToVisit: 'May to September',
        timezone: 'GMT+0',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        tags: ['history', 'culture', 'theatre', 'museums'],
        sortOrder: 3,
    },
    {
        slug: 'new-york',
        name: 'New York',
        country: 'USA',
        continent: 'North America',
        description: 'The city that never sleeps offers an endless array of experiences.',
        shortDescription: 'The city that never sleeps',
        images: ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80'],
        heroImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80',
        highlights: ['Statue of Liberty', 'Empire State Building', 'Central Park'],
        bestTimeToVisit: 'April to June, September to November',
        timezone: 'GMT-5',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        tags: ['iconic', 'entertainment', 'shopping', 'food'],
        sortOrder: 4,
    },
];
const attractions = [
    {
        slug: 'burj-khalifa-at-the-top',
        title: 'Burj Khalifa: At The Top Observation Deck',
        shortDescription: 'Experience breathtaking 360-degree views from the world\'s tallest building',
        description: 'Ascend to the observation deck of the iconic Burj Khalifa and witness Dubai from 555 meters above ground.',
        images: [
            'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
            'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=1200&q=80',
        ],
        category: 'landmarks',
        subcategory: 'observation-decks',
        destination: { city: 'Dubai', country: 'UAE', coordinates: { lat: 25.1972, lng: 55.2744 } },
        duration: '1-2 hours',
        languages: ['English', 'Arabic', 'French', 'German'],
        rating: 4.8,
        reviewCount: 12453,
        priceFrom: 149,
        currency: 'AED',
        pricingOptions: [
            { id: 'opt_1', name: 'Level 124 & 125', description: 'Access to observation decks', price: 149 },
            { id: 'opt_2', name: 'Level 148 (At The Top SKY)', description: 'Premium summit access', price: 399 },
        ],
        highlights: ['360-degree views', 'Interactive displays', 'High-speed elevator'],
        inclusions: ['Observatory access', 'Multimedia presentation'],
        exclusions: ['Hotel pickup', 'Food and beverages'],
        meetingPoint: { address: '1 Sheikh Mohammed bin Rashid Blvd', instructions: 'Enter through Dubai Mall', mapUrl: 'https://maps.google.com' },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'skip-line', 'instant-confirm'],
        availability: { type: 'time-slots', advanceBooking: 90 },
        seo: { metaTitle: 'Burj Khalifa Tickets', metaDescription: 'Book Burj Khalifa tickets' },
        status: 'active',
        featured: true,
        sortOrder: 1,
    },
    {
        slug: 'dubai-desert-safari-dune-bashing',
        title: 'Dubai Desert Safari with BBQ Dinner',
        shortDescription: 'Thrilling dune bashing, camel riding, and traditional Bedouin experience',
        description: 'Experience the magic of the Arabian desert with an exciting safari adventure.',
        images: [
            'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=1200&q=80',
        ],
        category: 'adventures',
        subcategory: 'desert-experiences',
        destination: { city: 'Dubai', country: 'UAE', coordinates: { lat: 25.2048, lng: 55.2708 } },
        duration: '6 hours',
        languages: ['English', 'Arabic'],
        rating: 4.7,
        reviewCount: 8932,
        priceFrom: 179,
        currency: 'AED',
        pricingOptions: [
            { id: 'opt_1', name: 'Standard Safari', description: 'Includes dune bashing and dinner', price: 179 },
            { id: 'opt_2', name: 'VIP Safari', description: 'Private vehicle and premium seating', price: 499 },
        ],
        highlights: ['Dune bashing', 'Camel riding', 'BBQ dinner', 'Live entertainment'],
        inclusions: ['Hotel pickup', 'Dune bashing', 'Dinner', 'Shows'],
        exclusions: ['Quad biking', 'Alcoholic beverages'],
        meetingPoint: { address: 'Hotel pickup', instructions: 'Pickup between 3-3:30 PM', mapUrl: 'https://maps.google.com' },
        cancellationPolicy: 'Free cancellation up to 48 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'free-cancellation'],
        availability: { type: 'date-only', advanceBooking: 60 },
        seo: { metaTitle: 'Dubai Desert Safari', metaDescription: 'Book desert safari' },
        status: 'active',
        featured: true,
        sortOrder: 2,
    },
    {
        slug: 'eiffel-tower-summit-access',
        title: 'Eiffel Tower Summit Access with Host',
        shortDescription: 'Skip-the-line access to all three levels including the summit',
        description: 'Ascend the iconic Eiffel Tower with priority access and a host.',
        images: [
            'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&q=80',
        ],
        category: 'landmarks',
        subcategory: 'observation-decks',
        destination: { city: 'Paris', country: 'France', coordinates: { lat: 48.8584, lng: 2.2945 } },
        duration: '2-3 hours',
        languages: ['English', 'French', 'Spanish'],
        rating: 4.9,
        reviewCount: 15782,
        priceFrom: 84,
        currency: 'EUR',
        pricingOptions: [
            { id: 'opt_1', name: '2nd Floor Access', description: 'Elevator to 2nd floor', price: 44 },
            { id: 'opt_2', name: 'Summit Access', description: 'All levels including summit', price: 84 },
        ],
        highlights: ['Skip-the-line', 'Summit access', 'Panoramic views'],
        inclusions: ['Skip-the-line tickets', 'Host assistance'],
        exclusions: ['Hotel pickup', 'Food and drinks'],
        meetingPoint: { address: 'Champ de Mars', instructions: 'Meet at East Pillar', mapUrl: 'https://maps.google.com' },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'skip-line', 'instant-confirm'],
        availability: { type: 'time-slots', advanceBooking: 90 },
        seo: { metaTitle: 'Eiffel Tower Tickets', metaDescription: 'Book Eiffel Tower tickets' },
        status: 'active',
        featured: true,
        sortOrder: 1,
    },
    {
        slug: 'louvre-museum-skip-the-line',
        title: 'Louvre Museum Skip-the-Line Ticket',
        shortDescription: 'Fast-track entry to the world\'s largest art museum',
        description: 'Explore the magnificent Louvre Museum at your own pace with skip-the-line access.',
        images: [
            'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
        ],
        category: 'museums',
        subcategory: 'art-museums',
        destination: { city: 'Paris', country: 'France', coordinates: { lat: 48.8606, lng: 2.3376 } },
        duration: '3-4 hours',
        languages: ['English', 'French', 'Spanish', 'German'],
        rating: 4.7,
        reviewCount: 9834,
        priceFrom: 22,
        currency: 'EUR',
        pricingOptions: [
            { id: 'opt_1', name: 'Skip-the-Line Entry', description: 'Timed entry ticket', price: 22 },
            { id: 'opt_2', name: 'Entry + Audio Guide', description: 'Entry with audio guide', price: 35 },
        ],
        highlights: ['Skip the queue', 'See Mona Lisa', '35,000+ artworks'],
        inclusions: ['Skip-the-line entrance', 'Permanent collections access'],
        exclusions: ['Guided tour', 'Temporary exhibitions'],
        meetingPoint: { address: 'Rue de Rivoli', instructions: 'Enter through Pyramid', mapUrl: 'https://maps.google.com' },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'skip-line', 'free-cancellation'],
        availability: { type: 'time-slots', advanceBooking: 60 },
        seo: { metaTitle: 'Louvre Museum Tickets', metaDescription: 'Book Louvre tickets' },
        status: 'active',
        featured: true,
        sortOrder: 2,
    },
    {
        slug: 'london-eye-fast-track',
        title: 'London Eye Fast Track Experience',
        shortDescription: 'Iconic observation wheel with panoramic views of London',
        description: 'Soar 135 meters above London on the iconic London Eye.',
        images: [
            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
        ],
        category: 'landmarks',
        subcategory: 'observation-decks',
        destination: { city: 'London', country: 'United Kingdom', coordinates: { lat: 51.5033, lng: -0.1195 } },
        duration: '30 minutes',
        languages: ['English'],
        rating: 4.6,
        reviewCount: 11234,
        priceFrom: 36,
        currency: 'GBP',
        pricingOptions: [
            { id: 'opt_1', name: 'Standard Entry', description: 'Standard timed entry', price: 36 },
            { id: 'opt_2', name: 'Fast Track', description: 'Skip most of the queue', price: 49 },
        ],
        highlights: ['360-degree views', 'See Big Ben', 'Climate-controlled capsules'],
        inclusions: ['London Eye entry', '30-minute rotation'],
        exclusions: ['Hotel pickup', 'Photo package'],
        meetingPoint: { address: 'Riverside Building, County Hall', instructions: 'Main entrance', mapUrl: 'https://maps.google.com' },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'instant-confirm'],
        availability: { type: 'time-slots', advanceBooking: 90 },
        seo: { metaTitle: 'London Eye Tickets', metaDescription: 'Book London Eye tickets' },
        status: 'active',
        featured: true,
        sortOrder: 1,
    },
    {
        slug: 'statue-of-liberty-ellis-island',
        title: 'Statue of Liberty & Ellis Island Tour',
        shortDescription: 'Visit America\'s iconic symbol of freedom',
        description: 'Take a ferry to Liberty Island and Ellis Island to explore iconic landmarks.',
        images: [
            'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80',
        ],
        category: 'landmarks',
        subcategory: 'monuments',
        destination: { city: 'New York', country: 'USA', coordinates: { lat: 40.6892, lng: -74.0445 } },
        duration: '4-5 hours',
        languages: ['English', 'Spanish'],
        rating: 4.8,
        reviewCount: 14562,
        priceFrom: 29,
        currency: 'USD',
        pricingOptions: [
            { id: 'opt_1', name: 'Ferry & Grounds', description: 'Ferry to both islands', price: 29 },
            { id: 'opt_2', name: 'Pedestal Reserve', description: 'Includes pedestal access', price: 29 },
        ],
        highlights: ['Ferry ride', 'See Lady Liberty', 'Ellis Island Museum'],
        inclusions: ['Round-trip ferry', 'Island access', 'Audio guide'],
        exclusions: ['Hotel pickup', 'Crown access'],
        meetingPoint: { address: 'Battery Park', instructions: 'Castle Clinton', mapUrl: 'https://maps.google.com' },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        instantConfirmation: true,
        mobileTicket: true,
        badges: ['bestseller', 'free-cancellation'],
        availability: { type: 'time-slots', advanceBooking: 90 },
        seo: { metaTitle: 'Statue of Liberty Tickets', metaDescription: 'Book Statue of Liberty tickets' },
        status: 'active',
        featured: true,
        sortOrder: 1,
    },
];
const tenants = [
    {
        slug: 'dubai-attractions',
        name: 'Dubai Attractions',
        domain: 'dubai-attractions.foxesnetwork.com',
        logo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&h=60&fit=crop',
        tagline: 'Discover the Magic of Dubai',
        description: 'Your gateway to the best attractions in Dubai',
        theme: { primaryColor: '#0066FF', secondaryColor: '#00D4AA', accentColor: '#FF6B35' },
        defaultCurrency: 'AED',
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'ar'],
        timezone: 'Asia/Dubai',
        aiSettings: {
            bookingWidget: { enabled: true, position: 'bottom-right', languages: ['en', 'ar'], autoOpen: false },
            voiceAgent: { enabled: true, languages: ['en', 'ar'], buttonPosition: 'bottom-right' },
            searchWidget: { enabled: true, showPopularSearches: true, maxSuggestions: 8 },
        },
        status: 'active',
    },
    {
        slug: 'paris-experiences',
        name: 'Paris Experiences',
        domain: 'paris-experiences.foxesnetwork.com',
        logo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&h=60&fit=crop',
        tagline: "L'amour de Paris",
        description: 'Experience the magic of Paris',
        theme: { primaryColor: '#1E3A8A', secondaryColor: '#DC2626', accentColor: '#F59E0B' },
        defaultCurrency: 'EUR',
        defaultLanguage: 'fr',
        supportedLanguages: ['fr', 'en'],
        timezone: 'Europe/Paris',
        aiSettings: {
            bookingWidget: { enabled: true, position: 'bottom-right', languages: ['fr', 'en'], autoOpen: false },
            voiceAgent: { enabled: false, languages: ['fr', 'en'], buttonPosition: 'bottom-right' },
            searchWidget: { enabled: true, showPopularSearches: true, maxSuggestions: 6 },
        },
        status: 'active',
    },
];
const users = [
    {
        email: 'admin@attractions-network.com',
        password: 'Admin@123456',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super-admin',
        status: 'active',
    },
    {
        email: 'customer@example.com',
        password: 'Customer@123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        status: 'active',
        country: 'United States',
    },
];
const seed = async () => {
    try {
        console.log('🌱 Starting database seed...\n');
        await (0, config_1.connectDatabase)();
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            models_1.User.deleteMany({}),
            models_1.Tenant.deleteMany({}),
            models_1.Attraction.deleteMany({}),
            models_1.Category.deleteMany({}),
            models_1.Destination.deleteMany({}),
            models_1.Review.deleteMany({}),
            models_1.Booking.deleteMany({}),
        ]);
        // Seed categories
        console.log('📁 Seeding categories...');
        await models_1.Category.insertMany(categories);
        console.log(`   ✅ ${categories.length} categories created`);
        // Seed destinations
        console.log('🌍 Seeding destinations...');
        await models_1.Destination.insertMany(destinations);
        console.log(`   ✅ ${destinations.length} destinations created`);
        // Seed tenants
        console.log('🏢 Seeding tenants...');
        const createdTenants = await models_1.Tenant.insertMany(tenants);
        console.log(`   ✅ ${tenants.length} tenants created`);
        // Seed attractions
        console.log('🎢 Seeding attractions...');
        const attractionsWithTenants = attractions.map((a) => ({
            ...a,
            tenantIds: createdTenants.map((t) => t._id),
        }));
        await models_1.Attraction.insertMany(attractionsWithTenants);
        console.log(`   ✅ ${attractions.length} attractions created`);
        // Seed users (password will be hashed by pre-save hook)
        console.log('👥 Seeding users...');
        for (const userData of users) {
            await models_1.User.create({
                ...userData,
                assignedTenants: userData.role === 'super-admin' ? createdTenants.map((t) => t._id) : [],
            });
        }
        console.log(`   ✅ ${users.length} users created`);
        console.log('\n✅ Database seeded successfully!\n');
        console.log('📝 Test accounts:');
        console.log('   Admin: admin@attractions-network.com / Admin@123456');
        console.log('   Customer: customer@example.com / Customer@123');
        await (0, config_1.disconnectDatabase)();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};
seed();
//# sourceMappingURL=seed.js.map