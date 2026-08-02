/**
 * Seed the database with the Mang Herbal starter catalog:
 * 3 categories + 11 products (Kurdish Sorani / Arabic / English).
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
  { slug: "lips-body", nameCkb: "لێو و جەستە", nameAr: "الشفاه والجسم", nameEn: "Lips & Body" },
];

const products = [
  {
    nameCkb: "ڕۆنی ئەرگان بۆ ڕوو", nameAr: "زيت أرغان للوجه", nameEn: "Argan Face Oil",
    descCkb: "ڕۆنێکی سروشتی دەوڵەمەند کە پێست بە قووڵی تەڕ دەکاتەوە و گەشاوەیی پێدەبەخشێت. لە باشترین جۆری ئەرگان دروستکراوە؛ هێڵە وردەکان کەم دەکاتەوە و پێستەکەت نەرم و درەوشاوە دەکات.",
    descAr: "منتج طبيعي غني يرطب البشرة ويجددها. يحتوي على أجود أنواع زيت الأرغان المغربي، يعمل ضد الشيخوخة ويمنح البشرة توهجاً مميزاً.",
    descEn: "A rich natural product that deeply moisturizes and revitalizes skin. Packed with premium Moroccan argan oil, it fights aging and gives skin a radiant glow.",
    price: 12000, oldPrice: 15000, categorySlug: "face-care", imageUrl: "products/argan-face-oil.jpg",
    badge: "زۆرترین فرۆشراو", inStock: true, isFeatured: true, rating: "4.8", reviewCount: 24,
  },
  {
    nameCkb: "سیرۆمی گەشکردنەوە", nameAr: "سيروم الإشراق", nameEn: "Brightening Serum",
    descCkb: "سیرۆمێکی کاریگەر کە ڕەنگی پێست یەکدەخات و لەکە تاریکەکان کاڵ دەکاتەوە. بە بەکارهێنانی بەردەوام، دوای دوو هەفتە جیاوازییەکە بە ڕوونی دەبینیت.",
    descAr: "سيروم فعّال يوحد لون البشرة ويزيل آثار التعب وعلامات التقدم في السن. لاحظ المستخدمون تحسناً ملحوظاً خلال أسبوعين فقط.",
    descEn: "A powerful serum that evens skin tone and restores a youthful glow. Users notice visible improvement within two weeks of use.",
    price: 18000, oldPrice: 22000, categorySlug: "face-care", imageUrl: "products/brightening-serum.jpg",
    badge: "تازە", inStock: true, isFeatured: true, rating: "4.7", reviewCount: 18,
  },
  {
    nameCkb: "کرێمی ڕووی گیایی", nameAr: "كريم الوجه العشبي", nameEn: "Herbal Face Cream",
    descCkb: "کرێمێکی نەرم و خۆشبۆن کە لە ڕووەکی سروشتی دروستکراوە. پێست بە قووڵی تەڕ دەکاتەوە و بە درێژایی ڕۆژ دەیپارێزێت. گونجاوە بۆ هەموو جۆرە پێستێک.",
    descAr: "كريم ناعم وعطري مصنوع من مستخلصات نباتية طبيعية. يوصل الترطيب والتغذية العميقة للبشرة ويحميها طوال اليوم.",
    descEn: "A soft, fragrant cream based on natural botanical extracts. Delivers deep moisture and nourishment, protecting skin from morning to night.",
    price: 14000, oldPrice: 17000, categorySlug: "face-care", imageUrl: "products/herbal-face-cream.jpg",
    badge: null, inStock: true, isFeatured: false, rating: "4.6", reviewCount: 31,
  },
  {
    nameCkb: "ماسکی ڕووی گیایی", nameAr: "قناع الوجه العشبي", nameEn: "Herbal Face Mask",
    descCkb: "ماسکێکی کاریگەر بۆ پاککردنەوەی قووڵ و نوێکردنەوەی پێست. تەنها ١٥ خولەک بەسە بۆ پێستێکی پاک و گەشاوە، وەک ئەوەی لە باشترین سالۆنەکان وەریدەگریت.",
    descAr: "قناع فعّال ينظف البشرة بعمق ويمسد مسامها. 15 دقيقة فقط كافية للحصول على بشرة مشرقة كما بعد جلسة سبا فاخرة.",
    descEn: "An effective mask that deep-cleanses and tightens pores. Just 15 minutes for skin that glows like after a luxury spa session.",
    price: 10000, oldPrice: 13000, categorySlug: "face-care", imageUrl: "products/herbal-face-mask.jpg",
    badge: "داشکاندن", inStock: true, isFeatured: false, rating: "4.5", reviewCount: 15,
  },
  {
    nameCkb: "سیرۆمی سروشتی ڕوو", nameAr: "سيروم الوجه الطبيعي", nameEn: "Natural Face Serum",
    descCkb: "لووتکەی چاودێری سروشتی پێست. پێکهاتەکەی تەڕی و خۆراک دەگەیەنێتە قووڵترین چینەکانی پێست. هەڵبژاردەیەکی نایابە بۆ پێستی هەستیار و ماندوو.",
    descAr: "ذروة العناية الطبيعية — تقنية متقدمة تنقل الأكسجين والترطيب إلى أعمق طبقات البشرة. مثالي للبشرة الحساسة والمتعبة.",
    descEn: "The pinnacle of natural skincare — advanced technology delivers oxygen and hydration to the deepest skin layers. Ideal for sensitive or stressed skin.",
    price: 20000, oldPrice: 25000, categorySlug: "face-care", imageUrl: "products/natural-face-serum.jpg",
    badge: "نایاب", inStock: true, isFeatured: true, rating: "4.9", reviewCount: 42,
  },
  {
    nameCkb: "کرێمی چاککردنەوەی شەوانە", nameAr: "كريم الإصلاح الليلي", nameEn: "Night Repair Cream",
    descCkb: "لە کاتی خەودا کار دەکات: پێست نوێ دەکاتەوە، نیشانەکانی پیربوون کەم دەکاتەوە و بەیانییان بە پێستێکی تازە و گەشاوە هەڵدەستیت.",
    descAr: "أثناء نومك، يعمل هذا الكريم بجد: يصلح حاجز البشرة ويقلل علامات التقدم في السن لتستيقظ ببشرة منتعشة ومتجددة كل صباح.",
    descEn: "While you sleep, this cream works hard: repairs the skin barrier, fades signs of aging, and you wake up to fresh, radiant skin every morning.",
    price: 16000, oldPrice: 20000, categorySlug: "face-care", imageUrl: "products/night-repair-cream.jpg",
    badge: null, inStock: true, isFeatured: true, rating: "4.7", reviewCount: 29,
  },
  {
    nameCkb: "شامپۆی دژە هەڵوەرینی موو", nameAr: "شامبو مضاد لتساقط الشعر", nameEn: "Anti Hair-Loss Shampoo",
    descCkb: "شامپۆیەکی چارەسەرکەر کە موو لە ڕەگەوە بەهێز دەکات. گیا تایبەتەکانی ناوی سوڕی خوێن بۆ ڕەگی موو زیاد دەکەن و هەڵوەرین بە شێوەیەکی بەرچاو کەم دەکەنەوە.",
    descAr: "شامبو علاجي يقوي الشعر من جذوره. يحتوي على أعشاب خاصة تحفز الدورة الدموية لجريبات الشعر وتقلل التساقط بشكل ملحوظ.",
    descEn: "A therapeutic shampoo that strengthens hair from the roots. Special herbal blends stimulate blood flow to hair follicles and significantly reduce hair loss.",
    price: 11000, oldPrice: 14000, categorySlug: "hair-care", imageUrl: "products/anti-hair-loss-shampoo.jpg",
    badge: "زۆرترین فرۆشراو", inStock: true, isFeatured: true, rating: "4.8", reviewCount: 37,
  },
  {
    nameCkb: "ڕۆنی مووی گیایی", nameAr: "زيت الشعر العشبي", nameEn: "Herbal Hair Oil",
    descCkb: "تێکەڵەیەکی نایاب لە ١٢ جۆر ڕۆنی سروشتی. درەوشانەوە بە موو دەبەخشێت، شکان کەم دەکاتەوە و مووی سەرکێش هێمن دەکاتەوە.",
    descAr: "تركيبة فريدة من 12 نوعاً من الزيوت النباتية الطبيعية. يمنح الشعر لمعاناً ساطعاً، يمنع التقصف ويسيطر على التجعد الصعب.",
    descEn: "A unique blend of 12 natural plant oils. Gives hair brilliant shine, prevents breakage, and tames even the most stubborn frizz.",
    price: 9000, oldPrice: 12000, categorySlug: "hair-care", imageUrl: "products/herbal-hair-oil.jpg",
    badge: null, inStock: true, isFeatured: false, rating: "4.6", reviewCount: 22,
  },
  {
    nameCkb: "شامپۆی گیایی", nameAr: "شامبو عشبي", nameEn: "Herbal Shampoo",
    descCkb: "پاککردنەوەیەکی نەرم بە بۆنی گیای شاخاوی. هاوسەنگی سروشتی موو دەپارێزێت و ڕۆژ لەدوای ڕۆژ مووەکەت تەندروستتر و جوانتر دەکات.",
    descAr: "تنظيف لطيف برائحة الأعشاب الجبلية الطبيعية. يوازن درجة الحموضة ويقلل التراكم الكيميائي ليجعل شعرك أجمل وأصح يوماً بعد يوم.",
    descEn: "Gentle cleansing with the natural scent of mountain herbs. Balances pH, reduces chemical buildup, and makes hair noticeably healthier day by day.",
    price: 8000, oldPrice: 10000, categorySlug: "hair-care", imageUrl: "products/herbal-shampoo.jpg",
    badge: null, inStock: true, isFeatured: false, rating: "4.5", reviewCount: 19,
  },
  {
    nameCkb: "مەرهەمی لێوی گیایی", nameAr: "بلسم الشفاه العشبي", nameEn: "Herbal Lip Balm",
    descCkb: "چارەسەرێکی نایاب بۆ لێوی وشک و شەقاربوو. بە هەنگوینی سروشتی و ڕۆنی گوڵ، لێوەکانت نەرم دەکات و بە درێژایی ڕۆژ دەیانپارێزێت.",
    descAr: "الشفاه الجافة والمتشققة مشكلة كثيرين. هذا البلسم بتركيبة العسل الطبيعي وزيت ورد الجوري يلطف شفتيك ويحميهما طوال اليوم.",
    descEn: "Dry and cracked lips are a common struggle. This balm with natural honey and rose oil soothes and protects your lips throughout the day.",
    price: 5000, oldPrice: 7000, categorySlug: "lips-body", imageUrl: "products/herbal-lip-balm.jpg",
    badge: "تازە", inStock: true, isFeatured: false, rating: "4.7", reviewCount: 11,
  },
  {
    nameCkb: "پرۆتۆکۆلی لاوازبوون", nameAr: "بروتوكول التنحيف", nameEn: "Slimming Protocol",
    descCkb: "بەرنامەیەکی تەواو بۆ ڕێککردنی جەستە لەسەر بنەمای گیای سروشتی. بەبێ هیچ ماددەیەکی کیمیایی — تەنها بەخششە سروشتییەکانی چیاکانی کوردستان.",
    descAr: "برنامج متكامل لرشاقة الجسم مبني على الأعشاب الطبيعية. بعيداً عن المواد الكيميائية — فقط ما تجود به الطبيعة الكردية الخالصة.",
    descEn: "A complete body shaping program built on natural botanical herbs. No chemicals — only the pure natural gifts of the Kurdish highlands.",
    price: 35000, oldPrice: 45000, categorySlug: "lips-body", imageUrl: "products/slimming-protocol.jpg",
    badge: "نایاب", inStock: true, isFeatured: true, rating: "4.9", reviewCount: 8,
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
