import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    country?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    country?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
}, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    avatar?: string | undefined;
    phone?: string | undefined;
    country?: string | undefined;
    language?: string | undefined;
    currency?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    avatar?: string | undefined;
    phone?: string | undefined;
    country?: string | undefined;
    language?: string | undefined;
    currency?: string | undefined;
}>;
export declare const createAttractionSchema: z.ZodObject<{
    slug: z.ZodString;
    title: z.ZodString;
    shortDescription: z.ZodString;
    description: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    category: z.ZodString;
    subcategory: z.ZodString;
    destination: z.ZodObject<{
        city: z.ZodString;
        country: z.ZodString;
        coordinates: z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    }, {
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    }>;
    duration: z.ZodString;
    languages: z.ZodArray<z.ZodString, "many">;
    priceFrom: z.ZodNumber;
    currency: z.ZodString;
    pricingOptions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        price: z.ZodNumber;
        originalPrice: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        description: string;
        price: number;
        originalPrice?: number | undefined;
    }, {
        name: string;
        id: string;
        description: string;
        price: number;
        originalPrice?: number | undefined;
    }>, "many">;
    highlights: z.ZodArray<z.ZodString, "many">;
    inclusions: z.ZodArray<z.ZodString, "many">;
    exclusions: z.ZodArray<z.ZodString, "many">;
    meetingPoint: z.ZodObject<{
        address: z.ZodString;
        instructions: z.ZodString;
        mapUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        address: string;
        instructions: string;
        mapUrl: string;
    }, {
        address: string;
        instructions: string;
        mapUrl: string;
    }>;
    cancellationPolicy: z.ZodString;
    instantConfirmation: z.ZodBoolean;
    mobileTicket: z.ZodBoolean;
    badges: z.ZodArray<z.ZodEnum<["bestseller", "free-cancellation", "skip-line", "instant-confirm"]>, "many">;
    availability: z.ZodObject<{
        type: z.ZodEnum<["time-slots", "date-only", "flexible"]>;
        advanceBooking: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "time-slots" | "date-only" | "flexible";
        advanceBooking: number;
    }, {
        type: "time-slots" | "date-only" | "flexible";
        advanceBooking: number;
    }>;
    seo: z.ZodObject<{
        metaTitle: z.ZodString;
        metaDescription: z.ZodString;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        metaTitle: string;
        metaDescription: string;
        keywords?: string[] | undefined;
    }, {
        metaTitle: string;
        metaDescription: string;
        keywords?: string[] | undefined;
    }>;
    status: z.ZodOptional<z.ZodEnum<["active", "draft", "archived"]>>;
    featured: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    description: string;
    slug: string;
    title: string;
    shortDescription: string;
    images: string[];
    category: string;
    subcategory: string;
    destination: {
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    duration: string;
    languages: string[];
    priceFrom: number;
    pricingOptions: {
        name: string;
        id: string;
        description: string;
        price: number;
        originalPrice?: number | undefined;
    }[];
    highlights: string[];
    inclusions: string[];
    exclusions: string[];
    meetingPoint: {
        address: string;
        instructions: string;
        mapUrl: string;
    };
    cancellationPolicy: string;
    instantConfirmation: boolean;
    mobileTicket: boolean;
    badges: ("bestseller" | "skip-line" | "free-cancellation" | "instant-confirm")[];
    availability: {
        type: "time-slots" | "date-only" | "flexible";
        advanceBooking: number;
    };
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords?: string[] | undefined;
    };
    status?: "active" | "draft" | "archived" | undefined;
    featured?: boolean | undefined;
}, {
    currency: string;
    description: string;
    slug: string;
    title: string;
    shortDescription: string;
    images: string[];
    category: string;
    subcategory: string;
    destination: {
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    duration: string;
    languages: string[];
    priceFrom: number;
    pricingOptions: {
        name: string;
        id: string;
        description: string;
        price: number;
        originalPrice?: number | undefined;
    }[];
    highlights: string[];
    inclusions: string[];
    exclusions: string[];
    meetingPoint: {
        address: string;
        instructions: string;
        mapUrl: string;
    };
    cancellationPolicy: string;
    instantConfirmation: boolean;
    mobileTicket: boolean;
    badges: ("bestseller" | "skip-line" | "free-cancellation" | "instant-confirm")[];
    availability: {
        type: "time-slots" | "date-only" | "flexible";
        advanceBooking: number;
    };
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords?: string[] | undefined;
    };
    status?: "active" | "draft" | "archived" | undefined;
    featured?: boolean | undefined;
}>;
export declare const updateAttractionSchema: z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    subcategory: z.ZodOptional<z.ZodString>;
    destination: z.ZodOptional<z.ZodObject<{
        city: z.ZodString;
        country: z.ZodString;
        coordinates: z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    }, {
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    }>>;
    duration: z.ZodOptional<z.ZodString>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    priceFrom: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    pricingOptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        price: z.ZodNumber;
        originalPrice: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        description: string;
        price: number;
        originalPrice?: number | undefined;
    }, {
        name: string;
        id: string;
        description: string;
        price: number;
        originalPrice?: number | undefined;
    }>, "many">>;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    inclusions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    exclusions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    meetingPoint: z.ZodOptional<z.ZodObject<{
        address: z.ZodString;
        instructions: z.ZodString;
        mapUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        address: string;
        instructions: string;
        mapUrl: string;
    }, {
        address: string;
        instructions: string;
        mapUrl: string;
    }>>;
    cancellationPolicy: z.ZodOptional<z.ZodString>;
    instantConfirmation: z.ZodOptional<z.ZodBoolean>;
    mobileTicket: z.ZodOptional<z.ZodBoolean>;
    badges: z.ZodOptional<z.ZodArray<z.ZodEnum<["bestseller", "free-cancellation", "skip-line", "instant-confirm"]>, "many">>;
    availability: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["time-slots", "date-only", "flexible"]>;
        advanceBooking: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "time-slots" | "date-only" | "flexible";
        advanceBooking: number;
    }, {
        type: "time-slots" | "date-only" | "flexible";
        advanceBooking: number;
    }>>;
    seo: z.ZodOptional<z.ZodObject<{
        metaTitle: z.ZodString;
        metaDescription: z.ZodString;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        metaTitle: string;
        metaDescription: string;
        keywords?: string[] | undefined;
    }, {
        metaTitle: string;
        metaDescription: string;
        keywords?: string[] | undefined;
    }>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["active", "draft", "archived"]>>>;
    featured: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "draft" | "archived" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    title?: string | undefined;
    shortDescription?: string | undefined;
    images?: string[] | undefined;
    category?: string | undefined;
    subcategory?: string | undefined;
    destination?: {
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    } | undefined;
    duration?: string | undefined;
    languages?: string[] | undefined;
    priceFrom?: number | undefined;
    pricingOptions?: {
        name: string;
        id: string;
        description: string;
        price: number;
        originalPrice?: number | undefined;
    }[] | undefined;
    highlights?: string[] | undefined;
    inclusions?: string[] | undefined;
    exclusions?: string[] | undefined;
    meetingPoint?: {
        address: string;
        instructions: string;
        mapUrl: string;
    } | undefined;
    cancellationPolicy?: string | undefined;
    instantConfirmation?: boolean | undefined;
    mobileTicket?: boolean | undefined;
    badges?: ("bestseller" | "skip-line" | "free-cancellation" | "instant-confirm")[] | undefined;
    availability?: {
        type: "time-slots" | "date-only" | "flexible";
        advanceBooking: number;
    } | undefined;
    seo?: {
        metaTitle: string;
        metaDescription: string;
        keywords?: string[] | undefined;
    } | undefined;
    featured?: boolean | undefined;
}, {
    status?: "active" | "draft" | "archived" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    title?: string | undefined;
    shortDescription?: string | undefined;
    images?: string[] | undefined;
    category?: string | undefined;
    subcategory?: string | undefined;
    destination?: {
        country: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    } | undefined;
    duration?: string | undefined;
    languages?: string[] | undefined;
    priceFrom?: number | undefined;
    pricingOptions?: {
        name: string;
        id: string;
        description: string;
        price: number;
        originalPrice?: number | undefined;
    }[] | undefined;
    highlights?: string[] | undefined;
    inclusions?: string[] | undefined;
    exclusions?: string[] | undefined;
    meetingPoint?: {
        address: string;
        instructions: string;
        mapUrl: string;
    } | undefined;
    cancellationPolicy?: string | undefined;
    instantConfirmation?: boolean | undefined;
    mobileTicket?: boolean | undefined;
    badges?: ("bestseller" | "skip-line" | "free-cancellation" | "instant-confirm")[] | undefined;
    availability?: {
        type: "time-slots" | "date-only" | "flexible";
        advanceBooking: number;
    } | undefined;
    seo?: {
        metaTitle: string;
        metaDescription: string;
        keywords?: string[] | undefined;
    } | undefined;
    featured?: boolean | undefined;
}>;
export declare const createBookingSchema: z.ZodObject<{
    attractionId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        optionId: z.ZodString;
        optionName: z.ZodString;
        date: z.ZodString;
        time: z.ZodOptional<z.ZodString>;
        quantities: z.ZodObject<{
            adults: z.ZodNumber;
            children: z.ZodNumber;
            infants: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            adults: number;
            children: number;
            infants: number;
        }, {
            adults: number;
            children: number;
            infants: number;
        }>;
        unitPrice: z.ZodNumber;
        totalPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        optionId: string;
        optionName: string;
        quantities: {
            adults: number;
            children: number;
            infants: number;
        };
        unitPrice: number;
        totalPrice: number;
        time?: string | undefined;
    }, {
        date: string;
        optionId: string;
        optionName: string;
        quantities: {
            adults: number;
            children: number;
            infants: number;
        };
        unitPrice: number;
        totalPrice: number;
        time?: string | undefined;
    }>, "many">;
    guestDetails: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        country: z.ZodString;
        specialRequests: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        country: string;
        specialRequests?: string | undefined;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        country: string;
        specialRequests?: string | undefined;
    }>;
    promoCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    attractionId: string;
    items: {
        date: string;
        optionId: string;
        optionName: string;
        quantities: {
            adults: number;
            children: number;
            infants: number;
        };
        unitPrice: number;
        totalPrice: number;
        time?: string | undefined;
    }[];
    guestDetails: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        country: string;
        specialRequests?: string | undefined;
    };
    promoCode?: string | undefined;
}, {
    attractionId: string;
    items: {
        date: string;
        optionId: string;
        optionName: string;
        quantities: {
            adults: number;
            children: number;
            infants: number;
        };
        unitPrice: number;
        totalPrice: number;
        time?: string | undefined;
    }[];
    guestDetails: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        country: string;
        specialRequests?: string | undefined;
    };
    promoCode?: string | undefined;
}>;
export declare const createCategorySchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    icon: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    icon: string;
    description?: string | undefined;
    parentId?: string | undefined;
    sortOrder?: number | undefined;
}, {
    name: string;
    slug: string;
    icon: string;
    description?: string | undefined;
    parentId?: string | undefined;
    sortOrder?: number | undefined;
}>;
export declare const updateCategorySchema: z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    icon?: string | undefined;
    parentId?: string | undefined;
    sortOrder?: number | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    icon?: string | undefined;
    parentId?: string | undefined;
    sortOrder?: number | undefined;
}>;
export declare const createDestinationSchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    country: z.ZodString;
    continent: z.ZodString;
    description: z.ZodString;
    shortDescription: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    heroImage: z.ZodString;
    highlights: z.ZodArray<z.ZodString, "many">;
    bestTimeToVisit: z.ZodString;
    timezone: z.ZodString;
    language: z.ZodString;
    coordinates: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    country: string;
    language: string;
    description: string;
    slug: string;
    shortDescription: string;
    images: string[];
    coordinates: {
        lat: number;
        lng: number;
    };
    highlights: string[];
    continent: string;
    heroImage: string;
    bestTimeToVisit: string;
    timezone: string;
    tags: string[];
}, {
    name: string;
    country: string;
    language: string;
    description: string;
    slug: string;
    shortDescription: string;
    images: string[];
    coordinates: {
        lat: number;
        lng: number;
    };
    highlights: string[];
    continent: string;
    heroImage: string;
    bestTimeToVisit: string;
    timezone: string;
    tags: string[];
}>;
export declare const updateDestinationSchema: z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    continent: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    heroImage: z.ZodOptional<z.ZodString>;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bestTimeToVisit: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    coordinates: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    country?: string | undefined;
    language?: string | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    shortDescription?: string | undefined;
    images?: string[] | undefined;
    coordinates?: {
        lat: number;
        lng: number;
    } | undefined;
    highlights?: string[] | undefined;
    continent?: string | undefined;
    heroImage?: string | undefined;
    bestTimeToVisit?: string | undefined;
    timezone?: string | undefined;
    tags?: string[] | undefined;
}, {
    name?: string | undefined;
    country?: string | undefined;
    language?: string | undefined;
    description?: string | undefined;
    slug?: string | undefined;
    shortDescription?: string | undefined;
    images?: string[] | undefined;
    coordinates?: {
        lat: number;
        lng: number;
    } | undefined;
    highlights?: string[] | undefined;
    continent?: string | undefined;
    heroImage?: string | undefined;
    bestTimeToVisit?: string | undefined;
    timezone?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const createTenantSchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    domain: z.ZodString;
    logo: z.ZodString;
    theme: z.ZodObject<{
        primaryColor: z.ZodString;
        secondaryColor: z.ZodString;
        accentColor: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    }, {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    }>;
    defaultCurrency: z.ZodString;
    defaultLanguage: z.ZodString;
    supportedLanguages: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    domain: string;
    logo: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    };
    defaultCurrency: string;
    defaultLanguage: string;
    supportedLanguages: string[];
}, {
    name: string;
    slug: string;
    domain: string;
    logo: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    };
    defaultCurrency: string;
    defaultLanguage: string;
    supportedLanguages: string[];
}>;
export declare const updateTenantSchema: z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    domain: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodString;
        secondaryColor: z.ZodString;
        accentColor: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    }, {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    }>>;
    defaultCurrency: z.ZodOptional<z.ZodString>;
    defaultLanguage: z.ZodOptional<z.ZodString>;
    supportedLanguages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    slug?: string | undefined;
    domain?: string | undefined;
    logo?: string | undefined;
    theme?: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    } | undefined;
    defaultCurrency?: string | undefined;
    defaultLanguage?: string | undefined;
    supportedLanguages?: string[] | undefined;
}, {
    name?: string | undefined;
    slug?: string | undefined;
    domain?: string | undefined;
    logo?: string | undefined;
    theme?: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    } | undefined;
    defaultCurrency?: string | undefined;
    defaultLanguage?: string | undefined;
    supportedLanguages?: string[] | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sort?: string | undefined;
}, {
    sort?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const attractionFiltersSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    destination: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    rating: z.ZodOptional<z.ZodNumber>;
    badges: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "draft", "archived"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "draft" | "archived" | undefined;
    search?: string | undefined;
    category?: string | undefined;
    destination?: string | undefined;
    badges?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    rating?: number | undefined;
}, {
    status?: "active" | "draft" | "archived" | undefined;
    search?: string | undefined;
    category?: string | undefined;
    destination?: string | undefined;
    badges?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    rating?: number | undefined;
}>;
export declare const createPaymentIntentSchema: z.ZodObject<{
    bookingId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
}, {
    bookingId: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAttractionInput = z.infer<typeof createAttractionSchema>;
export type UpdateAttractionInput = z.infer<typeof updateAttractionSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
//# sourceMappingURL=validators.d.ts.map