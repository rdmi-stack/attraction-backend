/**
 * Generate 5 felucca-portrait images for the Cairo Night Cruise tenant.
 * Uploads to Cloudinary under tenant-gallery/cairo-night-cruise/. Used by the
 * homepage Fleet section + Departures Board + /fleet customPage.
 *
 * Usage:
 *   railway run npx ts-node src/scripts/generate-cairo-night-cruise-fleet-images.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'cairo-night-cruise';

const FLEET_PROMPTS = [
  {
    name: 'cn-01-nefertiti',
    prompt: "Cinematic editorial photograph of a large traditional Egyptian felucca named Nefertiti at the Garden City Marina in Cairo at evening, tall lateen sail with subtle sky-blue tint, polished wooden hull with deep crimson trim, candlelit dinner tables on the foredeck under bistro lights, Cairo Tower glowing gold in the background, photorealistic professional travel photography, warm cinematic color palette, 16:9.",
  },
  {
    name: 'cn-02-cleopatra',
    prompt: "Romantic photograph of an intimate traditional Egyptian felucca named Cleopatra moored at Maadi Pier at dusk, smaller boat with two private 2-tops set on the bow with rose petals on white linen, fanous lanterns hanging from the sail rigging, soft sunset golden hour light, photorealistic professional travel photography, deep romantic warm color palette, 16:9.",
  },
  {
    name: 'cn-03-isis',
    prompt: "Editorial photograph of a wide stable traditional Egyptian felucca named Isis at Zamalek Yacht Club in Cairo at evening, family-friendly with kids drawing at a small low table on the deck, parents dining at the main table behind, warm bistro lights overhead, soft late-afternoon light, photorealistic warm family travel photography, 16:9.",
  },
  {
    name: 'cn-04-hathor',
    prompt: "Moody photograph of a small intimate traditional Egyptian felucca named Hathor at night on the Nile, dark polished wood deck with a tiny jazz quartet stage forward with a piano and stand-up bass visible, warm spotlight on the musicians, adult guests with cocktails listening from candlelit booths along the rail, photorealistic professional jazz-club photography, deep moody color palette, 16:9.",
  },
  {
    name: 'cn-05-bastet',
    prompt: "Cinematic photograph of a traditional Egyptian felucca named Bastet decorated with traditional fanous lanterns in golds reds and greens for Ramadan, the boat moored at Maadi Pier at sunset, table set with dates and iftar dishes, soft warm sunset light, photorealistic professional cultural travel photography, rich warm Ramadan color palette, 16:9.",
  },
];

async function generateAndUpload(prompt: string, folder: string, filename: string): Promise<string | null> {
  try {
    console.log(`  Generating ${filename}...`);
    const { base64, mimeType } = await generateImageFromPrompt({
      prompt,
      size: '1536x1024',
      quality: 'medium',
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

    console.log('=== Generating 5 felucca fleet images (medium quality) ===');
    for (const fleet of FLEET_PROMPTS) {
      await generateAndUpload(fleet.prompt, `tenant-gallery/${TENANT_SLUG}`, fleet.name);
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log('\n✅ Fleet imagery generated. URLs above can be referenced from the homepage or /fleet customPage.');
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
