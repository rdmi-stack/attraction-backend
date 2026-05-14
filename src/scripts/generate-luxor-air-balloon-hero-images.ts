/**
 * Generate 3 cinematic hero images for the Luxor Air Balloon tenant using
 * gpt-image-1.5, upload to Cloudinary, persist URLs to tenant.heroImages.
 *
 * Usage:
 *   railway run npx ts-node src/scripts/generate-luxor-air-balloon-hero-images.ts
 *   (or local)  npx ts-node src/scripts/generate-luxor-air-balloon-hero-images.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'luxor-air-balloon';

const HERO_PROMPTS = [
  {
    name: 'hero-1-sunrise-vok',
    prompt:
      "Cinematic wide aerial photograph of a single orange-and-cream hot air balloon rising at sunrise over the Valley of the Kings on Luxor's West Bank, Hatshepsut Temple visible in the distance below carved into limestone cliffs, dramatic purple-to-orange dawn sky, golden first light, photorealistic, professional landscape tourism photography, soft warm cinematic color grade.",
  },
  {
    name: 'hero-2-basket-pov',
    prompt:
      "Intimate over-the-shoulder photograph from inside a luxury hot air balloon basket at sunrise, two silhouetted passengers leaning on the wicker edge looking down at the Nile River catching first light, the burners glowing flame-orange above, soft pre-dawn cobalt sky transitioning to peach and amber, photorealistic, cinematic 16:9.",
  },
  {
    name: 'hero-3-fleet-formation',
    prompt:
      "High aerial photograph of twenty hot air balloons drifting in elegant formation over Luxor's Theban necropolis at dawn, soft cream and lavender sky, the Nile River winding through green farmland and golden desert below, distant pyramids and temples on the West Bank, photorealistic, breathtaking wide cinematic landscape, warm sunrise palette.",
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
