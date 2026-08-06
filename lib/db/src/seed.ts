/**
 * Seed the database with the Mang Herbal catalog:
 * 3 categories + 12 real products (Kurdish Sorani / Arabic / English).
 *
 * Idempotent and safe on a live database:
 *  - categories are inserted only if their slug is missing
 *  - products are inserted ONLY when the products table is completely empty
 *    (never overwrites data the shop owner has added or edited)
 *
 * Run with: pnpm --filter @workspace/db run seed
 */
import { db } from "./index";
import { categoriesTable, productsTable } from "./schema";

const categories = [
  { slug: "face-care", nameCkb: "چاودێری ڕوو", nameAr: "العناية بالوجه", nameEn: "Face Care" },
  { slug: "hair-care", nameCkb: "چاودێری موو", nameAr: "العناية بالشعر", nameEn: "Hair Care" },
  { slug: "tea-wellness", nameCkb: "چا و بەرهەمی تەندروستی", nameAr: "الشاي والمنتجات الصحية", nameEn: "Tea & Wellness" },
];

const products = [
  {
    nameCkb: "شامپۆی تار ٢٠٠ مل", nameAr: "شامبو القطران ٢٠٠ مل", nameEn: "Tar Shampoo 200ml",
    descCkb: "شامپۆی تار ٢٠٠ مل — بۆ چارەسەری ئێگزیما و سۆریازیس. خورشت و سووربوونەوەی پێستی سەر کەم دەکاتەوە و پێستی سەر پاک و ئارام دەکاتەوە.",
    descAr: "شامبو القطران ٢٠٠ مل — لعلاج الإكزيما والصدفية. يخفف الحكة واحمرار فروة الرأس وينظفها ويهدئها.",
    descEn: "Tar shampoo 200ml — for eczema and psoriasis. Soothes itching and redness, leaving the scalp clean and calm.",
    price: 8000, oldPrice: null, categorySlug: "hair-care", imageUrl: "products/tar-shampoo.jpg",
    badge: null, inStock: true, isFeatured: true, rating: "4.9", reviewCount: 21,
  },
  {
    nameCkb: "شامپۆی کەرکار ٢٠٠ مل", nameAr: "شامبو كركار ٢٠٠ مل", nameEn: "Karkar Shampoo 200ml",
    descCkb: "شامپۆی کەرکار ٢٠٠ مل — بۆ ڕێگریکردن لە هەڵوەرینی قژ و بەهێزکردنی ڕەگی قژ. قژ چڕتر و تەندروستتر دەکات.",
    descAr: "شامبو كركار ٢٠٠ مل — لمنع تساقط الشعر وتقوية جذوره. يمنح الشعر كثافة وصحة.",
    descEn: "Karkar shampoo 200ml — helps prevent hair loss and strengthens roots for thicker, healthier hair.",
    price: 8000, oldPrice: null, categorySlug: "hair-care", imageUrl: "products/karkar-shampoo.jpg",
    badge: null, inStock: false, isFeatured: false, rating: "4.8", reviewCount: 14,
  },
  {
    nameCkb: "ماسکی هێلکە", nameAr: "ماسك البيض", nameEn: "Egg Mask",
    descCkb: "ماسکی هێلکە — دەوڵەمەندە بە کۆلاجین و ڤیتامینی C و E. پێست تێر دەکات و تازەی دەکاتەوە و درەوشانەوەی سروشتی پێدەبەخشێت.",
    descAr: "ماسك البيض — غني بالكولاجين وفيتامين C و E. يغذي البشرة ويجددها ويمنحها إشراقة طبيعية.",
    descEn: "Egg mask — rich in collagen and vitamins C and E. Nourishes and refreshes the skin for a natural glow.",
    price: 10000, oldPrice: null, categorySlug: "face-care", imageUrl: "products/egg-mask.jpg",
    badge: null, inStock: false, isFeatured: false, rating: "4.9", reviewCount: 18,
  },
  {
    nameCkb: "کرێمی هێلکە — دژە چرچولۆچی", nameAr: "كريم البيض — ضد التجاعيد", nameEn: "Egg Cream — Anti-Wrinkle",
    descCkb: "کرێمی هێلکە بۆ چرچولۆچی — هێڵە وردەکان و چرچولۆچی ڕوو کەم دەکاتەوە و پێست نەرمتر و گەنجتر نیشان دەدات.",
    descAr: "كريم البيض للتجاعيد — يقلل الخطوط الدقيقة وتجاعيد الوجه ويجعل البشرة أنعم وأكثر شباباً.",
    descEn: "Egg cream for wrinkles — reduces fine lines and facial wrinkles for smoother, younger-looking skin.",
    price: 15000, oldPrice: null, categorySlug: "face-care", imageUrl: "products/egg-cream-wrinkle.jpg",
    badge: null, inStock: false, isFeatured: false, rating: "4.8", reviewCount: 12,
  },
  {
    nameCkb: "مۆلاسی هەنگوین بۆ منداڵان", nameAr: "عسل مولاس للأطفال", nameEn: "Kids Honey Molasses",
    descCkb: "مۆلاسی هەنگوین بۆ منداڵان — یارمەتی گەشەکردن و زیادکردنی ئارەزووی خواردن دەدات. سروشتی و خۆشە بۆ منداڵان.",
    descAr: "عسل مولاس للأطفال — يساعد على النمو وفتح الشهية. طبيعي ولذيذ للأطفال.",
    descEn: "Kids honey molasses — supports growth and appetite. Natural and tasty for children.",
    price: 20000, oldPrice: null, categorySlug: "tea-wellness", imageUrl: "products/kids-molasses.jpg",
    badge: null, inStock: true, isFeatured: true, rating: "5.0", reviewCount: 26,
  },
  {
    nameCkb: "سێتی کرێمی سپیکەرەوە و سابوون", nameAr: "طقم كريم التفتيح مع الصابون", nameEn: "Lightening Cream + Soap Set",
    descCkb: "سێتی سپیکردنەوە — کرێمی سپیکەرەوە لەگەڵ سابوونی تایبەتی خۆی. پێکەوە بەکاردەهێنرێن بۆ ڕووناککردنەوەی پێست و یەکخستنی ڕەنگی پێست.",
    descAr: "طقم التفتيح — كريم تفتيح مع صابونته الخاصة. يستخدمان معاً لتفتيح البشرة وتوحيد لونها.",
    descEn: "Lightening set — lightening cream with its matching soap. Used together to brighten and even out skin tone.",
    price: 15000, oldPrice: null, categorySlug: "face-care", imageUrl: "products/lightening-set.jpg",
    badge: null, inStock: true, isFeatured: true, rating: "4.9", reviewCount: 23,
  },
  {
    nameCkb: "کرێمی سپیایی هێلکە — دژە پەڵە", nameAr: "كريم البيض المفتح — ضد البقع", nameEn: "Egg Brightening Cream — Anti-Spot",
    descCkb: "کرێمی سپیایی هێلکە — بۆ پەڵەی ڕوو. پەڵە تاریکەکان کاڵ دەکاتەوە و ڕەنگی پێست یەکدەخات.",
    descAr: "كريم البيض المفتح — للبقع. يخفف البقع الداكنة ويوحد لون البشرة.",
    descEn: "Egg brightening cream — for dark spots. Fades spots and evens skin tone.",
    price: 15000, oldPrice: null, categorySlug: "face-care", imageUrl: "products/egg-cream-spots.jpg",
    badge: null, inStock: false, isFeatured: false, rating: "4.8", reviewCount: 11,
  },
  {
    nameCkb: "چای پاودەری جینسنگ", nameAr: "شاي الجينسنغ البودرة", nameEn: "Ginseng Powder Tea",
    descCkb: "چای پاودەری جینسنگ — یارمەتی گەشە و زیادکردنی ئارەزووی خواردن دەدات و وزە بە جەستە دەبەخشێت.",
    descAr: "شاي الجينسنغ البودرة — يساعد على النمو وفتح الشهية ويمنح الجسم طاقة.",
    descEn: "Ginseng powder tea — supports growth and appetite, and gives the body energy.",
    price: 27000, oldPrice: null, categorySlug: "tea-wellness", imageUrl: "products/ginseng-tea.jpg",
    badge: null, inStock: true, isFeatured: false, rating: "4.7", reviewCount: 9,
  },
  {
    nameCkb: "چای گارسینیا کەمبۆژیا", nameAr: "شاي غارسينيا كامبوجيا", nameEn: "Garcinia Cambogia Tea",
    descCkb: "چای پاودەری گارسینیا کەمبۆژیا ١٠٠ گرام — هاوکارە لە کەمکردنەوەی کێش و کۆنترۆڵکردنی ئارەزووی خواردن.",
    descAr: "شاي غارسينيا كامبوجيا بودرة ١٠٠ غرام — يساعد على إنقاص الوزن والتحكم بالشهية.",
    descEn: "Garcinia Cambogia powder tea 100g — supports weight loss and appetite control.",
    price: 25000, oldPrice: null, categorySlug: "tea-wellness", imageUrl: "products/garcinia-tea.jpg",
    badge: null, inStock: true, isFeatured: true, rating: "4.8", reviewCount: 13,
  },
  {
    nameCkb: "سیرۆمی ڤیتامین سی", nameAr: "سيروم فيتامين سي", nameEn: "Vitamin C Serum",
    descCkb: "سیرۆمی ڤیتامین سی — پێست گەش دەکاتەوە، پەڵە کاڵ دەکاتەوە و درەوشانەوە بە ڕوو دەبەخشێت.",
    descAr: "سيروم فيتامين سي — يفتح البشرة ويخفف البقع ويمنح الوجه إشراقة.",
    descEn: "Vitamin C serum — brightens skin, fades spots and gives the face a radiant glow.",
    price: 12000, oldPrice: null, categorySlug: "face-care", imageUrl: "products/vitamin-c-serum.jpg",
    badge: null, inStock: true, isFeatured: true, rating: "4.9", reviewCount: 17,
  },
  {
    nameCkb: "چای دیتۆکسی ئەنەناس — ٣٠ کیس", nameAr: "شاي ديتوكس الأناناس — ٣٠ كيس", nameEn: "Pineapple Detox Tea — 30 Sachets",
    descCkb: "چای دیتۆکسی ئەنەناس — ٣٠ کیس. بۆ پاککردنەوەی جەستە و هاوکاری لاوازبوون.",
    descAr: "شاي ديتوكس الأناناس — ٣٠ كيساً. لتنقية الجسم والمساعدة على التنحيف.",
    descEn: "Pineapple detox tea — 30 sachets. Cleanses the body and supports slimming.",
    price: 25000, oldPrice: null, categorySlug: "tea-wellness", imageUrl: "products/pineapple-detox.jpg",
    badge: null, inStock: true, isFeatured: true, rating: "4.9", reviewCount: 24,
  },
  {
    nameCkb: "دژەخۆر SPF60", nameAr: "واقي الشمس SPF60", nameEn: "Sunscreen SPF60",
    descCkb: "دژەخۆر SPF60 — دوای وەرگرتنی هەر چارەسەرێکی پێست بە ئیجباری پێویستە. لە وەرزی هاوین بۆ هەموو پێستت پێویستە و بۆ هەموو جۆرە پێستێک گونجاوە.",
    descAr: "واقي الشمس SPF60 — ضروري بعد أي علاج للبشرة. لا غنى عنه في الصيف ومناسب لجميع أنواع البشرة.",
    descEn: "Sunscreen SPF60 — essential after any skin treatment. A summer must-have, suitable for all skin types.",
    price: 8000, oldPrice: null, categorySlug: "face-care", imageUrl: "products/sunscreen-spf60.jpg",
    badge: null, inStock: false, isFeatured: false, rating: "4.8", reviewCount: 10,
  },
];

async function seed() {
  // Categories: insert missing slugs only.
  const insertedCats = await db
    .insert(categoriesTable)
    .values(categories)
    .onConflictDoNothing({ target: categoriesTable.slug })
    .returning();
  console.log(`Categories: ${insertedCats.length} inserted, ${categories.length - insertedCats.length} already existed`);

  // Products: only seed an empty table — never touch owner-managed data.
  const existing = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
  if (existing.length > 0) {
    console.log("Products: table not empty — skipping (owner data preserved)");
    return;
  }
  const insertedProds = await db.insert(productsTable).values(products).returning();
  console.log(`Products: ${insertedProds.length} inserted`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
