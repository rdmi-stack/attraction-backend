import mongoose, { Schema } from 'mongoose';
import { ITenant } from '../types';

const tenantSchema = new Schema<ITenant>(
  {
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
    heroImages: [{
      type: String,
    }],
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
    designMode: {
      type: String,
      enum: ['default', 'luxury', 'minimal', 'nautical', 'equestrian', 'marine', 'desert', 'safari', 'travel', 'stable', 'sunmarine', 'rittal', 'speedboat', 'ancient', 'pyramid', 'skyride', 'temple', 'ranch', 'reef', 'obelisk', 'dune', 'savanna', 'expedition'],
      default: 'default',
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
    pricingSettings: {
      // When true, tours on this tenant can expose a lower "resident" price
      // and the booking widget will ask the visitor to pick Foreigner vs Resident.
      enableResidentPricing: { type: Boolean, default: false },
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
    navigation: [{
      label: { type: String, required: true },
      href: { type: String, required: true },
    }],
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
      enum: ['active', 'inactive', 'pending', 'suspended', 'coming_soon'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        const obj = ret as Record<string, unknown>;
        delete obj.__v;
        return obj;
      },
    },
  }
);

// Index for domain lookups
tenantSchema.index({ domain: 1, status: 1 });
tenantSchema.index({ customDomain: 1, status: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
