import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecialOffer extends Document {
  attractionId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const specialOfferSchema = new Schema<ISpecialOffer>(
  {
    attractionId: {
      type: Schema.Types.ObjectId,
      ref: 'Attraction',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 100,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

specialOfferSchema.index({ attractionId: 1, validFrom: 1, validUntil: 1 });
specialOfferSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export const SpecialOffer = mongoose.model<ISpecialOffer>('SpecialOffer', specialOfferSchema);
