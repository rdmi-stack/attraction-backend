/**
 * Upload the cropped Royal SeaScope deck assets (extracted from
 * "Join up presentation.pdf" pages 5-6) to Cloudinary, then persist
 * the URLs to tenant.logo + tenant.heroImages.
 *
 * Source images were cropped with sharp into /tmp/seascope-crops/.
 *
 * Usage:
 *   npx ts-node src/scripts/upload-royal-seascope-deck-assets.ts
 */

import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { env } from '../config/env';

const TENANT_SLUG = 'royal-seascope';
const CROP_DIR = '/tmp/seascope-crops';

const ASSETS = [
  // Logo — square-ish, no transform cap, keep PNG
  { file: 'logo-seascope-yellow-submarines.png', folder: `tenant-logos/${TENANT_SLUG}`, kind: 'logo' as const },
  // Hero (cinematic yellow sub + reef)
  { file: 'hero-royal-seascope-yellow-sub.jpg', folder: `tenant-heroes/${TENANT_SLUG}`, kind: 'hero' as const },
  // Photo gallery (used as additional hero slides)
  { file: 'photo-1-aerial-yellow-subs.jpg', folder: `tenant-heroes/${TENANT_SLUG}`, kind: 'hero' as const },
  { file: 'photo-2-family-window-coral.jpg', folder: `tenant-heroes/${TENANT_SLUG}`, kind: 'hero' as const },
  { file: 'photo-3-interior-cabin-portholes.jpg', folder: `tenant-heroes/${TENANT_SLUG}`, kind: 'hero' as const },
  { file: 'photo-4-kids-window-tablet.jpg', folder: `tenant-heroes/${TENANT_SLUG}`, kind: 'hero' as const },
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

async function main(): Promise<void> {
  await connectDatabase();
  try {
    const tenant = await Tenant.findOne({ slug: TENANT_SLUG });
    if (!tenant) {
      console.error(`Tenant '${TENANT_SLUG}' not found.`);
      process.exitCode = 1;
      return;
    }
    console.log(`Tenant: ${tenant.name} (_id=${tenant._id})\n`);

    let logoUrl = '';
    const heroUrls: string[] = [];

    for (const a of ASSETS) {
      const filePath = path.join(CROP_DIR, a.file);
      if (!fs.existsSync(filePath)) {
        console.error(`Missing: ${filePath}`);
        continue;
      }
      console.log(`Uploading ${a.file}...`);
      const url = await uploadOriginal(filePath, a.folder);
      console.log(`  ✅ ${url}`);
      if (a.kind === 'logo') logoUrl = url;
      else heroUrls.push(url);
    }

    const update: Record<string, unknown> = {};
    if (logoUrl) update.logo = logoUrl;
    if (heroUrls.length) update.heroImages = heroUrls;

    if (Object.keys(update).length) {
      await Tenant.updateOne({ _id: tenant._id }, { $set: update });
      console.log('\n✅ Tenant updated:');
      console.log(JSON.stringify(update, null, 2));
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
