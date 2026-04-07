import dotenv from 'dotenv';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

dotenv.config({ path: '.env.local' });

const prompts = [
  // Equestrian login — portrait orientation (left panel of split layout)
  {
    prompt: 'Makadi Horse Club login page background. Photorealistic premium equestrian scene, elegant Arabian horse and rider walking along Makadi Bay beach at golden hour, warm sunset light reflecting on wet sand, turquoise Red Sea in background, soft desert mountains, portrait composition for website side panel, cinematic luxury travel photography, no text, no logos, no watermark.',
    folder: 'auth/equestrian',
    name: 'login',
    size: '1024x1536' as const,
  },
  // Equestrian signup — different scene
  {
    prompt: 'Makadi Horse Club registration page background. Photorealistic premium scene of horse stable interior at Makadi Bay, warm golden afternoon light streaming through wooden beams, beautiful Arabian horse being groomed, leather saddles and equestrian gear visible, cozy and inviting atmosphere, portrait composition for website side panel, premium travel photography, no text, no logos, no watermark.',
    folder: 'auth/equestrian',
    name: 'register',
    size: '1024x1536' as const,
  },
  // Luxury login
  {
    prompt: 'Luxury attractions booking login page. Photorealistic premium travel scene, elegant couple enjoying a private sunset yacht tour in the Red Sea near Hurghada, golden champagne light, turquoise water, warm sophisticated atmosphere, portrait composition for website panel, high-end tourism photography, no text, no logos, no watermark.',
    folder: 'auth/luxury',
    name: 'login',
    size: '1024x1536' as const,
  },
];

async function main() {
  console.log('Generating auth page images...\n');
  const results: Record<string, string> = {};

  for (const { prompt, folder, name, size } of prompts) {
    console.log(`Generating: ${folder}/${name}...`);
    try {
      const generated = await generateImageFromPrompt({
        prompt,
        size,
        quality: 'high',
        outputFormat: 'jpeg',
      });

      const upload = await uploadBase64Image(
        `data:${generated.mimeType};base64,${generated.base64}`,
        `attractions-network/${folder}`
      );

      results[`${folder}/${name}`] = upload.url;
      console.log(`  ✓ ${upload.url}\n`);
    } catch (error) {
      console.error(`  ✗ Failed: ${error}\n`);
    }
  }

  console.log('\n=== Results ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('\nPaste these URLs into the auth layout:');
  for (const [key, url] of Object.entries(results)) {
    console.log(`  ${key}: ${url}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
