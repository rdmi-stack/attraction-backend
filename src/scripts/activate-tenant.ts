/**
 * Activate one or more tenants by slug (status -> active).
 * Use after a tenant's bespoke design + content are built and verified.
 *
 * Usage:
 *   npx ts-node src/scripts/activate-tenant.ts <slug> [<slug> ...]
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';

async function main(): Promise<void> {
  const slugs = process.argv.slice(2).filter(Boolean);
  if (slugs.length === 0) {
    console.error('Usage: activate-tenant.ts <slug> [<slug> ...]');
    process.exitCode = 1;
    return;
  }

  await connectDatabase();
  try {
    console.log('\n— Activating tenants —\n');
    for (const slug of slugs) {
      const tenant = await Tenant.findOne({ slug });
      if (!tenant) {
        console.log(`  ✗ ${slug.padEnd(24)} NOT FOUND`);
        continue;
      }
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const before = (tenant as any).status;
      if (before === 'active') {
        console.log(`  • ${slug.padEnd(24)} already active`);
        continue;
      }
      (tenant as any).status = 'active';
      await tenant.save();
      console.log(`  ✓ ${slug.padEnd(24)} ${before} → active`);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }
    console.log('');
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
