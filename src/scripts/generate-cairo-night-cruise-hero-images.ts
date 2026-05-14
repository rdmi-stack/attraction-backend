/**
 * Generate 3 cinematic hero images for the Cairo Night Cruise tenant using
 * gpt-image-1.5, upload to Cloudinary, persist URLs to tenant.heroImages.
 *
 * Usage:
 *   railway run npx ts-node src/scripts/generate-cairo-night-cruise-hero-images.ts
 *   (or local)  npx ts-node src/scripts/generate-cairo-night-cruise-hero-images.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'cairo-night-cruise';

const HERO_PROMPTS = [
  {
    name: 'hero-1-golden-hour-felucca',
    prompt:
      "Cinematic wide photograph of a traditional Egyptian felucca with a tall lateen sail on the Nile in Cairo at golden hour, low warm orange light, the Cairo Tower visible glowing gold on the horizon, guests dining at small tables on the foredeck under a string of warm bistro lights, photorealistic professional travel photography, sky transitioning from peach to deep blue, sweeping cinematic frame, 16:9.",
  },
  {
    name: 'hero-2-blue-hour-skyline',
    prompt:
      "Cinematic blue-hour photograph of a traditional Egyptian felucca on the Nile river in Cairo at twilight, deep indigo sky with the first stars, the Tahrir Bridge and Cairo skyline lit up gold in the background, warm bistro lights strung along the boats rigging reflecting on the water, photorealistic professional travel photography, cool-warm color contrast, 16:9.",
  },
  {
    name: 'hero-3-full-night-dinner',
    prompt:
      "Intimate cinematic photograph of a candlelit dinner table on the bow of a traditional Egyptian felucca at night on the Nile, full Cairo city skyline lit up across the river including the Cairo Tower, plates of mezze on white linen, two flutes of wine, the Nile water reflecting all the city lights in shimmering streaks, photorealistic professional travel photography, deep warm color palette, romantic, 16:9.",
  },
];

async function generateAndUpload(prompt: string, folder: string, filename: string): Promise<string | null> {
  try {
    console.log(`  Generating ${filename}...`);
    const { base64, mimeType } = await generateImageFromPrompt({
      prompt,
      size: '1536x1024',
      quality: 'high',
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

    console.log('=== Generating 3 hero images (high quality) ===');
    const heroUrls: string[] = [];
    for (const hero of HERO_PROMPTS) {
      const url = await generateAndUpload(hero.prompt, `tenant-heroes/${TENANT_SLUG}`, hero.name);
      if (url) heroUrls.push(url);
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (heroUrls.length === 0) {
      console.error('\n❌ No hero images generated — leaving tenant.heroImages unchanged.');
      process.exitCode = 1;
      return;
    }

    await Tenant.updateOne({ _id: tenant._id }, { $set: { heroImages: heroUrls } });
    console.log(`\n✅ Tenant updated. heroImages count: ${heroUrls.length}`);
    heroUrls.forEach((u, i) => console.log(`   [${i + 1}] ${u}`));
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
