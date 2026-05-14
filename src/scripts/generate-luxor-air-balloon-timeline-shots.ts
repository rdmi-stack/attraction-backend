/**
 * Generate 6 cinematic timeline-step images for the Luxor Air Balloon
 * homepage flight timeline. Each matches a moment in the flight narrative:
 *   04:30 pickup → 05:15 briefing → 05:45 liftoff → 06:10 sunrise →
 *   07:00 landing → 08:00 champagne breakfast.
 * Uploads to Cloudinary; prints URLs for paste-in to TIMELINE_IMAGES.
 *
 * Usage:
 *   railway run npx ts-node src/scripts/generate-luxor-air-balloon-timeline-shots.ts
 *   (or local)  npx ts-node src/scripts/generate-luxor-air-balloon-timeline-shots.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'luxor-air-balloon';

const STEPS = [
  {
    key: 'pickup',
    name: 'timeline-1-pickup',
    prompt:
      "Cinematic pre-dawn photograph of a luxury black SUV waiting at a softly-lit upscale Egyptian hotel entrance in Luxor at 4:30 AM, single guest in casual travel clothes walking from the lobby holding a paper cup of hot coffee, driver standing beside open door, soft warm lamplight on stone facade, deep cobalt-blue night sky just beginning to turn purple at horizon, photorealistic travel photography, no readable signage.",
  },
  {
    key: 'briefing',
    name: 'timeline-2-briefing',
    prompt:
      "Cinematic photograph at a Luxor balloon launch site in the pre-dawn lavender light, large orange-and-cream hot air balloon envelope half-inflated and glowing from within as flame burners roar, crew tending lines, a small group of passengers in casual travel clothes listening to a pilot in a flight suit, dark silhouettes of palm trees and distant cliffs behind, photorealistic wide angle, soft warm light spilling from the burners.",
  },
  {
    key: 'liftoff',
    name: 'timeline-3-liftoff',
    prompt:
      "Cinematic photograph of an orange-and-cream hot air balloon just lifting off the ground at sunrise on Luxor's West Bank Egypt, basket about three meters above the desert floor, ground crew releasing the tether ropes, the long shadow of the balloon stretching across the sand, pink and gold pre-sunrise sky, distant Theban cliffs catching first light, photorealistic professional landscape photography.",
  },
  {
    key: 'sunrise',
    name: 'timeline-4-sunrise',
    prompt:
      "Aerial photograph from inside a hot air balloon basket looking down at Hatshepsut's terraced mortuary temple at first light, the entire West Bank of Luxor catching golden sunrise, deep shadow lines from the eastern cliffs, the wicker basket edge visible in the lower frame, distant Valley of the Kings on the right, photorealistic cinematic landscape, professional travel photography, warm golden palette.",
  },
  {
    key: 'landing',
    name: 'timeline-5-landing',
    prompt:
      "Cinematic photograph of an orange-and-cream hot air balloon basket settling gently onto green Egyptian farmland near Luxor in the soft early morning light, the envelope still partially inflated above, ground crew approaching with a retrieval truck visible in the distance, cane fields and palm groves around, warm golden hour, photorealistic professional landscape.",
  },
  {
    key: 'champagne',
    name: 'timeline-6-champagne',
    prompt:
      "Cinematic close-up photograph of an elegant outdoor breakfast spread on a white linen table at golden hour in a Luxor cane field — chilled champagne flutes catching the morning light, fresh Egyptian breads, fruit, dates, and a printed flight certificate with a wax seal beside one flute, soft warm sunlight on the linen, blurred deflated orange balloon and palm grove background, photorealistic editorial food photography.",
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

    console.log('=== Generating 6 timeline step images (high quality) ===');
    const results: Record<string, string> = {};
    for (const step of STEPS) {
      const url = await generateAndUpload(step.prompt, `tenant-timeline/${TENANT_SLUG}`, step.name);
      if (url) results[step.key] = url;
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log('\n=== Paste into TIMELINE_IMAGES (LuxorBalloonHomePage.tsx) ===\n');
    console.log('const TIMELINE_IMAGES: string[] = [');
    for (const step of STEPS) {
      const url = results[step.key] || '';
      console.log(`  '${url}', // ${step.key}`);
    }
    console.log('];');
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
