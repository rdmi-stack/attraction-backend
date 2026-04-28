/**
 * Seed every existing tenant with a previewAccessCode if it doesn't already have one.
 * Idempotent — running it again only fills in missing codes.
 *
 * Usage:
 *   npx ts-node src/scripts/seed-preview-codes.ts            # seed all tenants without a code
 *   npx ts-node src/scripts/seed-preview-codes.ts --force    # regenerate every tenant's code
 *   npx ts-node src/scripts/seed-preview-codes.ts --slug=royal-cruise-hurghada   # one tenant
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Tenant } from '../models/Tenant';
import { generatePreviewAccessCode } from '../utils/hash';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('MONGODB_URI not set in env');
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const slugArg = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

(async () => {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI as string);

  const filter: Record<string, unknown> = {};
  if (slugArg) filter.slug = slugArg.toLowerCase();
  if (!force && !slugArg) {
    filter.$or = [
      { previewAccessCode: { $exists: false } },
      { previewAccessCode: null },
      { previewAccessCode: '' },
    ];
  }

  const tenants = await Tenant.find(filter).select('+previewAccessCode slug name');

  if (tenants.length === 0) {
    console.log(force ? 'No tenants matched.' : 'All tenants already have a preview access code.');
    await mongoose.disconnect();
    return;
  }

  console.log(`${force ? 'Regenerating' : 'Seeding'} preview codes for ${tenants.length} tenant(s)…\n`);

  const results: Array<{ slug: string; name: string; code: string }> = [];
  for (const t of tenants) {
    const code = generatePreviewAccessCode();
    t.previewAccessCode = code;
    t.previewAccessCodeUpdatedAt = new Date();
    await t.save();
    results.push({ slug: t.slug, name: t.name, code });
  }

  // Pretty-print as a table for easy sharing
  const colSlug = Math.max(...results.map((r) => r.slug.length), 'slug'.length);
  const colName = Math.max(...results.map((r) => r.name.length), 'name'.length);
  console.log(
    `${'slug'.padEnd(colSlug)}  ${'name'.padEnd(colName)}  code`
  );
  console.log('-'.repeat(colSlug + colName + 4 + 9));
  for (const r of results) {
    console.log(`${r.slug.padEnd(colSlug)}  ${r.name.padEnd(colName)}  ${r.code}`);
  }
  console.log(`\n✅ ${results.length} tenant(s) updated.`);

  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
