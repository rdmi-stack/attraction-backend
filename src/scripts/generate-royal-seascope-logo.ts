/**
 * Generate the Royal SeaScope brand logo (yellow semi-submarine wordmark)
 * and persist the Cloudinary URL onto tenant.logo.
 *
 * Bypasses the shared image-generation service because that service strips
 * text/logos from prompts. Calls OpenAI gpt-image-1.5 directly.
 *
 * Usage:
 *   npx ts-node src/scripts/generate-royal-seascope-logo.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { uploadBase64Image } from '../services/upload.service';
import { env } from '../config/env';

const TENANT_SLUG = 'royal-seascope';

const LOGO_PROMPT = `Premium brand logo for "Royal SeaScope" — a Red Sea semi-submarine experience.
A bold yellow semi-submarine illustration sits to the left, drawn in a clean modern flat-vector style with a small dorsal periscope tower and a single circular porthole window glowing soft cyan.
To the right of the submarine, the words "ROYAL SEASCOPE" are set in a tall condensed sans-serif (Anton/Bebas style), uppercase, in deep navy (#0A1F4E), perfectly kerned and aligned.
A small thin tagline reads "SEMI-SUBMARINE · RED SEA" centered directly below the wordmark in light gold (#F5A623).
Below the tagline, a subtle horizontal wave-line motif in coral pink.
Background: pure transparent (or pure white) — absolutely flat, no scene, no gradient, no shadow.
High-resolution vector aesthetic, crisp edges, no photographic texture, no watermark, no signature, perfectly readable text, professional travel-brand identity logo, centered composition, generous whitespace around all sides.`;

async function generateLogoBase64(): Promise<string> {
  if (!env.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1.5',
      prompt: LOGO_PROMPT,
      size: '1024x1024',
      quality: 'high',
      output_format: 'png',
    }),
  });

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || 'OpenAI image generation failed');
  }

  const base64 = payload.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error('OpenAI did not return image data');
  }

  return base64;
}

async function main(): Promise<void> {
  await connectDatabase();
  try {
    const tenant = await Tenant.findOne({ slug: TENANT_SLUG });
    if (!tenant) {
      console.error(`Tenant '${TENANT_SLUG}' not found. Run seed-royal-seascope-tenant.ts first.`);
      process.exitCode = 1;
      return;
    }
    console.log(`Tenant: ${tenant.name} (_id=${tenant._id})\n`);

    console.log('=== Generating Royal SeaScope logo (1024x1024 png, high) ===');
    const base64 = await generateLogoBase64();
    const dataUri = `data:image/png;base64,${base64}`;
    const uploaded = await uploadBase64Image(dataUri, `tenant-logos/${TENANT_SLUG}`);
    console.log(`✅ Uploaded: ${uploaded.url}`);

    await Tenant.updateOne({ _id: tenant._id }, { $set: { logo: uploaded.url } });
    console.log(`\n✅ tenant.logo updated → ${uploaded.url}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
