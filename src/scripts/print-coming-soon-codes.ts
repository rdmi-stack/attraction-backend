/**
 * Print (generate if missing) preview-access codes for the 9 coming-soon
 * tenants so they can be shared for the gated demo portal.
 * Run: npx ts-node src/scripts/print-coming-soon-codes.ts
 */
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { generatePreviewAccessCode } from '../utils/hash';

const SLUGS = [
  'luxor-air-balloon', 'cairo-night-cruise', 'egypt-tour-booking', 'hurghada-submarine',
  'giftun-island-hurghada', 'hurghada-fishing', 'makadi-bay-snorkeling', 'orange-bay-tours',
  'sharm-dinner-cruise',
];

async function main(): Promise<void> {
  await connectDatabase();
  try {
    console.log('\n— Coming-soon preview codes —\n');
    for (const slug of SLUGS) {
      const tenant = await Tenant.findOne({ slug }).select('+previewAccessCode slug name');
      if (!tenant) { console.log(`${slug.padEnd(26)} NOT FOUND`); continue; }
      /* eslint-disable @typescript-eslint/no-explicit-any */
      let code = (tenant as any).previewAccessCode as string | undefined;
      if (!code) {
        code = generatePreviewAccessCode();
        (tenant as any).previewAccessCode = code;
        (tenant as any).previewAccessCodeUpdatedAt = new Date();
        await tenant.save();
        console.log(`${slug.padEnd(26)} ${code}   (generated)  [${(tenant as any).name}]`);
      } else {
        console.log(`${slug.padEnd(26)} ${code}  [${(tenant as any).name}]`);
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }
    console.log('');
  } finally { await disconnectDatabase(); }
}
main().catch(async (e) => { console.error(e); await disconnectDatabase(); process.exit(1); });
