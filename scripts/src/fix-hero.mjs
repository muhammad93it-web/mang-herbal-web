// One-off: produce a clean 4:5 hero image with a fully visible brand badge.
// The source square image carries an old half-cropped watermark at its
// bottom-right; we crop to the displayed 4:5 window, hide the old mark's
// remnant under a color-matched patch, then stamp the standard opaque badge.
// Run from inside scripts/ so sharp resolves:  node src/fix-hero.mjs
import sharp from 'sharp';

const SRC = '../attached_assets/generated_images/herbal-hero.jpg';
const LOGO = '../attached_assets/logo_png_be_back_1784753437461.png';
const OUT = '../artifacts/mang-herbal/public/hero.jpg';

const W = 819; // 4:5 of 1024 height (819.2 -> 819)
const H = 1024;
const LEFT = 102; // center crop of the 1024-wide source

const cropped = await sharp(SRC).extract({ left: LEFT, top: 0, width: W, height: H }).toBuffer();

// Sample the dark corner just above the patch area so the patch blends in.
const stats = await sharp(cropped).extract({ left: 700, top: 750, width: 110, height: 50 }).stats();
const [r, g, b] = stats.channels.map((c) => Math.round(c.mean));

// Patch over the old watermark remnant (right edge, bottom corner).
const patchSvg = Buffer.from(
  `<svg width="${W}" height="${H}"><rect x="720" y="810" width="${W - 720}" height="${H - 810}" fill="rgb(${r},${g},${b})"/></svg>`
);

// Fresh badge: opaque near-black disk + gold logo, fully inside the frame.
const disk = Math.round(W * 0.22);
const margin = Math.round(W * 0.016);
const cx = W - margin - disk / 2;
const cy = H - margin - disk / 2;
const diskSvg = Buffer.from(
  `<svg width="${W}" height="${H}"><circle cx="${cx}" cy="${cy}" r="${disk / 2}" fill="#0A0A0A"/></svg>`
);
const logoSize = Math.round(disk * 0.88);
const logoBuf = await sharp(LOGO).resize(logoSize, logoSize, { fit: 'inside' }).png().toBuffer();
const logoMeta = await sharp(logoBuf).metadata();

await sharp(cropped)
  .composite([
    { input: patchSvg, top: 0, left: 0 },
    { input: diskSvg, top: 0, left: 0 },
    { input: logoBuf, top: Math.round(cy - logoMeta.height / 2), left: Math.round(cx - logoMeta.width / 2) },
  ])
  .jpeg({ quality: 86 })
  .toFile(OUT);

console.log('hero written:', OUT, `${W}x${H}`, `patch rgb(${r},${g},${b})`);
