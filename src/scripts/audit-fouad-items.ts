/**
 * Audit the live state of every item Fouad raised in the 2026-05-13 review,
 * so we can produce an accurate "what's left" list.
 * Run: npx ts-node src/scripts/audit-fouad-items.ts
 */
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const GROUPS: Record<string, string[]> = {
  'WORK ITEMS (flagged for fixes)': [
    'desert-fox-safari', 'gamila-horse-stable', 'hurghada-private-safari',
    'hurghada-snorkeling', 'royal-cruise-hurghada',
  ],
  'DEDUPE CANDIDATES': [
    'makadi-bay-safari', 'makadi-bay-safari-center', 'hurghada-private-tours',
  ],
  'RECHECK NON-APPROVED ACTIVE': [
    'cairo-adventures', 'camel-safari-hurghada', 'ctoureg', 'horse-riding-hurghada',
    'parasailing-hurghada', 'safari-red-sea', 'sea-horse-sahl-hashesh',
  ],
};

async function main(): Promise<void> {
  await connectDatabase();
  try {
    for (const [group, slugs] of Object.entries(GROUPS)) {
      console.log(`\n=== ${group} ===`);
      console.log('slug'.padEnd(28), 'status'.padEnd(11), 'design'.padEnd(13), 'tours');
      for (const slug of slugs) {
        const t: any = await Tenant.findOne({ slug }); // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!t) { console.log(slug.padEnd(28), 'MISSING'); continue; }
        const tours = await Attraction.countDocuments({ tenantIds: t._id });
        console.log(slug.padEnd(28), String(t.status || '?').padEnd(11), String(t.designMode || '?').padEnd(13), tours);
      }
    }
    // Hurghada Spa removal check
    console.log('\n=== HURGHADA SPA (should be removed) ===');
    const spa = await Attraction.find({ title: /spa/i }).select('title slug').limit(10);
    if (spa.length === 0) console.log('  ✓ no attraction with "spa" in the title — removed');
    else spa.forEach((a: any) => console.log('  • still present:', a.title, '·', a.slug)); // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log('');
  } finally {
    await disconnectDatabase();
  }
}
main().catch(async (e) => { console.error(e); await disconnectDatabase(); process.exit(1); });
