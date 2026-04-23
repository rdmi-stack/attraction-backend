/**
 * Generate Cloudinary images for tours that currently use Unsplash URLs.
 * Uses gpt-image-1.5 model → Cloudinary upload → updates attraction record.
 *
 * Usage: railway run npx ts-node src/scripts/generate-missing-tour-images.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Attraction } from '../models/Attraction';
import { generateImageFromPrompt } from '../services/image-generation.service';
import { uploadBase64Image } from '../services/upload.service';

// Build a prompt tailored to the tour
function buildPrompt(title: string, slug: string, category: string, city: string): string {
  const base = `${title} in ${city}, Egypt.`;

  if (slug.includes('pyramid') || slug.includes('giza') || slug.includes('cairo')) {
    return `${base} Ancient Egyptian pyramids of Giza at golden hour, majestic Sphinx, tourists exploring, warm desert light.`;
  }
  if (slug.includes('luxor') || slug.includes('valley') || slug.includes('karnak')) {
    return `${base} Ancient Luxor temple columns, Valley of the Kings entrance, hieroglyphics, warm sandstone colors.`;
  }
  if (slug.includes('balloon')) {
    return `${base} Colorful hot air balloon floating over the Nile valley at sunrise, ancient temples below.`;
  }
  if (slug.includes('cruise') || slug.includes('felucca') || slug.includes('nile')) {
    return `${base} Traditional boat on the Nile river at sunset, calm waters reflecting golden light.`;
  }
  if (slug.includes('snorkel') || slug.includes('diving') || slug.includes('giftun') || slug.includes('orange-bay') || slug.includes('mahmya')) {
    return `${base} Crystal clear Red Sea turquoise water, coral reefs visible, tropical fish, white sand beach.`;
  }
  if (slug.includes('parasail')) {
    return `${base} Parasailing high above turquoise Red Sea, colorful parachute, speedboat below, stunning coastline.`;
  }
  if (slug.includes('jet-ski') || slug.includes('water-sport') || slug.includes('wakeboard')) {
    return `${base} Exciting water sports on the Red Sea, jet ski spraying water, bright blue ocean, adrenaline action.`;
  }
  if (slug.includes('fishing')) {
    return `${base} Deep sea fishing boat on the Red Sea, rod bending with catch, clear blue water, sunny day.`;
  }
  if (slug.includes('spa')) {
    return `${base} Luxurious spa resort treatment room, ocean view, tropical relaxation, soft lighting.`;
  }
  if (slug.includes('safari') || slug.includes('desert') || slug.includes('quad') || slug.includes('buggy') || slug.includes('camel')) {
    return `${base} Desert safari adventure, golden sand dunes, dramatic desert landscape, sunset colors.`;
  }
  if (slug.includes('food') || slug.includes('street')) {
    return `${base} Colorful Egyptian street food market, spices, traditional dishes, lively bazaar atmosphere.`;
  }
  if (slug.includes('museum') || slug.includes('citadel') || slug.includes('mosque')) {
    return `${base} Historic Egyptian architecture, ornate mosque interior or museum gallery, dramatic lighting.`;
  }
  if (slug.includes('walking') || slug.includes('city-tour') || slug.includes('old-city')) {
    return `${base} Charming narrow streets of old Cairo, colorful buildings, local life, golden hour light.`;
  }

  // Fallback
  return `${base} Professional travel photography, ${category} experience, beautiful Egyptian scenery.`;
}

async function main(): Promise<void> {
  await connectDatabase();

  try {
    // Find all tours with Unsplash or placeholder images
    const tours = await Attraction.find({
      status: 'active',
      $or: [
        { 'images.0': { $regex: /unsplash/i } },
        { 'images.0': { $regex: /placeholder/i } },
      ],
    }).select('slug title category destination images').lean();

    console.log(`Found ${tours.length} tours needing image generation.\n`);

    let success = 0;
    let failed = 0;

    for (const tour of tours) {
      const city = tour.destination?.city || 'Hurghada';
      const prompt = buildPrompt(tour.title, tour.slug, tour.category, city);

      console.log(`[${success + failed + 1}/${tours.length}] ${tour.title}`);
      console.log(`  Prompt: ${prompt.substring(0, 100)}...`);

      try {
        // Generate image
        const { base64, mimeType } = await generateImageFromPrompt({
          prompt,
          size: '1536x1024',
          quality: 'medium',
          outputFormat: 'jpeg',
        });

        // Upload to Cloudinary
        const dataUri = `data:${mimeType};base64,${base64}`;
        const folder = `tours/${tour.slug}`;
        const uploaded = await uploadBase64Image(dataUri, folder);

        // Update the first image in the attraction record
        const newImages = [uploaded.url, ...tour.images.slice(1).filter((img: string) => !img.includes('unsplash') && !img.includes('placeholder'))];

        await Attraction.updateOne(
          { _id: tour._id },
          { $set: { images: newImages } }
        );

        console.log(`  ✅ ${uploaded.url}\n`);
        success++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ❌ FAILED: ${msg}\n`);
        failed++;
      }

      // Rate limit: small pause between API calls
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
