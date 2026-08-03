--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    slug text NOT NULL,
    name_ckb text NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    total integer NOT NULL,
    customer_name text,
    phone text NOT NULL,
    address text NOT NULL,
    note text,
    is_seen boolean DEFAULT false NOT NULL,
    items jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name_ckb text NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    desc_ckb text NOT NULL,
    desc_ar text NOT NULL,
    desc_en text NOT NULL,
    price integer NOT NULL,
    old_price integer,
    category_slug text NOT NULL,
    image_url text,
    badge text,
    in_stock boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    rating numeric(3,1) DEFAULT 4.5 NOT NULL,
    review_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    key text NOT NULL,
    value_ckb text DEFAULT ''::text NOT NULL,
    value_ar text DEFAULT ''::text NOT NULL,
    value_en text DEFAULT ''::text NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'customer'::text NOT NULL,
    reset_code text,
    reset_code_expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    email text,
    last_login_at timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES (1, 'face-care', 'چاودێری ڕوو', 'العناية بالوجه', 'Face Care');
INSERT INTO public.categories VALUES (2, 'hair-care', 'چاودێری موو', 'العناية بالشعر', 'Hair Care');
INSERT INTO public.categories VALUES (3, 'lips-body', 'لێو و جەستە', 'الشفاه والجسم', 'Lips & Body');


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products VALUES (1, 'ڕۆنی ئەرگان بۆ ڕوو', 'زيت أرغان للوجه', 'Argan Face Oil', 'ڕۆنێکی سروشتی دەوڵەمەند کە پێست بە قووڵی تەڕ دەکاتەوە و گەشاوەیی پێدەبەخشێت. لە باشترین جۆری ئەرگان دروستکراوە؛ هێڵە وردەکان کەم دەکاتەوە و پێستەکەت نەرم و درەوشاوە دەکات.', 'منتج طبيعي غني يرطب البشرة ويجددها. يحتوي على أجود أنواع زيت الأرغان المغربي، يعمل ضد الشيخوخة ويمنح البشرة توهجاً مميزاً.', 'A rich natural product that deeply moisturizes and revitalizes skin. Packed with premium Moroccan argan oil, it fights aging and gives skin a radiant glow.', 12000, 15000, 'face-care', 'products/argan-face-oil.jpg', 'زۆرترین فرۆشراو', true, true, 4.8, 24, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (2, 'سیرۆمی گەشکردنەوە', 'سيروم الإشراق', 'Brightening Serum', 'سیرۆمێکی کاریگەر کە ڕەنگی پێست یەکدەخات و لەکە تاریکەکان کاڵ دەکاتەوە. بە بەکارهێنانی بەردەوام، دوای دوو هەفتە جیاوازییەکە بە ڕوونی دەبینیت.', 'سيروم فعّال يوحد لون البشرة ويزيل آثار التعب وعلامات التقدم في السن. لاحظ المستخدمون تحسناً ملحوظاً خلال أسبوعين فقط.', 'A powerful serum that evens skin tone and restores a youthful glow. Users notice visible improvement within two weeks of use.', 18000, 22000, 'face-care', 'products/brightening-serum.jpg', 'تازە', true, true, 4.7, 18, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (3, 'کرێمی ڕووی گیایی', 'كريم الوجه العشبي', 'Herbal Face Cream', 'کرێمێکی نەرم و خۆشبۆن کە لە ڕووەکی سروشتی دروستکراوە. پێست بە قووڵی تەڕ دەکاتەوە و بە درێژایی ڕۆژ دەیپارێزێت. گونجاوە بۆ هەموو جۆرە پێستێک.', 'كريم ناعم وعطري مصنوع من مستخلصات نباتية طبيعية. يوصل الترطيب والتغذية العميقة للبشرة ويحميها طوال اليوم.', 'A soft, fragrant cream based on natural botanical extracts. Delivers deep moisture and nourishment, protecting skin from morning to night.', 14000, 17000, 'face-care', 'products/herbal-face-cream.jpg', NULL, true, false, 4.6, 31, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (4, 'ماسکی ڕووی گیایی', 'قناع الوجه العشبي', 'Herbal Face Mask', 'ماسکێکی کاریگەر بۆ پاککردنەوەی قووڵ و نوێکردنەوەی پێست. تەنها ١٥ خولەک بەسە بۆ پێستێکی پاک و گەشاوە، وەک ئەوەی لە باشترین سالۆنەکان وەریدەگریت.', 'قناع فعّال ينظف البشرة بعمق ويمسد مسامها. 15 دقيقة فقط كافية للحصول على بشرة مشرقة كما بعد جلسة سبا فاخرة.', 'An effective mask that deep-cleanses and tightens pores. Just 15 minutes for skin that glows like after a luxury spa session.', 10000, 13000, 'face-care', 'products/herbal-face-mask.jpg', 'داشکاندن', true, false, 4.5, 15, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (5, 'سیرۆمی سروشتی ڕوو', 'سيروم الوجه الطبيعي', 'Natural Face Serum', 'لووتکەی چاودێری سروشتی پێست. پێکهاتەکەی تەڕی و خۆراک دەگەیەنێتە قووڵترین چینەکانی پێست. هەڵبژاردەیەکی نایابە بۆ پێستی هەستیار و ماندوو.', 'ذروة العناية الطبيعية — تقنية متقدمة تنقل الأكسجين والترطيب إلى أعمق طبقات البشرة. مثالي للبشرة الحساسة والمتعبة.', 'The pinnacle of natural skincare — advanced technology delivers oxygen and hydration to the deepest skin layers. Ideal for sensitive or stressed skin.', 20000, 25000, 'face-care', 'products/natural-face-serum.jpg', 'نایاب', true, true, 4.9, 42, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (6, 'کرێمی چاککردنەوەی شەوانە', 'كريم الإصلاح الليلي', 'Night Repair Cream', 'لە کاتی خەودا کار دەکات: پێست نوێ دەکاتەوە، نیشانەکانی پیربوون کەم دەکاتەوە و بەیانییان بە پێستێکی تازە و گەشاوە هەڵدەستیت.', 'أثناء نومك، يعمل هذا الكريم بجد: يصلح حاجز البشرة ويقلل علامات التقدم في السن لتستيقظ ببشرة منتعشة ومتجددة كل صباح.', 'While you sleep, this cream works hard: repairs the skin barrier, fades signs of aging, and you wake up to fresh, radiant skin every morning.', 16000, 20000, 'face-care', 'products/night-repair-cream.jpg', NULL, true, true, 4.7, 29, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (7, 'شامپۆی دژە هەڵوەرینی موو', 'شامبو مضاد لتساقط الشعر', 'Anti Hair-Loss Shampoo', 'شامپۆیەکی چارەسەرکەر کە موو لە ڕەگەوە بەهێز دەکات. گیا تایبەتەکانی ناوی سوڕی خوێن بۆ ڕەگی موو زیاد دەکەن و هەڵوەرین بە شێوەیەکی بەرچاو کەم دەکەنەوە.', 'شامبو علاجي يقوي الشعر من جذوره. يحتوي على أعشاب خاصة تحفز الدورة الدموية لجريبات الشعر وتقلل التساقط بشكل ملحوظ.', 'A therapeutic shampoo that strengthens hair from the roots. Special herbal blends stimulate blood flow to hair follicles and significantly reduce hair loss.', 11000, 14000, 'hair-care', 'products/anti-hair-loss-shampoo.jpg', 'زۆرترین فرۆشراو', true, true, 4.8, 37, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (8, 'ڕۆنی مووی گیایی', 'زيت الشعر العشبي', 'Herbal Hair Oil', 'تێکەڵەیەکی نایاب لە ١٢ جۆر ڕۆنی سروشتی. درەوشانەوە بە موو دەبەخشێت، شکان کەم دەکاتەوە و مووی سەرکێش هێمن دەکاتەوە.', 'تركيبة فريدة من 12 نوعاً من الزيوت النباتية الطبيعية. يمنح الشعر لمعاناً ساطعاً، يمنع التقصف ويسيطر على التجعد الصعب.', 'A unique blend of 12 natural plant oils. Gives hair brilliant shine, prevents breakage, and tames even the most stubborn frizz.', 9000, 12000, 'hair-care', 'products/herbal-hair-oil.jpg', NULL, true, false, 4.6, 22, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (9, 'شامپۆی گیایی', 'شامبو عشبي', 'Herbal Shampoo', 'پاککردنەوەیەکی نەرم بە بۆنی گیای شاخاوی. هاوسەنگی سروشتی موو دەپارێزێت و ڕۆژ لەدوای ڕۆژ مووەکەت تەندروستتر و جوانتر دەکات.', 'تنظيف لطيف برائحة الأعشاب الجبلية الطبيعية. يوازن درجة الحموضة ويقلل التراكم الكيميائي ليجعل شعرك أجمل وأصح يوماً بعد يوم.', 'Gentle cleansing with the natural scent of mountain herbs. Balances pH, reduces chemical buildup, and makes hair noticeably healthier day by day.', 8000, 10000, 'hair-care', 'products/herbal-shampoo.jpg', NULL, true, false, 4.5, 19, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (10, 'مەرهەمی لێوی گیایی', 'بلسم الشفاه العشبي', 'Herbal Lip Balm', 'چارەسەرێکی نایاب بۆ لێوی وشک و شەقاربوو. بە هەنگوینی سروشتی و ڕۆنی گوڵ، لێوەکانت نەرم دەکات و بە درێژایی ڕۆژ دەیانپارێزێت.', 'الشفاه الجافة والمتشققة مشكلة كثيرين. هذا البلسم بتركيبة العسل الطبيعي وزيت ورد الجوري يلطف شفتيك ويحميهما طوال اليوم.', 'Dry and cracked lips are a common struggle. This balm with natural honey and rose oil soothes and protects your lips throughout the day.', 5000, 7000, 'lips-body', 'products/herbal-lip-balm.jpg', 'تازە', true, false, 4.7, 11, '2026-08-02 21:35:11.502181');
INSERT INTO public.products VALUES (11, 'پرۆتۆکۆلی لاوازبوون', 'بروتوكول التنحيف', 'Slimming Protocol', 'بەرنامەیەکی تەواو بۆ ڕێککردنی جەستە لەسەر بنەمای گیای سروشتی. بەبێ هیچ ماددەیەکی کیمیایی — تەنها بەخششە سروشتییەکانی چیاکانی کوردستان.', 'برنامج متكامل لرشاقة الجسم مبني على الأعشاب الطبيعية. بعيداً عن المواد الكيميائية — فقط ما تجود به الطبيعة الكردية الخالصة.', 'A complete body shaping program built on natural botanical herbs. No chemicals — only the pure natural gifts of the Kurdish highlands.', 35000, 45000, 'lips-body', 'products/slimming-protocol.jpg', 'نایاب', true, true, 4.9, 8, '2026-08-02 21:35:11.502181');


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'Admin', '7501263713', '$2b$10$bY0w/vByypAFQWa5/11bfu/nvbRG2Zw2e3WMkaNJ2MUie0iQpyGQe', 'admin', NULL, NULL, '2026-08-02 20:59:55.185291', NULL, '2026-08-02 22:42:04.305');


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 3, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 3, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 36, true);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_phone_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_unique UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--


