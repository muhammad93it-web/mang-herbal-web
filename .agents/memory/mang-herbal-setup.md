---
name: Mang Herbal conventions
description: Durable lessons for Mang Herbal not covered by replit.md (auth wiring, orval quirks, watermark idempotency, WhatsApp flow, reset race)
---

## Auth header wiring
JWT lives in localStorage; `setAuthTokenGetter` must stay registered at App.tsx module scope. If authenticated calls 401 while a valid token exists, check this wiring first — a refactor once dropped it and every admin/cart/favorites call broke while `/auth/me` still worked.

## Orval query options need explicit queryKey
The generated hooks type `query` options with a required `queryKey`. Whenever passing options (`enabled`, `refetchInterval`, …), also pass `queryKey: get<Operation>QueryKey()` or typecheck fails.

## Orval: never use `format: email` in openapi.yaml
It makes Orval emit `zod.email()` (zod-v4-only API) into `lib/api-zod`, which breaks against the workspace zod v3 at build time. Use a regex `pattern` instead (one already sits in the spec with a comment).

## Drizzle push prompts interactively on column adds
`drizzle-kit push` can stop at an interactive prompt (offering truncate) even for additive columns, which hangs/misleads in a non-TTY shell. For additive changes: apply manual `ALTER TABLE` SQL first, then run push and confirm it reports "No changes detected".

## Product images carry an opaque logo badge (2026-08-01)
All product jpgs in `public/products/` have a baked-in brand seal bottom-right: opaque #0A0A0A disk (21.5% of width, 1.37% margin) with the gold logo PNG at 88% of disk size, full opacity. It was composited OVER an older faint 62% watermark to hide it — so the disk must stay opaque and any redo must use the same-or-larger geometry (disk ≥21.5%, margin ≤1.37%) or the old mark ghosts out from underneath. Originals were never committed; git only has watermarked versions. The displayed hero is now `public/hero.jpg` — a pre-cropped 4:5 version with the old cropped mark patched over (color-matched disk) and a fresh fully-visible badge; the original `attached_assets/generated_images/herbal-hero.jpg` still carries the old faint 62% mark, so never display it raw again.
**Why:** owner wanted the logo fully and clearly visible; pristine base images are unrecoverable, so covering beat regenerating.
**How to apply:** if images are ever regenerated or added, run the same badge pass (sharp lives in `scripts/` package; node scripts must sit inside `scripts/` dir to resolve it). Product cards show images uncropped (square) so the corner badge stays fully visible — keep it that way.

## WhatsApp order flow: auto-send via CallMeBot + deep-link fallback
Server auto-sends new orders via CallMeBot (`api.callmebot.com/whatsapp.php`, free personal API; owner activates by WhatsApping "I allow callmebot to send me messages" to +34 644 78 33 97 to get a per-number key). Keys live in the `order_whatsapp_apikeys` setting as `number:key` CSV; numbers in `order_whatsapp_numbers` CSV (same value in all 3 language columns; normalize leading 0 → `964…`). Sending is fire-and-forget after order insert — must never block/fail order creation. Deep-link fallback (customer tap + admin share) remains.
**Why:** official WhatsApp Business/Twilio need Meta business accounts/payment — infeasible for this owner.
**Gotchas:** CallMeBot returns HTTP 203 + "APIKey is invalid" for bad keys (detect failure by body text, not just status). `order_whatsapp_apikeys` is filtered out of public `GET /api/settings` (PRIVATE_SETTING_KEYS in the settings route) — never expose it; admin UI reads via the auth-gated admin settings endpoint.
**Testing note:** wa.me redirects to `api.whatsapp.com/send/` — URL assertions must accept both prefixes. E2E tester instructions must forbid modifying existing accounts (especially the admin user) — have them create their own throwaway accounts instead.
**Normalization rule:** all number↔key lookups (server and admin UI) must go through the same normalize step (0…→964…); raw-string lookups silently mismatch keys stored in the other format.

## Self-host export package (Namecheap cPanel)
Owner self-hosts a copy on Namecheap shared hosting + Neon Postgres; the hosted copy never updates itself — after any change the owner wants live, regenerate `mang-herbal-host-package.zip` (gitignored) with `bash scripts/build-host-package.sh` (committed; templates in `scripts/host-package/`: CJS Passenger launcher, Kurdish SETUP-GUIDE, minimal package.json). Zip ships `database.sql` (fresh `pg_dump` of the live dev DB taken at build time by `build-host-package.sh` — carries ALL current products/users/orders/settings; falls back to the committed seed if pg_dump fails) + `migrate-existing-db.sql` (incremental ALTERs — email, last_login_at — for the owner's live DB; live DBs must get ALTERs, never a re-import).
**Why:** owner insisted on own host/domain; shared hosting can't build native modules (bcryptjs, not bcrypt — verifies old $2b$ hashes) and has no Postgres (hence Neon).
**Gotchas:** the vite config throws unless BOTH `BASE_PATH` and `PORT` are set, even for plain builds; Passenger needs a CJS launcher (can't load ESM startup files); static serving must use `redirect: false` because `public/products/` collides with the `/products` SPA route. `database.sql` gets imported through Neon's WEB SQL editor (not psql), so the dump must be plain SQL: `pg_dump --inserts` (no COPY FROM stdin) and strip psql meta-commands (`\restrict`/`\unrestrict` from newer pg_dump) plus PG17-only `SET transaction_timeout` — backslash commands fail there with "unsupported command". The server does NOT read `.env`; env vars must be set in cPanel's Node.js App UI.

## Translated zod messages
Build zod schemas *inside* the component so `t(ckb, ar, en)` is in scope for message strings; module-level schemas silently reintroduce English-only validation errors.

## Password reset race
Code redemption must remain a single atomic conditional UPDATE (code + expiry inside the WHERE) to prevent replay races. Codes are stored plaintext by design so the admin can re-read and hand them over.

## First-login welcome claim
`firstLogin` must come from the atomic conditional UPDATE (`SET last_login_at = now() WHERE id = ? AND last_login_at IS NULL` + returning), never from a prior SELECT — otherwise two concurrent logins both win the special welcome. Registration sets `last_login_at` at insert and the UI always treats registration as first time.

## Language switcher flags are inline SVGs
Owner law bans emoji everywhere, including flags: the switcher uses hand-drawn SVG components in `components/layout/flags.tsx` (Kurdistan sun / Iraq / UK). Reuse those for any locale UI; never substitute emoji flags or an icon-font.

## Namecheap blocks outbound 5432 → Neon over WebSocket 443
Her cPanel host refuses outbound TCP to 5432 (ECONNREFUSED in ~1s — firewall, not Neon). Fix: `lib/db/src/index.ts` auto-selects a driver — `*.neon.tech` host ⇒ `@neondatabase/serverless` Pool over WSS 443 + `drizzle-orm/neon-serverless` (with `ws` pkg as webSocketConstructor, pool max 2, idle 30s for Passenger); anything else ⇒ pg.Pool + node-postgres (dev). `DB_DRIVER=pg|neon-ws` overrides.
**Why:** shared hosts commonly firewall non-web outbound ports; 443 is always open.
**How to apply:** never assume raw 5432 works from shared hosting; test with the gated diagnostic below before blaming credentials.

## pnpm peer dedup: @neondatabase/serverless must be in BOTH lib/db and api-server
It is a drizzle-orm peer; installing it in only one package makes pnpm build two drizzle-orm instances → hundreds of nominal type errors ("separate declarations of a private property"). Add the dep to every package that imports drizzle-orm.

## Composite refs: rebuild lib/db d.ts after editing it
api-server typecheck reads `lib/db/dist/*.d.ts` (project references, emitDeclarationOnly). After changing lib/db exports run `pnpm exec tsc -b lib/db` or typecheck reports missing members that exist in source.

## Gated DB diagnostic + redaction
`GET /api/healthz/db` needs header `x-diag: 1` (else 404). Reports driver, host, TCP tests to DB port + 443, and a credential-redacted pg error cause chain (`api-server/src/lib/redact.ts`; final error handler also redacts). Update zips for her host can ship `dist/index.mjs` alone — the pino sibling worker files in dist/ are stable across builds.

## Admin backup button (settings page)
`GET /api/admin/backup` (requireAdmin) streams a self-contained restore .sql (drop schema + DDL + INSERTs + setvals) built by `api-server/src/lib/backup.ts` inside one repeatable-read read-only transaction. The DDL there is HARDCODED to mirror `lib/db/src/schema` — **any schema change must update backup.ts in the same commit**. File is Neon-web-editor-safe (INSERTs only, `SET standard_conforming_strings = on` pinned). Frontend: manual fetch + blob download in AdminSettings (not orval — file download). Update zips that touch the storefront must include `public/index.html` + `public/assets/*` (new hashes), not just dist/index.mjs.
