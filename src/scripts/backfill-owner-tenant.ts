/**
 * Backfill Attraction.ownerTenantId from the first assigned tenant, so the
 * reseller marketplace has a clear supplier for every existing attraction.
 * Idempotent — only fills attractions that don't already have an owner.
 *
 * Usage: npx ts-node src/scripts/backfill-owner-tenant.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Attraction } from '../models/Attraction';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('MONGODB_URI not set in env');
  process.exit(1);
}

(async () => {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI as string);

  const res = await Attraction.updateMany(
    { ownerTenantId: { $exists: false }, 'tenantIds.0': { $exists: true } },
    [{ $set: { ownerTenantId: { $arrayElemAt: ['$tenantIds', 0] } } }],
  );
  console.log(`Backfilled ownerTenantId: matched ${res.matchedCount}, modified ${res.modifiedCount}`);

  const stillMissing = await Attraction.countDocuments({ ownerTenantId: { $exists: false } });
  console.log(`Attractions still without an owner (no tenantIds): ${stillMissing}`);

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
