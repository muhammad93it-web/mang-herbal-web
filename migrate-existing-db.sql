-- Mang Herbal — incremental migration for an EXISTING live database
-- (safe to run more than once)
--
-- بۆ داتابەیسی ئێستات (ئەگەر پێشتر سایتەکەت کارا بووە): تەنها ئەم فایلە جێبەجێ بکە.
-- بۆ دامەزراندنی سەرلەنوێ: پێویستت بەمە نییە — database.sql بەکاربهێنە.

-- ستوونی ئیمەیڵ (لە تۆمارکردندا داواکراوە)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;

-- بۆ پەیامی بەخێرهاتن لە یەکەم چوونەژوورەوە
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp;
