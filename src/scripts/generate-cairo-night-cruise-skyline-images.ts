/**
 * Generate 6 Cairo-skyline-from-the-deck images for the Cairo Night Cruise
 * destinations pages (Cairo Tower, Tahrir Bridge, Roda Island, Manial Palace,
 * Maadi Corniche, Garden City).
 *
 * Usage:
 *   railway run npx ts-node src/scripts/generate-cairo-night-cruise-skyline-images.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

const TENANT_SLUG = 'cairo-night-cruise';

const LANDMARK_PROMPTS = [
  {
    name: 'cairo-tower',
    prompt: "Cinematic night photograph of the Cairo Tower lit honey-gold seen from the Nile river, taken from a traditional Egyptian felucca on the water with the foreground out of focus showing the sail rigging and candlelight reflections, the 187-metre brutalist concrete tower glowing against a deep blue sky, photorealistic professional travel photography, warm cool color contrast, 16:9.",
  },
  {
    name: 'tahrir-bridge',
    prompt: "Cinematic night photograph of the Tahrir Bridge in Cairo with its four iconic bronze lions and steel arches lit up at evening, taken from a felucca on the Nile passing beneath, traffic light reflections painting the water in stripes, photorealistic professional travel photography, warm cool color contrast, 16:9.",
  },
  {
    name: 'roda-island',
    prompt: "Cinematic evening photograph of Roda Island and the ancient Nilometer well in Cairo on the Nile, taken from a passing felucca, the small palace and gardens lit warmly against the river, photorealistic professional travel photography, warm color palette, 16:9.",
  },
  {
    name: 'manial-palace',
    prompt: "Cinematic night photograph of the Manial Palace on Roda Island in Cairo, the white Ottoman-Mamluk facade uplit dramatically against the dark sky, walled gardens visible in the foreground, taken from a felucca on the Nile, photorealistic professional travel photography, warm cool color contrast, 16:9.",
  },
  {
    name: 'maadi-corniche',
    prompt: "Cinematic night photograph of the Maadi Corniche in Cairo, leafy promenade lined with bistro lights and cafes glowing warmly along the Nile, taken from a passing felucca on the water with the sail visible at the edge of frame, photorealistic professional travel photography, warm romantic color palette, 16:9.",
  },
  {
    name: 'garden-city',
    prompt: "Cinematic dusk photograph of Garden City quarter in Cairo, old Belle Époque villas and tree-lined cobbled crescents with lampposts just turning on, the British Embassy and Hilton Nile visible, taken from the Nile riverside, photorealistic professional travel photography, soft warm dusk color palette, 16:9.",
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

    console.log('=== Generating 6 skyline landmark images (medium quality) ===');
    for (const landmark of LANDMARK_PROMPTS) {
      await generateAndUpload(landmark.prompt, `tenant-skyline/${TENANT_SLUG}`, landmark.name);
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log('\n✅ Skyline imagery generated. URLs above can be referenced from /destinations/* pages.');
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
