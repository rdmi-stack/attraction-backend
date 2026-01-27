"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntentSchema = exports.attractionFiltersSchema = exports.paginationSchema = exports.updateTenantSchema = exports.createTenantSchema = exports.updateDestinationSchema = exports.createDestinationSchema = exports.updateCategorySchema = exports.createCategorySchema = exports.createBookingSchema = exports.updateAttractionSchema = exports.createAttractionSchema = exports.updateProfileSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth Validators
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    phone: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
    rememberMe: zod_1.z.boolean().optional(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters'),
});
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    avatar: zod_1.z.string().url().optional(),
    language: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
});
// Attraction Validators
exports.createAttractionSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1, 'Slug is required'),
    title: zod_1.z.string().min(1, 'Title is required'),
    shortDescription: zod_1.z.string().min(1, 'Short description is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    images: zod_1.z.array(zod_1.z.string().url()).min(1, 'At least one image is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    subcategory: zod_1.z.string().min(1, 'Subcategory is required'),
    destination: zod_1.z.object({
        city: zod_1.z.string().min(1),
        country: zod_1.z.string().min(1),
        coordinates: zod_1.z.object({
            lat: zod_1.z.number(),
            lng: zod_1.z.number(),
        }),
    }),
    duration: zod_1.z.string().min(1),
    languages: zod_1.z.array(zod_1.z.string()).min(1),
    priceFrom: zod_1.z.number().positive(),
    currency: zod_1.z.string().min(1),
    pricingOptions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        price: zod_1.z.number().positive(),
        originalPrice: zod_1.z.number().positive().optional(),
    })).min(1),
    highlights: zod_1.z.array(zod_1.z.string()),
    inclusions: zod_1.z.array(zod_1.z.string()),
    exclusions: zod_1.z.array(zod_1.z.string()),
    meetingPoint: zod_1.z.object({
        address: zod_1.z.string(),
        instructions: zod_1.z.string(),
        mapUrl: zod_1.z.string(),
    }),
    cancellationPolicy: zod_1.z.string(),
    instantConfirmation: zod_1.z.boolean(),
    mobileTicket: zod_1.z.boolean(),
    badges: zod_1.z.array(zod_1.z.enum(['bestseller', 'free-cancellation', 'skip-line', 'instant-confirm'])),
    availability: zod_1.z.object({
        type: zod_1.z.enum(['time-slots', 'date-only', 'flexible']),
        advanceBooking: zod_1.z.number().int().positive(),
    }),
    seo: zod_1.z.object({
        metaTitle: zod_1.z.string(),
        metaDescription: zod_1.z.string(),
        keywords: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    status: zod_1.z.enum(['active', 'draft', 'archived']).optional(),
    featured: zod_1.z.boolean().optional(),
});
exports.updateAttractionSchema = exports.createAttractionSchema.partial();
// Booking Validators
exports.createBookingSchema = zod_1.z.object({
    attractionId: zod_1.z.string().min(1, 'Attraction ID is required'),
    items: zod_1.z.array(zod_1.z.object({
        optionId: zod_1.z.string(),
        optionName: zod_1.z.string(),
        date: zod_1.z.string(),
        time: zod_1.z.string().optional(),
        quantities: zod_1.z.object({
            adults: zod_1.z.number().int().min(0),
            children: zod_1.z.number().int().min(0),
            infants: zod_1.z.number().int().min(0),
        }),
        unitPrice: zod_1.z.number().positive(),
        totalPrice: zod_1.z.number().positive(),
    })).min(1),
    guestDetails: zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(1),
        country: zod_1.z.string().min(1),
        specialRequests: zod_1.z.string().optional(),
    }),
    promoCode: zod_1.z.string().optional(),
});
// Category Validators
exports.createCategorySchema = zod_1.z.object({
    slug: zod_1.z.string().min(1, 'Slug is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    icon: zod_1.z.string().min(1, 'Icon is required'),
    description: zod_1.z.string().optional(),
    parentId: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number().int().optional(),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
// Destination Validators
exports.createDestinationSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1, 'Slug is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    country: zod_1.z.string().min(1, 'Country is required'),
    continent: zod_1.z.string().min(1, 'Continent is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    shortDescription: zod_1.z.string().min(1, 'Short description is required'),
    images: zod_1.z.array(zod_1.z.string().url()).min(1),
    heroImage: zod_1.z.string().url(),
    highlights: zod_1.z.array(zod_1.z.string()),
    bestTimeToVisit: zod_1.z.string(),
    timezone: zod_1.z.string(),
    language: zod_1.z.string(),
    coordinates: zod_1.z.object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
    }),
    tags: zod_1.z.array(zod_1.z.string()),
});
exports.updateDestinationSchema = exports.createDestinationSchema.partial();
// Tenant Validators
exports.createTenantSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1, 'Slug is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    domain: zod_1.z.string().min(1, 'Domain is required'),
    logo: zod_1.z.string().url(),
    theme: zod_1.z.object({
        primaryColor: zod_1.z.string(),
        secondaryColor: zod_1.z.string(),
        accentColor: zod_1.z.string(),
    }),
    defaultCurrency: zod_1.z.string().min(1),
    defaultLanguage: zod_1.z.string().min(1),
    supportedLanguages: zod_1.z.array(zod_1.z.string()),
});
exports.updateTenantSchema = exports.createTenantSchema.partial();
// Query Validators
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    sort: zod_1.z.string().optional(),
});
exports.attractionFiltersSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    destination: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    rating: zod_1.z.coerce.number().optional(),
    badges: zod_1.z.string().optional(), // comma-separated
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'draft', 'archived']).optional(),
});
// Payment Validators
exports.createPaymentIntentSchema = zod_1.z.object({
    bookingId: zod_1.z.string().min(1, 'Booking ID is required'),
});
//# sourceMappingURL=validators.js.map