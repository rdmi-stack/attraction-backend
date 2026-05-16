/**
 * Upload Majestic Travel logo + the Egypt Sunmarine master logo
 * (extracted from deck page 1) to Cloudinary. Prints the URLs.
 *
 * Usage:
 *   npx ts-node src/scripts/upload-majestic-assets.ts
 */

import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

async function up(file: string, folder: string): Promise<string> {
  const r = await cloudinary.uploader.upload(file, {
    folder: `attractions-network/${folder}`,
    resource_type: 'image',
    transformation: [{ quality: 'auto:best' }, { fetch_format: 'auto' }],
  });
  return r.secure_url;
}

(async () => {
  const logo = await up('/tmp/sunmarine-crops/majestic/logo.png', 'tenant-logos/majestic-travel');
  console.log('MAJESTIC_LOGO=' + logo);
  const master = await up('/tmp/sunmarine-crops/majestic/egypt-sunmarine-master.png', 'tenant-logos/egypt-sunmarine');
  console.log('EGYPT_SUNMARINE_MASTER=' + master);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
