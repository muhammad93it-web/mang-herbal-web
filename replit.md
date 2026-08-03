# Mang Herbal — مانگ هێربال

Online storefront for a Kurdish herbal cosmetics shop (Nawroz, Erbil): customers browse and order natural skin/hair products; the owner manages orders, products, customers, and site texts from an admin panel.

## Run & Operate

- `pnpm --filter @workspace/mang-herbal run dev` — storefront (Vite, preview at `/mang-herbal/`)
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080, proxied at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — seed starter catalog (3 categories, 11 products; products only when table is empty)
- `bash scripts/build-host-package.sh` — build `mang-herbal-host-package.zip` for self-hosting (cPanel/Passenger; templates in `scripts/host-package/`); runs a fresh `pg_dump` so the zip always carries the current data (products, users, orders, settings)
- `node src/apply-badge.mjs <img...>` (run inside `scripts/`) — stamp the brand seal onto new product photos
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui, wouter routing, TanStack Query via generated hooks
- API: Express 5 · DB: PostgreSQL + Drizzle ORM · Validation: Zod (`zod/v4`)
- API codegen: Orval (from `lib/api-spec/openapi.yaml`)

## Production (live site) — read this first in a new account/workspace

This chat's history does NOT travel with the project — this file does. Everything below is what a future agent needs to operate the live site without re-asking the owner.

- Live at **https://mang-herbal.com** — self-hosted by the owner on **Namecheap shared cPanel** (Phusion Passenger, Node 20.20.0), app folder `/home/mangidvu/mang-herbal-app`. There is NO Replit deployment and the owner does not want one suggested.
- Production database: **Neon Postgres** — endpoint `ep-jolly-boat-a2bis3o7.eu-central-1.aws.neon.tech`, database `neondb`. Credentials live ONLY in the server's `.env` (`DATABASE_URL`) and in the owner's Neon account — never in this repo. The workspace dev DB is a completely separate database with separate data; nothing done in dev touches live data.
- **Namecheap blocks outbound TCP 5432.** `lib/db/src/index.ts` therefore picks the driver by hostname: `*.neon.tech` → `@neondatabase/serverless` Pool over WebSocket :443 (driver name `neon-ws`, uses `ws`); any other host → node-postgres (`pg`). `DB_DRIVER=pg|neon-ws` overrides. Never "simplify" this back to a single driver — plain `pg` cannot reach Neon from her host.
- Shipping an update: `bash scripts/build-host-package.sh`, then make a small zip of only the changed files — always `dist/index.mjs`; ALSO `public/index.html` + `public/assets/*` whenever the storefront changed. The owner's entire skill set for deploys: cPanel File Manager → upload zip → Extract → delete zip → Stop App → Start App. Give her exactly those steps, then verify with `curl https://mang-herbal.com/api/products`.
- Remote diagnostics: `GET https://mang-herbal.com/api/healthz/db` with header `x-diag: 1` (404 without it) reports active driver, TCP reachability, and credential-redacted error chains.
- Backups: Admin panel → Settings → "Download Backup" (`GET /api/admin/backup`) yields a self-contained restore `.sql` (Neon-SQL-Editor-safe: plain INSERTs, no COPY). Restore = paste the whole file into the Neon SQL Editor → Run. The DDL inside `artifacts/api-server/src/lib/backup.ts` is hardcoded — **update it in the same commit as any schema change**.
- Fresh workspace/fork setup: create the dev Postgres, ensure the `SESSION_SECRET` secret exists, `pnpm install`, `pnpm --filter @workspace/db run push`, then `run seed` — or restore one of the owner's backup `.sql` files for real data. Dev admin login: phone `7501263713`, password `123456` (production has its own password, known only to the owner).
- **Keep this section current**: whenever hosting, database, drivers, or the update flow change, update this file in the same session — the next agent may be in a different account with zero chat history.

## Where things live

- DB schema: `lib/db/src/schema/` (users, categories, products, carts, orders, favorites, settings)
- API contract: `lib/api-spec/openapi.yaml` → generated hooks in `lib/api-client-react`, Zod in `lib/api-zod`
- API routes: `artifacts/api-server/src/routes/`
- Storefront: `artifacts/mang-herbal/src/` — theme tokens in `index.css`, i18n in `contexts/LanguageContext.tsx`
- Product photos: `artifacts/mang-herbal/public/products/*.jpg`; DB `image_url` holds relative paths (`products/x.jpg`) resolved with `import.meta.env.BASE_URL`
- Logo: `attached_assets/logo_png_be_back_1784753437461.png`

## Architecture decisions

- Editable site texts live in `site_settings` (key + 3 language columns), served publicly via `GET /api/settings`, upserted via `PUT /api/admin/settings`
- Password reset is admin-mediated: admin generates a 6-digit code (24h validity) shown in `/admin/users` and sends it to the customer via WhatsApp or email (emails visible in the admin users table); the customer can request one from `/forgot-password` via a prefilled WhatsApp deep link, then redeems it there (`POST /api/auth/reset-password`)
- Registration requires phone AND email (email stored nullable-unique for legacy rows; normalized trim+lowercase; duplicates rejected)
- `setBaseUrl('')` in App.tsx is required — the shared proxy routes `/api` directly; prefixing the artifact base path breaks API calls
- Express 5 types `req.params.*` as `string | string[]` — always use `paramToInt()` from `src/lib/params.ts`
- Hero image is a site setting (`hero_image`, one value copied into all 3 language columns; empty = bundled `public/hero.jpg`); edited in Admin Settings → Hero section
- First-login welcome: login claims `users.last_login_at` atomically (`WHERE last_login_at IS NULL`) and returns `firstLogin`; the storefront shows a special first-time toast vs. a short returning toast with a Flower2 icon (`src/lib/welcome.tsx`); register always counts as first time

## Product

- Customer: browse by category, search/filter, product detail, cart, checkout (cash on delivery), order history, favorites, register by phone + email / login by phone. Checkout requires login and collects name/phone/address; the success screen offers prefilled wa.me links to send the order to the shop's WhatsApp (customer must tap send). Mobile app feel: PWA (manifest + icons, installable) and a fixed bottom tab bar on mobile (Home/Products/Favorites/Cart/Account). Language switcher shows flag + language name (hand-drawn SVG flags in `components/layout/flags.tsx` — Kurdistan/Iraq/UK, no emoji). Logout navigates home with a goodbye toast.
- Admin (role `admin`): stats overview, order status management, product CRUD, customer list with reset-code generation, site-text editor (hero/footer/contact, 3 languages), new-order bell with unseen count + row highlight, one-tap copy / wa.me share of formatted order text. Mobile admin: horizontal pill nav replaces the sidebar, and orders render as labeled cards.
- Automatic WhatsApp order notifications via CallMeBot (free personal API): server fire-and-forgets each new order to owner numbers configured in `order_whatsapp_numbers`, using per-number API keys in `order_whatsapp_apikeys` (`number:key` CSV, admin-only setting filtered from the public settings API). Admin Settings has the activation guide, key inputs, and a Test button (`POST /api/admin/whatsapp-test`). Numbers without a key still get the manual deep-link flow.

## User preferences

- **LAW — full translation**: when the language switches (Kurdish Sorani / Arabic / English), EVERYTHING on the site must switch — every label, button, toast, error, empty state, admin screen. No hardcoded single-language strings. Kurdish (ckb) is default; ckb/ar are RTL, en is LTR; use the `t(ckb, ar, en)` helper.
- **Text inputs auto-direction**: base `Input`/`Textarea` default to `dir="auto"` — typed Kurdish/Arabic renders RTL, English LTR. Keep explicit `dir="ltr"` only for technical fields (phone, price, codes, URLs, API keys, passwords). Password fields with an eye toggle: wrap in a `dir="ltr"` container so the eye sits right and never overlaps typed text.
- **No "Ready for review" / completion prompts in chat until the user asks** — do not propose follow-up tasks or push review cards unprompted; wait for the user to request them.
- **No emojis anywhere** in the UI or content. Icons only (lucide-react).
- Phone numbers always render `dir="ltr"` regardless of language.
- Brand: near-black `#0A0A0A` + gold `#C9A84C`; luxury boutique feel.
- Contact: +964 770 143 2814 · mangherbal@gmail.com · Nawroz, Erbil.
- The owner intentionally uses very simple admin credentials (her choice — never add password-strength rules to the login form; strength rules belong to registration/reset only).

## Gotchas

- After editing `openapi.yaml`: run codegen, then restart the API workflow; after DB schema edits: `db push`
- Frontend query params can arrive as literal `"null"`/`"NaN"` strings — API routes guard with `isValidStr()` (products.ts)
- Do not modify `artifacts/mang-herbal/vite.config.ts` — canonical scaffold version (PORT/BASE_PATH, allowedHosts) must stay
- Never use `format: email` in `openapi.yaml` — Orval emits zod-v4-only `zod.email()` which breaks the build; use the regex `pattern` already in the spec
- `drizzle push` may prompt interactively (truncate offers) — for additive changes apply manual `ALTER TABLE` SQL, then verify push reports "No changes detected"

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
