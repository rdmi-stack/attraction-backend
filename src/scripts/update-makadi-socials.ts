/**
 * One-off: update Makadi Horse Club tenant social links per Fouad's request.
 *
 * Usage: npx ts-node src/scripts/update-makadi-socials.ts
 */
import mongoose from 'mongoose';
import { env } from '../config/env';
import { Tenant } from '../models/Tenant';

async function run() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(env.mongodbUri);

  const slug = 'makadi-horse-club';
  const update = {
    'socialLinks.facebook': 'https://www.facebook.com/MakadiHorseClub/',
    'socialLinks.instagram': 'https://www.instagram.com/makadihorseclub/',
    'socialLinks.tiktok': 'https://www.tiktok.com/@makadi.horse.club?lang=en',
  };

  const result = await Tenant.findOneAndUpdate(
    { slug },
    { $set: update },
    { new: true, projection: { slug: 1, name: 1, socialLinks: 1 } }
  );

  if (!result) {
    console.error(`❌ Tenant with slug "${slug}" not found.`);
    process.exit(1);
  }

  console.log(`✅ Updated socialLinks on "${result.name}" (${result.slug})`);
  console.log(JSON.stringify(result.socialLinks, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
