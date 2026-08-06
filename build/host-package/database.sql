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
INSERT INTO public.categories VALUES (3, 'tea-wellness', 'چا و بەرهەمی تەندروستی', 'الشاي والمنتجات الصحية', 'Tea & Wellness');


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products VALUES (21, 'چای پاودەری جینسنگ', 'شاي الجينسنغ البودرة', 'Ginseng Powder Tea', 'چای پاودەری جینسنگ — یارمەتی گەشە و زیادکردنی ئارەزووی خواردن دەدات و وزە بە جەستە دەبەخشێت.', 'شاي الجينسنغ البودرة — يساعد على النمو وفتح الشهية ويمنح الجسم طاقة.', 'Ginseng powder tea — supports growth and appetite, and gives the body energy.', 27000, NULL, 'tea-wellness', 'products/ginseng-tea.jpg', NULL, true, false, 4.7, 9, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (22, 'چای گارسینیا کەمبۆژیا', 'شاي غارسينيا كامبوجيا', 'Garcinia Cambogia Tea', 'چای پاودەری گارسینیا کەمبۆژیا ١٠٠ گرام — هاوکارە لە کەمکردنەوەی کێش و کۆنترۆڵکردنی ئارەزووی خواردن.', 'شاي غارسينيا كامبوجيا بودرة ١٠٠ غرام — يساعد على إنقاص الوزن والتحكم بالشهية.', 'Garcinia Cambogia powder tea 100g — supports weight loss and appetite control.', 25000, NULL, 'tea-wellness', 'products/garcinia-tea.jpg', NULL, true, true, 4.8, 13, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (14, 'شامپۆی تار ٢٠٠ مل', 'شامبو القطران ٢٠٠ مل', 'Tar Shampoo 200ml', 'شامپۆی تار ٢٠٠ مل — بۆ چارەسەری ئێگزیما و سۆریازیس. خورشت و سووربوونەوەی پێستی سەر کەم دەکاتەوە و پێستی سەر پاک و ئارام دەکاتەوە.', 'شامبو القطران ٢٠٠ مل — لعلاج الإكزيما والصدفية. يخفف الحكة واحمرار فروة الرأس وينظفها ويهدئها.', 'Tar shampoo 200ml — for eczema and psoriasis. Soothes itching and redness, leaving the scalp clean and calm.', 8000, NULL, 'hair-care', 'products/tar-shampoo.jpg', NULL, true, true, 4.9, 21, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (15, 'شامپۆی کەرکار ٢٠٠ مل', 'شامبو كركار ٢٠٠ مل', 'Karkar Shampoo 200ml', 'شامپۆی کەرکار ٢٠٠ مل — بۆ ڕێگریکردن لە هەڵوەرینی قژ و بەهێزکردنی ڕەگی قژ. قژ چڕتر و تەندروستتر دەکات.', 'شامبو كركار ٢٠٠ مل — لمنع تساقط الشعر وتقوية جذوره. يمنح الشعر كثافة وصحة.', 'Karkar shampoo 200ml — helps prevent hair loss and strengthens roots for thicker, healthier hair.', 8000, NULL, 'hair-care', 'products/karkar-shampoo.jpg', NULL, false, false, 4.8, 14, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (16, 'ماسکی هێلکە', 'ماسك البيض', 'Egg Mask', 'ماسکی هێلکە — دەوڵەمەندە بە کۆلاجین و ڤیتامینی C و E. پێست تێر دەکات و تازەی دەکاتەوە و درەوشانەوەی سروشتی پێدەبەخشێت.', 'ماسك البيض — غني بالكولاجين وفيتامين C و E. يغذي البشرة ويجددها ويمنحها إشراقة طبيعية.', 'Egg mask — rich in collagen and vitamins C and E. Nourishes and refreshes the skin for a natural glow.', 10000, NULL, 'face-care', 'products/egg-mask.jpg', NULL, false, false, 4.9, 18, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (17, 'کرێمی هێلکە — دژە چرچولۆچی', 'كريم البيض — ضد التجاعيد', 'Egg Cream — Anti-Wrinkle', 'کرێمی هێلکە بۆ چرچولۆچی — هێڵە وردەکان و چرچولۆچی ڕوو کەم دەکاتەوە و پێست نەرمتر و گەنجتر نیشان دەدات.', 'كريم البيض للتجاعيد — يقلل الخطوط الدقيقة وتجاعيد الوجه ويجعل البشرة أنعم وأكثر شباباً.', 'Egg cream for wrinkles — reduces fine lines and facial wrinkles for smoother, younger-looking skin.', 15000, NULL, 'face-care', 'products/egg-cream-wrinkle.jpg', NULL, false, false, 4.8, 12, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (18, 'مۆلاسی هەنگوین بۆ منداڵان', 'عسل مولاس للأطفال', 'Kids Honey Molasses', 'مۆلاسی هەنگوین بۆ منداڵان — یارمەتی گەشەکردن و زیادکردنی ئارەزووی خواردن دەدات. سروشتی و خۆشە بۆ منداڵان.', 'عسل مولاس للأطفال — يساعد على النمو وفتح الشهية. طبيعي ولذيذ للأطفال.', 'Kids honey molasses — supports growth and appetite. Natural and tasty for children.', 20000, NULL, 'tea-wellness', 'products/kids-molasses.jpg', NULL, true, true, 5.0, 26, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (19, 'سێتی کرێمی سپیکەرەوە و سابوون', 'طقم كريم التفتيح مع الصابون', 'Lightening Cream + Soap Set', 'سێتی سپیکردنەوە — کرێمی سپیکەرەوە لەگەڵ سابوونی تایبەتی خۆی. پێکەوە بەکاردەهێنرێن بۆ ڕووناککردنەوەی پێست و یەکخستنی ڕەنگی پێست.', 'طقم التفتيح — كريم تفتيح مع صابونته الخاصة. يستخدمان معاً لتفتيح البشرة وتوحيد لونها.', 'Lightening set — lightening cream with its matching soap. Used together to brighten and even out skin tone.', 15000, NULL, 'face-care', 'products/lightening-set.jpg', NULL, true, true, 4.9, 23, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (20, 'کرێمی سپیایی هێلکە — دژە پەڵە', 'كريم البيض المفتح — ضد البقع', 'Egg Brightening Cream — Anti-Spot', 'کرێمی سپیایی هێلکە — بۆ پەڵەی ڕوو. پەڵە تاریکەکان کاڵ دەکاتەوە و ڕەنگی پێست یەکدەخات.', 'كريم البيض المفتح — للبقع. يخفف البقع الداكنة ويوحد لون البشرة.', 'Egg brightening cream — for dark spots. Fades spots and evens skin tone.', 15000, NULL, 'face-care', 'products/egg-cream-spots.jpg', NULL, false, false, 4.8, 11, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (23, 'سیرۆمی ڤیتامین سی', 'سيروم فيتامين سي', 'Vitamin C Serum', 'سیرۆمی ڤیتامین سی — پێست گەش دەکاتەوە، پەڵە کاڵ دەکاتەوە و درەوشانەوە بە ڕوو دەبەخشێت.', 'سيروم فيتامين سي — يفتح البشرة ويخفف البقع ويمنح الوجه إشراقة.', 'Vitamin C serum — brightens skin, fades spots and gives the face a radiant glow.', 12000, NULL, 'face-care', 'products/vitamin-c-serum.jpg', NULL, true, true, 4.9, 17, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (24, 'چای دیتۆکسی ئەنەناس — ٣٠ کیس', 'شاي ديتوكس الأناناس — ٣٠ كيس', 'Pineapple Detox Tea — 30 Sachets', 'چای دیتۆکسی ئەنەناس — ٣٠ کیس. بۆ پاککردنەوەی جەستە و هاوکاری لاوازبوون.', 'شاي ديتوكس الأناناس — ٣٠ كيساً. لتنقية الجسم والمساعدة على التنحيف.', 'Pineapple detox tea — 30 sachets. Cleanses the body and supports slimming.', 25000, NULL, 'tea-wellness', 'products/pineapple-detox.jpg', NULL, true, true, 4.9, 24, '2026-08-06 11:00:50.633173');
INSERT INTO public.products VALUES (25, 'دژەخۆر SPF60', 'واقي الشمس SPF60', 'Sunscreen SPF60', 'دژەخۆر SPF60 — دوای وەرگرتنی هەر چارەسەرێکی پێست بە ئیجباری پێویستە. لە وەرزی هاوین بۆ هەموو پێستت پێویستە و بۆ هەموو جۆرە پێستێک گونجاوە.', 'واقي الشمس SPF60 — ضروري بعد أي علاج للبشرة. لا غنى عنه في الصيف ومناسب لجميع أنواع البشرة.', 'Sunscreen SPF60 — essential after any skin treatment. A summer must-have, suitable for all skin types.', 8000, NULL, 'face-care', 'products/sunscreen-spf60.jpg', NULL, false, false, 4.8, 10, '2026-08-06 11:00:50.633173');


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.site_settings VALUES ('social_facebook', '', '', 'https://www.facebook.com/mangherbal');
INSERT INTO public.site_settings VALUES ('social_instagram', '', '', 'https://www.instagram.com/mang__herbal/');
INSERT INTO public.site_settings VALUES ('social_tiktok', '', '', 'https://www.tiktok.com/@mang_herbal');
INSERT INTO public.site_settings VALUES ('social_whatsapp', '', '', '9647701432814');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'Admin', '7501263713', '$2b$10$bY0w/vByypAFQWa5/11bfu/nvbRG2Zw2e3WMkaNJ2MUie0iQpyGQe', 'admin', NULL, NULL, '2026-08-02 20:59:55.185291', NULL, '2026-08-06 10:33:55.312');


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 6, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 4, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 2, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 25, true);


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


