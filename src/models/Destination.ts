import mongoose, { Schema } from 'mongoose';
import { IDestination } from '../types';

const destinationSchema = new Schema<IDestination>(
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
    country: {
      type: String,
      required: true,
      index: true,
    },
    continent: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
    }],
    heroImage: {
      type: String,
      required: true,
    },
    highlights: [{
      type: String,
    }],
    bestTimeToVisit: {
      type: String,
    },
    timezone: {
      type: String,
    },
    language: {
      type: String,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    tags: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        const obj = ret as Record<string, unknown>;
        delete obj.__v;
        return obj;
      },
    },
  }
);

// Virtual for counting attractions (will be populated in controller)
destinationSchema.virtual('attractionCount', {
  ref: 'Attraction',
  localField: 'name',
  foreignField: 'destination.city',
  count: true,
});

destinationSchema.index({ name: 'text', country: 'text' }, { language_override: 'textSearchLanguage' });
destinationSchema.index({ sortOrder: 1, isActive: 1 });

export const Destination = mongoose.model<IDestination>('Destination', destinationSchema);
