"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const tenantSchema = new mongoose_1.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    domain: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    customDomain: {
        type: String,
        lowercase: true,
        sparse: true,
        index: true,
    },
    logo: {
        type: String,
        required: true,
    },
    logoDark: {
        type: String,
    },
    favicon: {
        type: String,
    },
    tagline: {
        type: String,
    },
    description: {
        type: String,
    },
    theme: {
        primaryColor: {
            type: String,
            default: '#0066FF',
        },
        secondaryColor: {
            type: String,
            default: '#00D4AA',
        },
        accentColor: {
            type: String,
            default: '#FF6B35',
        },
    },
    fonts: {
        heading: {
            type: String,
            default: 'Inter',
        },
        body: {
            type: String,
            default: 'Inter',
        },
    },
    defaultCurrency: {
        type: String,
        required: true,
        default: 'USD',
    },
    defaultLanguage: {
        type: String,
        required: true,
        default: 'en',
    },
    supportedLanguages: [{
            type: String,
        }],
    timezone: {
        type: String,
        default: 'UTC',
    },
    contactInfo: {
        email: String,
        phone: String,
        whatsapp: String,
        address: String,
        supportHours: String,
    },
    socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String,
        youtube: String,
        tiktok: String,
    },
    aiSettings: {
        bookingWidget: {
            enabled: { type: Boolean, default: true },
            position: { type: String, default: 'bottom-right' },
            primaryColor: String,
            welcomeMessage: String,
            languages: [{ type: String }],
            autoOpen: { type: Boolean, default: false },
        },
        voiceAgent: {
            enabled: { type: Boolean, default: false },
            languages: [{ type: String }],
            buttonPosition: { type: String, default: 'bottom-right' },
        },
        searchWidget: {
            enabled: { type: Boolean, default: true },
            placeholder: String,
            showPopularSearches: { type: Boolean, default: true },
            maxSuggestions: { type: Number, default: 6 },
        },
    },
    seoSettings: {
        metaTitle: String,
        metaDescription: String,
        keywords: [{ type: String }],
        ogImage: String,
    },
    paymentSettings: {
        stripeAccountId: String,
        enabledGateways: [{ type: String }],
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'suspended'],
        default: 'pending',
        index: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            const obj = ret;
            delete obj.__v;
            return obj;
        },
    },
});
// Index for domain lookups
tenantSchema.index({ domain: 1, status: 1 });
tenantSchema.index({ customDomain: 1, status: 1 });
exports.Tenant = mongoose_1.default.model('Tenant', tenantSchema);
//# sourceMappingURL=Tenant.js.map