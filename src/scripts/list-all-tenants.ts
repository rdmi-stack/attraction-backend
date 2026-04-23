/**
 * Diagnostic: list every tenant in the DB, grouped by status,
 * and flag whether each has a brand-admin user assigned.
 *
 * Usage: npx ts-node src/scripts/list-all-tenants.ts
 */
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';

async function main(): Promise<void> {
  await connectDatabase();

  try {
    const tenants = await Tenant.find({}).select('_id slug name status').lean();
    console.log(`\nTotal tenants in DB: ${tenants.length}\n`);

    const byStatus: Record<string, typeof tenants> = {};
    for (const t of tenants) {
      byStatus[t.status] = byStatus[t.status] || [];
      byStatus[t.status].push(t);
    }

    for (const [status, arr] of Object.entries(byStatus)) {
      console.log(`\n[${status}] ${arr.length} tenants:`);
      for (const t of arr) {
        const admin = await User.findOne({
          role: 'brand-admin',
          assignedTenants: t._id,
        }).select('email');
        const adminStr = admin ? ` -> ${admin.email}` : ' (NO ADMIN)';
        console.log(`  - ${t.slug} (${t.name})${adminStr}`);
      }
    }
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
