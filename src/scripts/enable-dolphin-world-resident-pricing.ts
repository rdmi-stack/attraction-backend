/**
 * Enable resident pricing on Dolphin World Egypt tenant and populate residentPrice
 * on every pricing option of its 7 tours.
 *
 * Usage: railway run npx ts-node src/scripts/enable-dolphin-world-resident-pricing.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const TENANT_SLUG = 'dolphin-world-egypt';

// Target resident discount ratios per tour slug pattern. Residents typically pay
// about half of foreigner price on this type of attraction.
// If a specific override isn't listed, the default 0.5 ratio is used.
const RESIDENT_PRICE_RATIO_DEFAULT = 0.5;
const RESIDENT_RATIO_OVERRIDES: Record<string, number> = {
  'dolphin-world-show-walrus': 0.48,
  'dolphin-world-family-swimming-package': 0.53,
  'dolphin-world-family-all-in-one': 0.53,
  'dolphin-world-duo-swimming': 0.54,
  'dolphin-world-individual-swimming': 0.49,
  'dolphin-world-individual-photos-session': 0.55,
  'dolphin-world-family-photos-session': 0.52,
};

async function main(): Promise<void> {
  await connectDatabase();

  try {
    // 1. Toggle tenant flag
    console.log('=== Enabling resident pricing on tenant ===');
    const tenant = await Tenant.findOne({ slug: TENANT_SLUG });
    if (!tenant) {
      console.error(`Tenant '${TENANT_SLUG}' not found`);
      process.exitCode = 1;
      return;
    }
    await Tenant.updateOne(
      { _id: tenant._id },
      { $set: { 'pricingSettings.enableResidentPricing': true } }
    );
    console.log(`  ✅ ${tenant.name}: pricingSettings.enableResidentPricing = true`);

    // 2. Populate residentPrice on every pricing option of every Dolphin World tour
    console.log('\n=== Populating residentPrice on pricing options ===');
    const attractions = await Attraction.find({ tenantIds: tenant._id });
    console.log(`  Found ${attractions.length} attractions for this tenant`);

    for (const attr of attractions) {
      if (!attr.pricingOptions || attr.pricingOptions.length === 0) continue;
      const ratio = RESIDENT_RATIO_OVERRIDES[attr.slug] ?? RESIDENT_PRICE_RATIO_DEFAULT;

      attr.pricingOptions.forEach((opt) => {
        const newResidentPrice = Math.max(1, Math.round(opt.price * ratio));
        // Only set when not already set OR when the value would actually change.
        opt.residentPrice = newResidentPrice;
      });

      attr.markModified('pricingOptions');
      await attr.save();

      console.log(`  ✅ ${attr.slug} (${attr.pricingOptions.length} options, ${Math.round(ratio * 100)}% of foreigner):`);
      attr.pricingOptions.forEach((opt) => {
        console.log(`       ${opt.name.padEnd(32)} $${opt.price}  →  resident $${opt.residentPrice}`);
      });
    }

    console.log('\nDone. Dolphin World Egypt now has resident pricing enabled.');
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (err) => {
  console.error('Script failed:', err);
  await disconnectDatabase();
  process.exit(1);
});
