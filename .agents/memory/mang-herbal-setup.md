---
name: Mang Herbal conventions
description: Durable lessons for Mang Herbal not covered by replit.md (auth wiring, orval quirks, watermark idempotency, WhatsApp flow, reset race)
---

## Auth header wiring
JWT lives in localStorage; `setAuthTokenGetter` must stay registered at App.tsx module scope. If authenticated calls 401 while a valid token exists, check this wiring first — a refactor once dropped it and every admin/cart/favorites call broke while `/auth/me` still worked.

## Orval query options need explicit queryKey
The generated hooks type `query` options with a required `queryKey`. Whenever passing options (`enabled`, `refetchInterval`, …), also pass `queryKey: get<Operation>QueryKey()` or typecheck fails.

## Product images carry an opaque logo badge (2026-08-01)
All product jpgs in `public/products/` have a baked-in brand seal bottom-right: opaque #0A0A0A disk (21.5% of width, 1.37% margin) with the gold logo PNG at 88% of disk size, full opacity. It was composited OVER an older faint 62% watermark to hide it — so the disk must stay opaque and any redo must use the same-or-larger geometry (disk ≥21.5%, margin ≤1.37%) or the old mark ghosts out from underneath. Originals were never committed; git only has watermarked versions. The hero jpg (`attached_assets/generated_images/herbal-hero.jpg`) still carries only the old faint 62% mark (partially cropped by its 4:5 display) — untouched by the badge pass.
**Why:** owner wanted the logo fully and clearly visible; pristine base images are unrecoverable, so covering beat regenerating.
**How to apply:** if images are ever regenerated or added, run the same badge pass (sharp lives in `scripts/` package; node scripts must sit inside `scripts/` dir to resolve it). Product cards show images uncropped (square) so the corner badge stays fully visible — keep it that way.

## WhatsApp order flow: auto-send via CallMeBot + deep-link fallback
Server auto-sends new orders via CallMeBot (`api.callmebot.com/whatsapp.php`, free personal API; owner activates by WhatsApping "I allow callmebot to send me messages" to +34 644 78 33 97 to get a per-number key). Keys live in the `order_whatsapp_apikeys` setting as `number:key` CSV; numbers in `order_whatsapp_numbers` CSV (same value in all 3 language columns; normalize leading 0 → `964…`). Sending is fire-and-forget after order insert — must never block/fail order creation. Deep-link fallback (customer tap + admin share) remains.
**Why:** official WhatsApp Business/Twilio need Meta business accounts/payment — infeasible for this owner.
**Gotchas:** CallMeBot returns HTTP 203 + "APIKey is invalid" for bad keys (detect failure by body text, not just status). `order_whatsapp_apikeys` is filtered out of public `GET /api/settings` (PRIVATE_SETTING_KEYS in the settings route) — never expose it; admin UI reads via the auth-gated admin settings endpoint.
**Testing note:** wa.me redirects to `api.whatsapp.com/send/` — URL assertions must accept both prefixes. E2E tester instructions must forbid modifying existing accounts (especially the admin user) — have them create their own throwaway accounts instead.
**Normalization rule:** all number↔key lookups (server and admin UI) must go through the same normalize step (0…→964…); raw-string lookups silently mismatch keys stored in the other format.

## Self-host export package (Namecheap cPanel)
Owner self-hosts a copy on Namecheap + Neon. Export flow: `BASE_PATH=/ PORT=<any> vite build` (config throws without BOTH env vars) → dist/public; esbuild server bundle needs no node_modules on the host (bcrypt was swapped to bcryptjs for this — pure JS, verifies old $2b$ hashes); `app.cjs` CJS launcher (Passenger can't load ESM directly) reads `.env`, sets STATIC_DIR, dynamic-imports index.mjs. Server serves the storefront when STATIC_DIR is set — MUST use `express.static(dir, { redirect: false })` because `public/products/` collides with the `/products` SPA route (dir-redirect breaks routing). Ship `database.sql` (pg_dump --no-owner --no-privileges).
**Why:** owner insisted on own host/domain; shared hosting can't build native modules and has no Postgres (hence Neon).
**How to apply:** after any change the owner wants live, rebuild both, reassemble the package dir, re-zip (`mang-herbal-host-package.zip`, gitignored) — the hosted copy never updates itself.

## Translated zod messages
Build zod schemas *inside* the component so `t(ckb, ar, en)` is in scope for message strings; module-level schemas silently reintroduce English-only validation errors.

## Password reset race
Code redemption must remain a single atomic conditional UPDATE (code + expiry inside the WHERE) to prevent replay races. Codes are stored plaintext by design so the admin can re-read and hand them over.
