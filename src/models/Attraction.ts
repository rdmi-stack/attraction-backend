import mongoose, { Schema } from 'mongoose';
import { IAttraction } from '../types';

const attractionSchema = new Schema<IAttraction>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
      required: true,
    }],
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    destination: {
      city: {
        type: String,
        required: true,
        index: true,
      },
      country: {
        type: String,
        required: true,
        index: true,
      },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    duration: {
      type: String,
      required: true,
    },
    languages: [{
      type: String,
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    priceFrom: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    pricingOptions: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number, required: true },
      originalPrice: { type: Number },
    }],
    highlights: [{
      type: String,
    }],
    inclusions: [{
      type: String,
    }],
    exclusions: [{
      type: String,
    }],
    meetingPoint: {
      address: { type: String, required: true },
      instructions: { type: String, required: true },
      mapUrl: { type: String },
    },
    cancellationPolicy: {
      type: String,
      required: true,
    },
    instantConfirmation: {
      type: Boolean,
      default: true,
    },
    mobileTicket: {
      type: Boolean,
      default: true,
    },
    badges: [{
      type: String,
      enum: ['bestseller', 'free-cancellation', 'skip-line', 'instant-confirm'],
    }],
    availability: {
      type: {
        type: String,
        enum: ['time-slots', 'date-only', 'flexible'],
        default: 'time-slots',
      },
      advanceBooking: {
        type: Number,
        default: 30,
      },
    },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },
    tenantIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    }],
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

// Indexes for search and filtering
attractionSchema.index({ title: 'text', shortDescription: 'text', description: 'text' });
attractionSchema.index({ 'destination.city': 1, category: 1, status: 1 });
attractionSchema.index({ priceFrom: 1, rating: -1 });
attractionSchema.index({ featured: 1, sortOrder: 1 });
attractionSchema.index({ tenantIds: 1, status: 1 });

export const Attraction = mongoose.model<IAttraction>('Attraction', attractionSchema);
