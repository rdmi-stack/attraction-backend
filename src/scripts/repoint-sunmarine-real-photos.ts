/**
 * Repoint the Egypt Sunmarine MOTHER portfolio to real fleet photos, and
 * swap the one borderline Classic photo (indoor dive-centre w/ 3rd-party
 * branding) for a clean classic-boat helm shot.
 *
 * Context: the 5 boat tenants already use real curated photos (verified).
 * Only the mother site (egypt-sunmarine) still showed AI-generated images on
 * its own 14 cruise products + 1 hero (a stock-style mega-yacht). This script:
 *
 *   1. Uploads the staged Classic replacement (IMG_4219 helm shot) and swaps
 *      rosetta-classic-boat-real-05 -> -real-07 across the Classic tenant
 *      (heroImages + every Classic tour image).
 *   2. Sets egypt-sunmarine.heroImages to 5 real fleet-identity shots
 *      (SeaScope sub, Pirates galleon, Nefertari cruiser, Elite VIP deck,
 *      Classic helm).
 *   3. Repoints egypt-sunmarine's OWN 14 cruise tours (the ones still on AI
 *      images) to the matching boat's real photo pool, by keyword. Boat tours
 *      that already use /real/ photos are left untouched.
 *
 * Idempotent: re-running re-uploads the helm shot (overwrite) and re-applies
 * the same real URLs. Run via:
 *   npx ts-node src/scripts/repoint-sunmarine-real-photos.ts
 */

import * as fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/env';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

const CLASSIC_SLUG = 'rosetta-classic-boat';
const CLASSIC_REPLACEMENT = '/tmp/sunmarine-stage/classic-real-07.jpg';

/* boat slug pools are read live from each tenant's heroImages (the 6 real photos) */
const BOAT_SLUGS = [
  'royal-seascope',
  'pirates-premier-sailing',
  'nefertari-cruise',
  'elite-vip-cruise',
  'rosetta-classic-boat',
] as const;

/* keyword -> boat slug, evaluated in order (specific before generic) */
const RULES: Array<{ re: RegExp; slug: string }> = [
  { re: /seascope|submarine/i, slug: 'royal-seascope' },
  { re: /nefertari/i, slug: 'nefertari-cruise' },
  { re: /pirate|white[-\s]?island|orange[-\s]?bay/i, slug: 'pirates-premier-sailing' },
  { re: /elite|vip/i, slug: 'elite-vip-cruise' },
  { re: /diving/i, slug: 'rosetta-classic-boat' },
  { re: /dolphin/i, slug: 'nefertari-cruise' },
  { re: /sunset/i, slug: 'nefertari-cruise' },
  { re: /ras[-\s]?moham|snorkel/i, slug: 'elite-vip-cruise' },
];

function matchBoat(slug: string, title: string): string {
  const hay = `${slug} ${title}`.toLowerCase();
  for (const r of RULES) if (r.re.test(hay)) return r.slug;
  return 'royal-seascope';
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function main(): Promise<void> {
  await connectDatabase();
  try {
    /* ── 1. Upload the Classic helm replacement + swap real-05 -> real-07 ── */
    if (!fs.existsSync(CLASSIC_REPLACEMENT)) {
      throw new Error(`Missing staged replacement: ${CLASSIC_REPLACEMENT}`);
    }
    console.log('\n— Classic /05 swap —');
    const up = await cloudinary.uploader.upload(CLASSIC_REPLACEMENT, {
      folder: `attractions-network/tenant-heroes/${CLASSIC_SLUG}/real`,
      public_id: `${CLASSIC_SLUG}-real-07`,
      overwrite: true,
      resource_type: 'image',
    });
    const url07 = up.secure_url;
    console.log(`  ↑ uploaded ${CLASSIC_SLUG}-real-07`);

    const isOld05 = (u: string) => u.includes(`${CLASSIC_SLUG}-real-05.`);
    const classic = await Tenant.findOne({ slug: CLASSIC_SLUG });
    if (!classic) throw new Error('classic tenant not found');
    (classic as any).heroImages = ((classic as any).heroImages || []).map((u: string) => (isOld05(u) ? url07 : u));
    await classic.save();
    let classicToursTouched = 0;
    const classicTours = await Attraction.find({ tenantIds: classic._id });
    for (const t of classicTours) {
      const imgs: string[] = (t as any).images || [];
      if (imgs.some(isOld05)) {
        (t as any).images = imgs.map((u) => (isOld05(u) ? url07 : u));
        await t.save();
        classicToursTouched++;
      }
    }
    console.log(`  ✓ swapped real-05 → real-07 (hero + ${classicToursTouched} classic tours)`);

    /* ── 2. Build boat real-photo pools from each boat's heroImages ── */
    const pools: Record<string, string[]> = {};
    for (const slug of BOAT_SLUGS) {
      const t = await Tenant.findOne({ slug });
      pools[slug] = ((t as any)?.heroImages || []).filter((u: string) => u.includes('/real/'));
    }
    const heroFor = (slug: string) => pools[slug][0];

    /* ── 3a. egypt-sunmarine hero = 5 fleet-identity shots ── */
    console.log('\n— egypt-sunmarine mother portfolio —');
    const mother = await Tenant.findOne({ slug: 'egypt-sunmarine' });
    if (!mother) throw new Error('egypt-sunmarine tenant not found');
    const heroes = [
      heroFor('royal-seascope'),
      heroFor('pirates-premier-sailing'),
      heroFor('nefertari-cruise'),
      heroFor('elite-vip-cruise'),
      url07, // classic helm shot
    ].filter(Boolean);
    (mother as any).heroImages = heroes;
    await mother.save();
    console.log(`  ✓ heroImages set to ${heroes.length} real fleet shots`);

    /* ── 3b. repoint mother's OWN tours (those NOT already on /real/ photos) ── */
    const motherTours = await Attraction.find({ tenantIds: mother._id });
    const offset: Record<string, number> = {};
    let repointed = 0,
      skipped = 0;
    for (const t of motherTours) {
      const a: any = t;
      const imgs: string[] = a.images || [];
      const alreadyReal = imgs.some((u) => u.includes('/real/'));
      if (alreadyReal) {
        skipped++;
        continue;
      }
      const boat = matchBoat(a.slug || '', a.title || '');
      const pool = pools[boat] || [];
      if (pool.length === 0) {
        skipped++;
        continue;
      }
      const off = offset[boat] || 0;
      offset[boat] = off + 1;
      a.images = Array.from({ length: 4 }, (_, j) => pool[(off + j) % pool.length]);
      await t.save();
      repointed++;
      console.log(`  ✓ ${(a.slug || '').padEnd(46)} → ${boat}`);
    }
    console.log(`\n  repointed: ${repointed} | skipped (already real boat tours): ${skipped}`);
    console.log('\n✅ Sunmarine mother portfolio now uses real fleet photos only.\n');
  } finally {
    await disconnectDatabase();
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
