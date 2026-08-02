/**
 * Stamp the Mang Herbal brand seal onto product photos.
 *
 * Geometry (must stay >= these values — see .agents/memory/mang-herbal-setup.md):
 *   - opaque #0A0A0A disk, diameter = 21.5% of image width
 *   - margin from bottom-right corner = 1.37% of image width
 *   - gold logo PNG centered on the disk at 88% of disk size, full opacity
 *
 * Usage (must run from inside scripts/ so sharp resolves):
 *   node src/apply-badge.mjs <image.jpg> [more images...]
 */
import sharp from "sharp";
import path from "node:path";

const LOGO = path.resolve(import.meta.dirname, "../../attached_assets/logo_png_be_back_1784753437461.png");

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node src/apply-badge.mjs <image.jpg> [...]");
  process.exit(1);
}

for (const file of files) {
  const img = sharp(file);
  const { width, height } = await img.metadata();
  if (!width || !height) throw new Error(`No dimensions for ${file}`);

  const disk = Math.round(width * 0.215);
  const margin = Math.round(width * 0.0137);
  const logoSize = Math.round(disk * 0.88);

  const diskSvg = Buffer.from(
    `<svg width="${disk}" height="${disk}"><circle cx="${disk / 2}" cy="${disk / 2}" r="${disk / 2}" fill="#0A0A0A"/></svg>`
  );
  const logoBuf = await sharp(LOGO).resize(logoSize, logoSize, { fit: "inside" }).png().toBuffer();
  const logoMeta = await sharp(logoBuf).metadata();

  const diskLeft = width - margin - disk;
  const diskTop = height - margin - disk;

  const out = await img
    .composite([
      { input: diskSvg, left: diskLeft, top: diskTop },
      {
        input: logoBuf,
        left: diskLeft + Math.round((disk - (logoMeta.width ?? logoSize)) / 2),
        top: diskTop + Math.round((disk - (logoMeta.height ?? logoSize)) / 2),
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  await sharp(out).toFile(file);
  console.log(`Badged: ${file} (${width}x${height}, disk ${disk}px)`);
}
