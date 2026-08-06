-- Mang Herbal — Update 4: بەرهەمە ڕاستەقینەکان + سۆشیاڵەکان
-- ئەم فایلە لە Neon SQL Editor بلکێنە و Run بکە (هەمان شێوەی جاری پێشوو)

BEGIN;

-- 1) سڕینەوەی بەرهەمە نموونەییەکان (سەبەتە و دڵخوازەکانیش کە ئاماژە بە نموونەکان دەکەن)
DELETE FROM cart_items;
DELETE FROM favorites;
DELETE FROM products;

-- 2) گۆڕینی پۆلی «لێو و جەستە» بۆ «چا و بەرهەمی تەندروستی» (بۆ چاکان و مۆلاس)
-- بە شێوەیەکی پارێزراو: ئەگەر پۆلەکە پێشتر گۆڕدرابێت، هیچ ناکات
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM categories WHERE slug = 'tea-wellness') THEN
    -- target already exists; drop the old (now empty) category if it lingers
    DELETE FROM categories WHERE slug = 'lips-body';
  ELSE
    UPDATE categories
    SET slug = 'tea-wellness',
        name_ckb = 'چا و بەرهەمی تەندروستی',
        name_ar = 'الشاي والمنتجات الصحية',
        name_en = 'Tea & Wellness'
    WHERE slug = 'lips-body';
    IF NOT FOUND THEN
      INSERT INTO categories (slug, name_ckb, name_ar, name_en)
      VALUES ('tea-wellness', 'چا و بەرهەمی تەندروستی', 'الشاي والمنتجات الصحية', 'Tea & Wellness')
      ON CONFLICT (slug) DO NOTHING;
    END IF;
  END IF;
END $$;

-- 3) دانانی ١٢ بەرهەمە ڕاستەقینەکە
INSERT INTO products
  (name_ckb, name_ar, name_en, desc_ckb, desc_ar, desc_en, price, old_price, category_slug, image_url, badge, in_stock, is_featured, rating, review_count)
VALUES
  ('شامپۆی تار ٢٠٠ مل', 'شامبو القطران ٢٠٠ مل', 'Tar Shampoo 200ml',
   'شامپۆی تار ٢٠٠ مل — بۆ چارەسەری ئێگزیما و سۆریازیس. خورشت و سووربوونەوەی پێستی سەر کەم دەکاتەوە و پێستی سەر پاک و ئارام دەکاتەوە.',
   'شامبو القطران ٢٠٠ مل — لعلاج الإكزيما والصدفية. يخفف الحكة واحمرار فروة الرأس وينظفها ويهدئها.',
   'Tar shampoo 200ml — for eczema and psoriasis. Soothes itching and redness, leaving the scalp clean and calm.',
   8000, NULL, 'hair-care', 'products/tar-shampoo.jpg', NULL, TRUE, TRUE, 4.9, 21),

  ('شامپۆی کەرکار ٢٠٠ مل', 'شامبو كركار ٢٠٠ مل', 'Karkar Shampoo 200ml',
   'شامپۆی کەرکار ٢٠٠ مل — بۆ ڕێگریکردن لە هەڵوەرینی قژ و بەهێزکردنی ڕەگی قژ. قژ چڕتر و تەندروستتر دەکات.',
   'شامبو كركار ٢٠٠ مل — لمنع تساقط الشعر وتقوية جذوره. يمنح الشعر كثافة وصحة.',
   'Karkar shampoo 200ml — helps prevent hair loss and strengthens roots for thicker, healthier hair.',
   8000, NULL, 'hair-care', 'products/karkar-shampoo.jpg', NULL, FALSE, FALSE, 4.8, 14),

  ('ماسکی هێلکە', 'ماسك البيض', 'Egg Mask',
   'ماسکی هێلکە — دەوڵەمەندە بە کۆلاجین و ڤیتامینی C و E. پێست تێر دەکات و تازەی دەکاتەوە و درەوشانەوەی سروشتی پێدەبەخشێت.',
   'ماسك البيض — غني بالكولاجين وفيتامين C و E. يغذي البشرة ويجددها ويمنحها إشراقة طبيعية.',
   'Egg mask — rich in collagen and vitamins C and E. Nourishes and refreshes the skin for a natural glow.',
   10000, NULL, 'face-care', 'products/egg-mask.jpg', NULL, FALSE, FALSE, 4.9, 18),

  ('کرێمی هێلکە — دژە چرچولۆچی', 'كريم البيض — ضد التجاعيد', 'Egg Cream — Anti-Wrinkle',
   'کرێمی هێلکە بۆ چرچولۆچی — هێڵە وردەکان و چرچولۆچی ڕوو کەم دەکاتەوە و پێست نەرمتر و گەنجتر نیشان دەدات.',
   'كريم البيض للتجاعيد — يقلل الخطوط الدقيقة وتجاعيد الوجه ويجعل البشرة أنعم وأكثر شباباً.',
   'Egg cream for wrinkles — reduces fine lines and facial wrinkles for smoother, younger-looking skin.',
   15000, NULL, 'face-care', 'products/egg-cream-wrinkle.jpg', NULL, FALSE, FALSE, 4.8, 12),

  ('مۆلاسی هەنگوین بۆ منداڵان', 'عسل مولاس للأطفال', 'Kids Honey Molasses',
   'مۆلاسی هەنگوین بۆ منداڵان — یارمەتی گەشەکردن و زیادکردنی ئارەزووی خواردن دەدات. سروشتی و خۆشە بۆ منداڵان.',
   'عسل مولاس للأطفال — يساعد على النمو وفتح الشهية. طبيعي ولذيذ للأطفال.',
   'Kids honey molasses — supports growth and appetite. Natural and tasty for children.',
   20000, NULL, 'tea-wellness', 'products/kids-molasses.jpg', NULL, TRUE, TRUE, 5.0, 26),

  ('سێتی کرێمی سپیکەرەوە و سابوون', 'طقم كريم التفتيح مع الصابون', 'Lightening Cream + Soap Set',
   'سێتی سپیکردنەوە — کرێمی سپیکەرەوە لەگەڵ سابوونی تایبەتی خۆی. پێکەوە بەکاردەهێنرێن بۆ ڕووناککردنەوەی پێست و یەکخستنی ڕەنگی پێست.',
   'طقم التفتيح — كريم تفتيح مع صابونته الخاصة. يستخدمان معاً لتفتيح البشرة وتوحيد لونها.',
   'Lightening set — lightening cream with its matching soap. Used together to brighten and even out skin tone.',
   15000, NULL, 'face-care', 'products/lightening-set.jpg', NULL, TRUE, TRUE, 4.9, 23),

  ('کرێمی سپیایی هێلکە — دژە پەڵە', 'كريم البيض المفتح — ضد البقع', 'Egg Brightening Cream — Anti-Spot',
   'کرێمی سپیایی هێلکە — بۆ پەڵەی ڕوو. پەڵە تاریکەکان کاڵ دەکاتەوە و ڕەنگی پێست یەکدەخات.',
   'كريم البيض المفتح — للبقع. يخفف البقع الداكنة ويوحد لون البشرة.',
   'Egg brightening cream — for dark spots. Fades spots and evens skin tone.',
   15000, NULL, 'face-care', 'products/egg-cream-spots.jpg', NULL, FALSE, FALSE, 4.8, 11),

  ('چای پاودەری جینسنگ', 'شاي الجينسنغ البودرة', 'Ginseng Powder Tea',
   'چای پاودەری جینسنگ — یارمەتی گەشە و زیادکردنی ئارەزووی خواردن دەدات و وزە بە جەستە دەبەخشێت.',
   'شاي الجينسنغ البودرة — يساعد على النمو وفتح الشهية ويمنح الجسم طاقة.',
   'Ginseng powder tea — supports growth and appetite, and gives the body energy.',
   27000, NULL, 'tea-wellness', 'products/ginseng-tea.jpg', NULL, TRUE, FALSE, 4.7, 9),

  ('چای گارسینیا کەمبۆژیا', 'شاي غارسينيا كامبوجيا', 'Garcinia Cambogia Tea',
   'چای پاودەری گارسینیا کەمبۆژیا ١٠٠ گرام — هاوکارە لە کەمکردنەوەی کێش و کۆنترۆڵکردنی ئارەزووی خواردن.',
   'شاي غارسينيا كامبوجيا بودرة ١٠٠ غرام — يساعد على إنقاص الوزن والتحكم بالشهية.',
   'Garcinia Cambogia powder tea 100g — supports weight loss and appetite control.',
   25000, NULL, 'tea-wellness', 'products/garcinia-tea.jpg', NULL, TRUE, TRUE, 4.8, 13),

  ('سیرۆمی ڤیتامین سی', 'سيروم فيتامين سي', 'Vitamin C Serum',
   'سیرۆمی ڤیتامین سی — پێست گەش دەکاتەوە، پەڵە کاڵ دەکاتەوە و درەوشانەوە بە ڕوو دەبەخشێت.',
   'سيروم فيتامين سي — يفتح البشرة ويخفف البقع ويمنح الوجه إشراقة.',
   'Vitamin C serum — brightens skin, fades spots and gives the face a radiant glow.',
   12000, NULL, 'face-care', 'products/vitamin-c-serum.jpg', NULL, TRUE, TRUE, 4.9, 17),

  ('چای دیتۆکسی ئەنەناس — ٣٠ کیس', 'شاي ديتوكس الأناناس — ٣٠ كيس', 'Pineapple Detox Tea — 30 Sachets',
   'چای دیتۆکسی ئەنەناس — ٣٠ کیس. بۆ پاککردنەوەی جەستە و هاوکاری لاوازبوون.',
   'شاي ديتوكس الأناناس — ٣٠ كيساً. لتنقية الجسم والمساعدة على التنحيف.',
   'Pineapple detox tea — 30 sachets. Cleanses the body and supports slimming.',
   25000, NULL, 'tea-wellness', 'products/pineapple-detox.jpg', NULL, TRUE, TRUE, 4.9, 24),

  ('دژەخۆر SPF60', 'واقي الشمس SPF60', 'Sunscreen SPF60',
   'دژەخۆر SPF60 — دوای وەرگرتنی هەر چارەسەرێکی پێست بە ئیجباری پێویستە. لە وەرزی هاوین بۆ هەموو پێستت پێویستە و بۆ هەموو جۆرە پێستێک گونجاوە.',
   'واقي الشمس SPF60 — ضروري بعد أي علاج للبشرة. لا غنى عنه في الصيف ومناسب لجميع أنواع البشرة.',
   'Sunscreen SPF60 — essential after any skin treatment. A summer must-have, suitable for all skin types.',
   8000, NULL, 'face-care', 'products/sunscreen-spf60.jpg', NULL, FALSE, FALSE, 4.8, 10);

-- 4) لینکی سۆشیاڵەکان + ژمارەی واتساپ
INSERT INTO site_settings (key, value_ckb, value_ar, value_en) VALUES
  ('social_facebook',  '', '', 'https://www.facebook.com/mangherbal'),
  ('social_instagram', '', '', 'https://www.instagram.com/mang__herbal/'),
  ('social_tiktok',    '', '', 'https://www.tiktok.com/@mang_herbal'),
  ('social_whatsapp',  '', '', '9647701432814')
ON CONFLICT (key) DO UPDATE SET
  value_en = EXCLUDED.value_en;

COMMIT;
