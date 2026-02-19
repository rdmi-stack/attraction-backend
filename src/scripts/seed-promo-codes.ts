import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

import { PromoCode } from '../models/PromoCode';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attractions-network';

async function seedPromoCodes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const promoCodes = [
      {
        code: 'WELCOME10',
        description: '10% off your first booking',
        discountType: 'percentage' as const,
        discountValue: 10,
        currency: 'EGP',
        minOrderAmount: 500,
        maxDiscount: 500,
        usageLimit: 1000,
        usageCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'EGYPT2026',
        description: 'Special Egypt tourism discount - 15% off',
        discountType: 'percentage' as const,
        discountValue: 15,
        currency: 'EGP',
        minOrderAmount: 1000,
        maxDiscount: 1000,
        usageLimit: 500,
        usageCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'FOXES200',
        description: 'Flat EGP 200 off',
        discountType: 'fixed' as const,
        discountValue: 200,
        currency: 'EGP',
        minOrderAmount: 800,
        usageLimit: 200,
        usageCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ];

    for (const promo of promoCodes) {
      const existing = await PromoCode.findOne({ code: promo.code });
      if (!existing) {
        await PromoCode.create(promo);
        console.log(`Created promo code: ${promo.code}`);
      } else {
        console.log(`Promo code already exists: ${promo.code}`);
      }
    }

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedPromoCodes();
