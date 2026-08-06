// One-off: convert the owner's new product packshots (attached_assets/*.png)
// into optimized JPGs in artifacts/mang-herbal/public/products/, and build a
// side-by-side composite of the lightening cream + orange soap (sold as a set).
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "attached_assets");
const OUT = path.join(ROOT, "artifacts/mang-herbal/public/products");

const MAX_EDGE = 1200;
const QUALITY = 82;

const singles = [
  ["tar_shampoo_1786011478711.png", "tar-shampoo.jpg"],
  ["karkar_shampoo_1786011478711.png", "karkar-shampoo.jpg"],
  ["egg_mask_1786011478712.png", "egg-mask.jpg"],
  ["egg_cream_palla_1786011478712.png", "egg-cream-spots.jpg"],
  ["egg_cream_chrch_w_lochy_1786011478712.png", "egg-cream-wrinkle.jpg"],
  ["kids_molasses_1786011478713.png", "kids-molasses.jpg"],
  ["ginseng_powder_1786011478713.png", "ginseng-tea.jpg"],
  ["vitamin_C_1786011478713.png", "vitamin-c-serum.jpg"],
  ["shrabat_ananas_1786011478714.png", "pineapple-detox.jpg"],
  ["sunscreen_1786011478714.png", "sunscreen-spf60.jpg"],
];

const CREAM = "cream_lighting_1786011478713.png";
const SOAP = "ChatGPT_Image_Aug_6,_2026,_09_57_31_AM_1786011478712.png";

fs.mkdirSync(OUT, { recursive: true });

async function processSingle(srcName, outName) {
  const buf = await sharp(path.join(SRC, srcName))
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, outName), buf);
  const meta = await sharp(buf).metadata();
  console.log(`${outName}: ${meta.width}x${meta.height}, ${(buf.length / 1024).toFixed(0)} KB`);
}

async function composite() {
  // Same height, side by side on white, small gap; cream (blue jar) first.
  const H = 900;
  const GAP = 40;
  const PAD = 40;
  const cream = await sharp(path.join(SRC, CREAM))
    .resize(null, H, { withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .toBuffer();
  const soap = await sharp(path.join(SRC, SOAP))
    .resize(null, Math.round(H * 0.62), { withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .toBuffer();
  const cm = await sharp(cream).metadata();
  const sm = await sharp(soap).metadata();
  const width = PAD + cm.width + GAP + sm.width + PAD;
  const height = H + PAD * 2;
  // Two passes: sharp applies resize before composite in a single pipeline,
  // which shrinks the canvas below the input sizes and errors out.
  const canvas = await sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .composite([
      { input: cream, left: PAD, top: PAD },
      { input: soap, left: PAD + cm.width + GAP, top: Math.round((height - sm.height) / 2) },
    ])
    .png()
    .toBuffer();
  const buf = await sharp(canvas)
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "lightening-set.jpg"), buf);
  const meta = await sharp(buf).metadata();
  console.log(`lightening-set.jpg: ${meta.width}x${meta.height}, ${(buf.length / 1024).toFixed(0)} KB (composite)`);
}

for (const [src, out] of singles) await processSingle(src, out);
await composite();
console.log("done");
