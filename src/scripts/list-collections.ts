import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';

async function main(): Promise<void> {
  await connectDatabase();
  try {
    const db = mongoose.connection.db!;
    console.log('Database name:', db.databaseName);
    const cols = await db.listCollections().toArray();
    console.log(`\n${cols.length} collections:`);
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  - ${c.name}: ${count} docs`);
    }

    // Specifically probe for Makadi in the tenants collection (raw)
    const tenantsCol = db.collection('tenants');
    const makadi = await tenantsCol.findOne({ slug: 'makadi-horse-club' });
    console.log('\nmakadi-horse-club in tenants collection?', makadi ? `YES — _id=${makadi._id}` : 'NO');

    // And in any collection named differently
    const allTenantLike = cols.filter((c) => c.name.toLowerCase().includes('tenant'));
    for (const c of allTenantLike) {
      const doc = await db.collection(c.name).findOne({ slug: 'makadi-horse-club' });
      console.log(`makadi-horse-club in ${c.name}?`, doc ? `YES — _id=${doc._id}` : 'NO');
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
