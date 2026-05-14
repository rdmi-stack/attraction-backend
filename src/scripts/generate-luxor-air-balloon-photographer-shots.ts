/**
 * Generate 6 cinematic "photographer shot" images for the Luxor Air Balloon
 * homepage gallery. Each corresponds to a specific subject the brand pitches
 * to professional photographers (Hatshepsut, Valley of the Kings, etc.).
 * Uploads to Cloudinary; prints URLs for paste-in to SHOT_OPPORTUNITIES.
 *
 * Usage:
 *   railway run npx ts-node src/scripts/generate-luxor-air-balloon-photographer-shots.ts
 *   (or local)  npx ts-node src/scripts/generate-luxor-air-balloon-photographer-shots.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'luxor-air-balloon';

const SHOTS = [
  {
    key: 'hatshepsut',
    name: 'shot-1-hatshepsut',
    prompt:
      "Aerial photograph from a hot air balloon at sunrise over Hatshepsut's terraced mortuary temple in Luxor's West Bank, Egypt. Golden first light striking the limestone colonnades and ramps from a low eastern angle, deep blue pre-dawn sky transitioning to peach above the cliffs, the temple's three tiers clearly visible against the rust-colored Theban cliffs behind, the river valley visible in soft mist below, photorealistic cinematic landscape photography, 35mm lens, professional travel publication quality.",
  },
  {
    key: 'valley',
    name: 'shot-2-valley-of-the-kings',
    prompt:
      "Aerial photograph from a hot air balloon basket looking down at the Valley of the Kings in Luxor Egypt at golden hour, deep shadow lines picking out the rocky outcrops and tomb entrances in the floor of the valley, sandstone cliffs glowing orange in the morning sun, a narrow access road snaking through the wadi, cinematic 70mm telephoto landscape photography, photorealistic, soft warm light, no people visible.",
  },
  {
    key: 'sun',
    name: 'shot-3-sun-crests-hills',
    prompt:
      "Cinematic photograph of the sun cresting the rocky Theban hills east of Luxor Egypt at first light, intense orange and gold backlight flaring over the silhouetted ridgeline, a single hot air balloon silhouetted against the rising sun in the upper left of frame, deep purple lower sky transitioning to amber, photorealistic, telephoto compression, professional landscape photography, no people visible.",
  },
  {
    key: 'karnak',
    name: 'shot-4-karnak-from-west',
    prompt:
      "Wide aerial photograph from a hot air balloon over Luxor at sunrise looking east across the Nile River toward Karnak Temple in the distance, the wide bend of the Nile glowing gold, green farmland and palm groves on the west bank, the massive Karnak temple complex visible on the east bank with its pylons and obelisks catching first light, soft golden cinematic light, 24mm wide angle, photorealistic.",
  },
  {
    key: 'colossi',
    name: 'shot-5-colossi-memnon',
    prompt:
      "Aerial photograph from a hot air balloon over the Theban floodplain in Luxor Egypt, looking down at the two enormous seated stone statues of the Colossi of Memnon, both figures clearly visible on the green farmland with their long shadows extending toward the west in golden hour light, photorealistic 50mm lens cinematic landscape, no people visible.",
  },
  {
    key: 'fleet',
    name: 'shot-6-fleet-formation',
    prompt:
      "Wide aerial photograph of fifteen to twenty hot air balloons of various colors drifting in graceful formation over the Theban necropolis at sunrise, the Nile river and green farmland below catching first light, distant pyramids and temples on the West Bank horizon, soft cream and lavender sky transitioning to gold, breathtaking wide cinematic landscape, professional travel photography, photorealistic, 24mm wide angle.",
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

    console.log('=== Generating 6 photographer shot images (high quality) ===');
    const results: Record<string, string> = {};
    for (const shot of SHOTS) {
      const url = await generateAndUpload(shot.prompt, `tenant-gallery/${TENANT_SLUG}`, shot.name);
      if (url) results[shot.key] = url;
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log('\n=== Paste into SHOT_OPPORTUNITIES (LuxorBalloonHomePage.tsx) ===\n');
    console.log('const SHOT_IMAGES: Record<string, string> = {');
    for (const [key, url] of Object.entries(results)) {
      console.log(`  ${key}: '${url}',`);
    }
    console.log('};');
    console.log(`\nGenerated: ${Object.keys(results).length} / 6`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
