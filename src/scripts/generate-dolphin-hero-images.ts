/**
 * Generate hero + logo + destination images for Dolphin World Egypt tenant
 * using gpt-image-1.5 and upload to Cloudinary.
 *
 * Usage: railway run npx ts-node src/scripts/generate-dolphin-hero-images.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'dolphin-world-egypt';

const HERO_PROMPTS = [
  {
    name: 'hero-1-show',
    prompt: 'Dolphin leaping high out of turquoise water at outdoor delphinarium in Hurghada Egypt, spectacular acrobatic jump, crowd of families watching in amazement, sunny day, trainer standing on edge of pool, dramatic action shot, cinematic wide angle.',
    quality: 'high' as const,
  },
  {
    name: 'hero-2-family-swim',
    prompt: 'Happy family swimming with friendly dolphin in crystal clear blue pool, children laughing and hugging dolphin, parents joining in, magical family moment, sunny Egyptian resort, professional photography, warm bright colors.',
    quality: 'high' as const,
  },
  {
    name: 'hero-3-kiss-dolphin',
    prompt: 'Close-up portrait of smiling young woman kissing dolphin on nose in pool at Egyptian resort Hurghada, playful moment, dolphin\'s smooth skin glistening, water droplets, sunny afternoon light, tender and joyful.',
    quality: 'high' as const,
  },
  {
    name: 'hero-4-walrus-show',
    prompt: 'Walrus performing trick on blue mat at outdoor marine show in Hurghada Egypt, trainer giving signal, audience watching, tropical palm trees in background, vibrant colors, family-friendly atmosphere.',
    quality: 'high' as const,
  },
  {
    name: 'hero-5-underwater',
    prompt: 'Underwater view of person swimming alongside dolphin in crystal clear pool, bubbles rising, sunlight filtering through water, peaceful and magical, turquoise blue water, professional underwater photography.',
    quality: 'high' as const,
  },
];

const LOGO_PROMPT = {
  name: 'logo',
  prompt: 'Clean minimalist logo for "Dolphin World Egypt" — stylized leaping dolphin silhouette with waves, deep blue and gold colors, professional tourism brand logo, transparent background, flat vector design, elegant typography below reading "DOLPHIN WORLD EGYPT", family-friendly marine attraction brand.',
  quality: 'medium' as const,
  size: '1024x1024' as const,
};

async function generateAndUpload(
  prompt: string,
  folder: string,
  filename: string,
  size: '1024x1024' | '1024x1536' | '1536x1024' = '1536x1024',
  quality: 'low' | 'medium' | 'high' = 'medium',
): Promise<string | null> {
  try {
    console.log(`  Generating ${filename}...`);
    const { base64, mimeType } = await generateImageFromPrompt({
      prompt,
      size,
      quality,
      outputFormat: 'jpeg',
    });
    const dataUri = `data:${mimeType};base64,${base64}`;
    const uploaded = await uploadBase64Image(dataUri, folder);
    console.log(`  ✅ ${uploaded.url}`);
    return uploaded.url;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ ${filename} failed: ${msg}`);
    return null;
  }
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

    // === Hero images ===
    console.log('=== Generating 5 hero images (high quality) ===');
    const heroUrls: string[] = [];
    for (const hero of HERO_PROMPTS) {
      const url = await generateAndUpload(
        hero.prompt,
        `tenant-heroes/${TENANT_SLUG}`,
        hero.name,
        '1536x1024',
        hero.quality,
      );
      if (url) heroUrls.push(url);
      await new Promise((r) => setTimeout(r, 2000));
    }

    // === Logo ===
    console.log('\n=== Generating logo ===');
    const logoUrl = await generateAndUpload(
      LOGO_PROMPT.prompt,
      `tenant-logos/${TENANT_SLUG}`,
      'logo',
      LOGO_PROMPT.size,
      LOGO_PROMPT.quality,
    );

    // === Update tenant record ===
    console.log('\n=== Updating tenant record ===');
    const updates: Record<string, unknown> = {};
    if (heroUrls.length > 0) {
      updates.heroImages = heroUrls;
    }
    if (logoUrl) {
      updates.logo = logoUrl;
      updates.favicon = logoUrl;
    }

    if (Object.keys(updates).length > 0) {
      await Tenant.updateOne({ _id: tenant._id }, { $set: updates });
      console.log('✅ Tenant updated with new images:');
      console.log(`   heroImages: ${heroUrls.length}`);
      console.log(`   logo: ${logoUrl || '(unchanged)'}`);
    }

    console.log('\nDone.');
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
