import dotenv from 'dotenv';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

dotenv.config({ path: '.env.local' });

const prompts = [
  'Makadi Horse Club homepage hero image. Photorealistic premium travel campaign scene of an elegant Arabian horse with rider moving along the Makadi Bay shoreline at sunrise, golden light, turquoise Red Sea, soft desert mountains, refined composition, cinematic and luxurious, no text, no logos, no watermark.',
  'Makadi Horse Club homepage hero image. Photorealistic premium equestrian scene with two elegant horses and riders crossing a wide desert trail near Makadi Bay, glowing sunset sky, warm sand textures, high-end tourism photography, dramatic but natural lighting, no text, no logos, no watermark.',
  'Makadi Horse Club homepage hero image. Photorealistic luxury horse riding scene on the beach in Makadi Bay, Arabian horse in motion with sea spray, vivid blue water, golden-hour light, expansive hero composition for website banner, no text, no logos, no watermark.',
];

async function main() {
  const urls: string[] = [];

  for (const prompt of prompts) {
    const generated = await generateImageFromPrompt({
      prompt,
      size: '1536x1024',
      quality: 'high',
      outputFormat: 'jpeg',
    });

    const upload = await uploadBase64Image(
      `data:${generated.mimeType};base64,${generated.base64}`,
      'tenant-heroes/makadi-horse-club'
    );

    urls.push(upload.url);
  }

  console.log(JSON.stringify(urls, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
