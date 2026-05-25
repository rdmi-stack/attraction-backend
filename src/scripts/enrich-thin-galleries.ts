/**
 * Enrich thin tour galleries across six tenants.
 *
 * Many tours were seeded with a single cover image, which makes their
 * detail-page galleries look sparse. This script finds each tenant's tours
 * with fewer than 3 images and tops them up to 3–4 images by REUSING
 * existing, theme-matched Cloudinary URLs that are already present on other
 * tours in the database. No new images are generated and no images are
 * downloaded — every URL below was harvested from live tours in the same
 * "theme family" and verified present in the DB.
 *
 * Per-tenant theming (no jarring mismatches):
 *   - royal-cruise-hurghada   → CRUISE   (real boat/yacht/snorkel-boat photos:
 *                                          royal-seascope, rosetta-classic-boat,
 *                                          elite-vip, nefertari, pirates, sunmarine)
 *   - cairo-adventures        → CAIRO    (Cairo/Giza/pyramids/museum/Nile photos
 *                                          from the egypt-tour-booking + cairo-night-cruise
 *                                          Cairo tours — Hurghada/desert/horse noise excluded)
 *   - camel-safari-hurghada   → DESERT   (desert/camel/quad/safari photos from
 *                                          quad-tour-safari, safari-sahara-hurghada,
 *                                          makadi-bay-safari-center desert tours)
 *   - parasailing-hurghada    → WATER    (sea/beach/boat/watersports photos from
 *                                          orange-bay, giftun, snorkeling, parasailing,
 *                                          royal-seascope / rosetta sea shots, sunmarine)
 *   - safari-red-sea          → DESERT   (same desert safari pool as camel-safari)
 *   - sea-horse-sahl-hashesh  → SEA_HORSE (sea/snorkel/marine + horse-on-beach photos:
 *                                          WATER pool plus a few beach horse-riding shots)
 *
 * Behaviour:
 *   - Only ACTIVE tours are touched. Archived/test tours (e.g. *-5boiy, test-*)
 *     are left untouched — back-filling junk data is out of scope.
 *   - A tour's own existing image(s) are always kept first; theme-matched URLs
 *     are appended (rotated per tour index for gallery variety) until the tour
 *     reaches the target of 4 unique images.
 *   - Tours already at >= 3 images are skipped. Re-running is a no-op.
 *   - Only the `images` array is modified. Nothing else on the tour, and
 *     nothing on the tenant, is changed.
 *
 * Idempotent. Run via:
 *   npx ts-node src/scripts/enrich-thin-galleries.ts
 */

import { connectDatabase, disconnectDatabase } from '../config/database';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';

const MIN_IMAGES = 3; // a tour is "thin" below this
const TARGET_IMAGES = 4; // top thin tours up to this

/* ------------------------------------------------------------------ *
 * Theme-matched image pools — every URL below is an existing Cloudinary
 * (or, where the source tour used one, Unsplash) image already stored on
 * a live tour in the database. Curated by theme so galleries stay coherent.
 * ------------------------------------------------------------------ */

// CRUISE — real boat / yacht / deck / snorkel-boat photography.
const CRUISE: string[] = [
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648880/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-01.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648881/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-02.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648882/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-03.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648884/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-04.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648886/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-05.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648887/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-06.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648892/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-03.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648893/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-04.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648897/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-01.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648898/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-02.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648900/attractions-network/tenant-heroes/nefertari-cruise/real/nefertari-cruise-real-04.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648905/attractions-network/tenant-heroes/elite-vip-cruise/real/elite-vip-cruise-real-01.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648907/attractions-network/tenant-heroes/elite-vip-cruise/real/elite-vip-cruise-real-02.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648909/attractions-network/tenant-heroes/elite-vip-cruise/real/elite-vip-cruise-real-03.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648917/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-01.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648919/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-02.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648920/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-03.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676318/attractions-network/tours/sunmarine/opzicyy79zzbuc0nbeti.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676165/attractions-network/tours/sunmarine/bjfqqnau9dfzqgrbji73.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676006/attractions-network/tours/sunmarine/i6tia6pjwyxgtm5cmshs.jpg',
];

// CAIRO — Cairo / Giza / pyramids / museum / felucca / Nile-dinner photography.
const CAIRO: string[] = [
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001971/attractions-network/tours/egyptian-museum-vip-tour/p78zg7y36d6hfcznkhg4.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002026/attractions-network/tours/cairo-old-city-walking-tour/pamgtqhw4rgkvvce7p6m.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002138/attractions-network/tours/cairo-sound-light-show-pyramids/cfj2tbpsdcpxl67toidx.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001120/attractions-network/tours/cairo-night-cruise/lduxyykpsoerj203hc0d.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001906/attractions-network/tours/pyramids-excursions/lsivfpcyso3hojmabuh0.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002079/attractions-network/tours/cairo-sunset-felucca-ride/bu61ptesnyqbgubqewj6.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002250/attractions-network/tours/cairo-quad-bike-pyramids/zjrsutlwuoayaomskpmk.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002306/attractions-network/tours/cairo-food-street-tour/hid9eupdazakgeibsf07.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001229/attractions-network/tours/cairo-tours-packages/ndeswj77guwvyf7vgz7g.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002197/attractions-network/tours/cairo-citadel-mosque-tour/m1jrqai4eytj6koa7rz2.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001168/attractions-network/tours/cairo-tour-from-hurghada/tgdcmnxqu6ydwcxx5dxq.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778864632/attractions-network/tours/sunset-felucca-dinner/cegvwihkvodnaptormqr.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778864661/attractions-network/tours/classic-5-course-nile-dinner/e6jasunxojlzxrfbwqff.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778864688/attractions-network/tours/couples-anniversary-cruise/fscgv4omk6cclgwiq6uk.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778864715/attractions-network/tours/tanoura-folkloric-dinner/k0oqmidsjonczlzvxjog.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778864833/attractions-network/tours/late-night-jazz-felucca/g1iwzdad0ktpihtzpph5.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001679/attractions-network/tours/luxor-tour-from-hurghada/trkxynvxjgddy5llqnd2.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002473/attractions-network/tours/cairo-tour-from-hurghada-experience/vjy30yf7x3vqusyylely.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002416/attractions-network/tours/cairo-tours-packages-deal/jxe7a30tl9kltzifq4xi.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002538/attractions-network/tours/luxor-tour-from-hurghada-excursion/xhxq1ff3r5qdvuuafeog.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776002600/attractions-network/tours/pyramids-excursions-guided-tour/x539yqud5nlwcemv5xfv.jpg',
];

// DESERT — desert / camel / quad / buggy / safari photography.
const DESERT: string[] = [
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778160862/attractions-network/attractions-network/tours/quad-tour-safari/m04cr7msdwzuebtwhqla.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778160934/attractions-network/attractions-network/tours/quad-tour-safari/mgafzr8zwdlaexbgkuiy.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778160992/attractions-network/attractions-network/tours/quad-tour-safari/kk2swuygorskyaw77qjk.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778161052/attractions-network/attractions-network/tours/quad-tour-safari/veotr7lfz3rgkskvtlbx.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778161114/attractions-network/attractions-network/tours/quad-tour-safari/suiuos0amlo3mbusepof.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778139640/attractions-network/attractions-network/tours/safari-sahara-hurghada/txyapftck8hvc3wgkmvj.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778139699/attractions-network/attractions-network/tours/safari-sahara-hurghada/dvaqjji90lpemybdhpwy.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778139931/attractions-network/attractions-network/tours/safari-sahara-hurghada/uafbwlvolmzeqm5tqdso.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778139983/attractions-network/attractions-network/tours/safari-sahara-hurghada/pwmpxoiqghpkxpgggmth.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778140040/attractions-network/attractions-network/tours/safari-sahara-hurghada/t1m0oqikz7qos3rmat2j.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778140179/attractions-network/attractions-network/tours/safari-sahara-hurghada/dzxs6yua6wqmyzdfh9i3.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778140238/attractions-network/attractions-network/tours/safari-sahara-hurghada/rv22fbuxxihnaeleum6i.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1778140285/attractions-network/attractions-network/tours/safari-sahara-hurghada/yyluqpzuvsxdi7lsgduw.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776010705/attractions-network/tours/makadi-oasis-sunset-camel-stargazing/rcc7cixkbhfzhn3l6dpj.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776010732/attractions-network/tours/makadi-desert-safari-quad-buggy-dinner/qtedamgnm5fg5hojraxe.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776010763/attractions-network/tours/makadi-desert-experience-quad-buggy-camel/u0o2ucomcjcau5m5mvew.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776010800/attractions-network/tours/makadi-desert-safari-camel-dinner-show/rxkmfnkdc3o2auhnyszm.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776010872/attractions-network/tours/makadi-quad-buggy-oriental-show/tjllm4wuctyhwuk0w0i0.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776010902/attractions-network/tours/makadi-atv-safari-sand-mountain/czdk8hr8wr9lmwecpedr.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776011050/attractions-network/tours/makadi-desert-quad-safari-dinner-stargazing/toqzimq0ypql3scrw0oo.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776011081/attractions-network/tours/makadi-sea-mountains-atv-tour/xy5aisv4ts7txyijf3qf.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776011110/attractions-network/tours/makadi-mount-shaib-sandboarding/hvexlru3t2neljr1ps3m.jpg',
];

// WATER — sea / beach / boat / snorkel / watersports photography.
const WATER: string[] = [
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001284/attractions-network/tours/giftun-island-hurghada/gzgrjpjgullgu4aiatfp.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001511/attractions-network/tours/hurghada-snorkeling/em754jzdawhzqpz1knpi.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001800/attractions-network/tours/orange-bay-tours/ql8gdkgqaymrp7k8x9x1.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001852/attractions-network/tours/parasailing-hurghada/ep1ketqx2eggrcbmclnc.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001398/attractions-network/tours/hurghada-luxury-cruise/qynzkhlb29frseuh3gdn.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776001740/attractions-network/tours/makadi-bay-snorkeling/dqgky1xrtcddcepr82g4.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648880/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-01.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648882/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-03.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648884/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-04.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648886/attractions-network/tenant-heroes/royal-seascope/real/royal-seascope-real-05.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648892/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-03.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648893/attractions-network/tenant-heroes/pirates-premier-sailing/real/pirates-premier-sailing-real-04.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648917/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-01.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1779648919/attractions-network/tenant-heroes/rosetta-classic-boat/real/rosetta-classic-boat-real-02.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676318/attractions-network/tours/sunmarine/opzicyy79zzbuc0nbeti.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676165/attractions-network/tours/sunmarine/bjfqqnau9dfzqgrbji73.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775676006/attractions-network/tours/sunmarine/i6tia6pjwyxgtm5cmshs.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775675197/attractions-network/tours/sunmarine/rglwjdkwadujjtxli33j.jpg',
];

// SEA_HORSE — sea/snorkel/marine WATER pool plus a few beach horse-riding shots.
const SEA_HORSE: string[] = [
  ...WATER,
  // Beach / desert horse-riding shots (makadi-horse-club gallery) for the
  // tenant's horse-on-the-beach identity.
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430074/attractions-network/attractions/ai-generated/makadi-horse-club/tlxjv2gy6vidk66kvzcq.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1775430126/attractions-network/attractions/ai-generated/makadi-horse-club/jt1neyd5e4rms8dg3klj.jpg',
  'https://res.cloudinary.com/dm3sxllch/image/upload/v1776010990/attractions-network/tours/makadi-sunset-oasis-horse-ride-stargazing/jskoh5jpryucaaju5j6b.jpg',
];

interface TenantPlan {
  slug: string;
  theme: string;
  pool: string[];
}

const PLAN: TenantPlan[] = [
  { slug: 'royal-cruise-hurghada', theme: 'CRUISE', pool: CRUISE },
  { slug: 'cairo-adventures', theme: 'CAIRO', pool: CAIRO },
  { slug: 'camel-safari-hurghada', theme: 'DESERT', pool: DESERT },
  { slug: 'parasailing-hurghada', theme: 'WATER', pool: WATER },
  { slug: 'safari-red-sea', theme: 'DESERT', pool: DESERT },
  { slug: 'sea-horse-sahl-hashesh', theme: 'SEA_HORSE', pool: SEA_HORSE },
];

/* eslint-disable @typescript-eslint/no-explicit-any */

async function enrichTenant(plan: TenantPlan): Promise<void> {
  const tenant = await Tenant.findOne({ slug: plan.slug });
  if (!tenant) {
    console.log(`\n[${plan.slug}] MISSING tenant — skipping.`);
    return;
  }

  // Only enrich active tours. Archived/test docs are deliberately left alone.
  const tours = await Attraction.find({ tenantIds: tenant._id, status: 'active' });

  console.log(`\n────────────────────────────────────────────────────────`);
  console.log(`[${plan.slug}] theme=${plan.theme} · pool=${plan.pool.length} imgs · active tours=${tours.length}`);

  let updated = 0;
  let alreadyOk = 0;
  let skippedNoCover = 0;

  for (let i = 0; i < tours.length; i++) {
    const tour: any = tours[i];
    const existing: string[] = (tour.images || []).filter(Boolean);

    if (existing.length >= MIN_IMAGES) {
      alreadyOk += 1;
      continue;
    }

    if (existing.length === 0) {
      // No cover to anchor on — a data anomaly for an active tour. Report and
      // skip rather than fabricate a cover (keeps "existing image first" true).
      skippedNoCover += 1;
      console.log(`  ⚠ ${String(tour.slug).padEnd(48)} 0 images (no cover) — skipped`);
      continue;
    }

    // Rotate the pool by tour index so each tour gets a different mix.
    const rotated = plan.pool.map((_, j) => plan.pool[(i + j) % plan.pool.length]);

    const gallery: string[] = [];
    for (const url of [...existing, ...rotated]) {
      if (url && !gallery.includes(url)) gallery.push(url);
      if (gallery.length >= TARGET_IMAGES) break;
    }

    if (gallery.length > existing.length) {
      tour.images = gallery;
      await tour.save();
      updated += 1;
      console.log(`  ✓ ${String(tour.slug).padEnd(48)} ${existing.length} → ${gallery.length} images`);
    } else {
      alreadyOk += 1;
    }
  }

  const afterCounts = (await Attraction.find({ tenantIds: tenant._id, status: 'active' }).select('images').lean())
    .map((t: any) => (t.images || []).length);
  const stillThin = afterCounts.filter((c) => c < MIN_IMAGES).length;

  console.log(
    `  → enriched ${updated}, already ≥${MIN_IMAGES}: ${alreadyOk}` +
      (skippedNoCover ? `, no-cover skipped: ${skippedNoCover}` : '') +
      ` · active tours still <${MIN_IMAGES} imgs: ${stillThin}`
  );
}

async function main(): Promise<void> {
  await connectDatabase();
  try {
    console.log('\n=== Enrich thin tour galleries (theme-matched, reuse existing images) ===');
    for (const plan of PLAN) {
      await enrichTenant(plan);
    }
    console.log('\n✅ Done.\n');
  } finally {
    await disconnectDatabase();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
  process.exit(1);
});
