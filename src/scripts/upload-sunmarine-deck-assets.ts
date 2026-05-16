/**
 * Upload the cropped deck assets for the 4 remaining Egypt Sunmarine boat
 * brands (Pirates, Nefertari, Elite VIP, Classic) to Cloudinary and persist
 * each tenant's logo + heroImages.
 *
 * Crops live in /tmp/sunmarine-crops/{brand}/. Tenants are upserted by slug
 * first by the per-brand seed scripts; this script only writes media URLs.
 *
 * Usage:
 *   npx ts-node src/scripts/upload-sunmarine-deck-assets.ts
 */

import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { env } from '../config/env';

const CROP_DIR = '/tmp/sunmarine-crops';

const BRANDS = [
  { slug: 'pirates-premier-sailing', dir: 'pirates' },
  { slug: 'nefertari-cruise', dir: 'nefertari' },
  { slug: 'elite-vip-cruise', dir: 'elite-vip' },
  { slug: 'classic-boat', dir: 'classic' },
];

const FILES = [
  // logo first (kept only if it exists)
  'logo.png',
  'hero.jpg',
  // collage gallery in display order (4 photos)
];

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

async function uploadOriginal(filePath: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `attractions-network/${folder}`,
    resource_type: 'image',
    transformation: [{ quality: 'auto:best' }, { fetch_format: 'auto' }],
  });
  return result.secure_url;
}

function listBrandPhotos(brandDir: string): string[] {
  return fs
    .readdirSync(brandDir)
    .filter((f) => /^photo-\d-/.test(f))
    .sort();
}

async function main(): Promise<void> {
  await connectDatabase();
  try {
    for (const b of BRANDS) {
      const brandDir = path.join(CROP_DIR, b.dir);
      if (!fs.existsSync(brandDir)) {
        console.warn(`Skip ${b.slug}: ${brandDir} missing`);
        continue;
      }
      console.log(`\n=== ${b.slug} (${b.dir}) ===`);

      // Optional logo (Classic has none)
      let logoUrl = '';
      const logoPath = path.join(brandDir, 'logo.png');
      if (fs.existsSync(logoPath)) {
        console.log(`Uploading logo...`);
        logoUrl = await uploadOriginal(logoPath, `tenant-logos/${b.slug}`);
        console.log(`  ✅ ${logoUrl}`);
      }

      // Hero + 4 gallery photos → heroImages array
      const heroPaths = [path.join(brandDir, 'hero.jpg'), ...listBrandPhotos(brandDir).map((f) => path.join(brandDir, f))];
      const heroUrls: string[] = [];
      for (const p of heroPaths) {
        console.log(`Uploading ${path.basename(p)}...`);
        const url = await uploadOriginal(p, `tenant-heroes/${b.slug}`);
        console.log(`  ✅ ${url}`);
        heroUrls.push(url);
      }

      const tenant = await Tenant.findOne({ slug: b.slug });
      if (!tenant) {
        console.warn(`  ⚠️  Tenant '${b.slug}' not found — assets uploaded but not persisted. Run the per-brand seed first.`);
        continue;
      }
      const update: Record<string, unknown> = { heroImages: heroUrls };
      if (logoUrl) update.logo = logoUrl;
      await Tenant.updateOne({ _id: tenant._id }, { $set: update });
      console.log(`  ✅ Updated ${b.slug}: logo=${logoUrl ? 'yes' : 'no'}, heroImages=${heroUrls.length}`);
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
