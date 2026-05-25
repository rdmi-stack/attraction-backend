/**
 * Set the DB designMode for the 7 newly-built tenants to their real values
 * (they were left at 'default' since the frontend slugDesignMap overrides
 * rendering, but the DB should be accurate so nothing reads 'default').
 *
 * Run: npx ts-node src/scripts/set-designmodes.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';

const MAP: Record<string, string> = {
  'egypt-tour-booking': 'bazaar',
  'hurghada-submarine': 'abyss',
  'giftun-island-hurghada': 'island',
  'hurghada-fishing': 'angler',
  'makadi-bay-snorkeling': 'lagoon',
  'orange-bay-tours': 'sandbar',
  'sharm-dinner-cruise': 'evening',
  'ctoureg': 'atlas',
};

async function main(): Promise<void> {
  await connectDatabase();
  try {
    console.log('\n— Setting designModes —\n');
    for (const [slug, mode] of Object.entries(MAP)) {
      const tenant = await Tenant.findOne({ slug });
      if (!tenant) { console.log(`  ✗ ${slug.padEnd(26)} NOT FOUND`); continue; }
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const before = (tenant as any).designMode;
      if (before === mode) { console.log(`  • ${slug.padEnd(26)} already ${mode}`); continue; }
      (tenant as any).designMode = mode;
      await tenant.save();
      console.log(`  ✓ ${slug.padEnd(26)} ${before} → ${mode}`);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }
    console.log('');
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => { console.error(e); await disconnectDatabase(); process.exit(1); });
