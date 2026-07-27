---
name: Mang Herbal conventions
description: Durable lessons for Mang Herbal not covered by replit.md (auth wiring, orval quirks, watermark idempotency, WhatsApp flow, reset race)
---

## Auth header wiring
JWT lives in localStorage; `setAuthTokenGetter` must stay registered at App.tsx module scope. If authenticated calls 401 while a valid token exists, check this wiring first — a refactor once dropped it and every admin/cart/favorites call broke while `/auth/me` still worked.

## Orval query options need explicit queryKey
The generated hooks type `query` options with a required `queryKey`. Whenever passing options (`enabled`, `refetchInterval`, …), also pass `queryKey: get<Operation>QueryKey()` or typecheck fails.

## Images already watermarked (2026-07-27)
All product jpgs in `public/products/` and the hero image carry the gold logo bottom-right (composited in place, ~16% width, 62% opacity). Re-running a watermark pass doubles the logo — regenerate the base image first if a redo is ever needed.

## WhatsApp order flow: auto-send via CallMeBot + deep-link fallback
Server auto-sends new orders via CallMeBot (`api.callmebot.com/whatsapp.php`, free personal API; owner activates by WhatsApping "I allow callmebot to send me messages" to +34 644 78 33 97 to get a per-number key). Keys live in the `order_whatsapp_apikeys` setting as `number:key` CSV; numbers in `order_whatsapp_numbers` CSV (same value in all 3 language columns; normalize leading 0 → `964…`). Sending is fire-and-forget after order insert — must never block/fail order creation. Deep-link fallback (customer tap + admin share) remains.
**Why:** official WhatsApp Business/Twilio need Meta business accounts/payment — infeasible for this owner.
**Gotchas:** CallMeBot returns HTTP 203 + "APIKey is invalid" for bad keys (detect failure by body text, not just status). `order_whatsapp_apikeys` is filtered out of public `GET /api/settings` (PRIVATE_SETTING_KEYS in the settings route) — never expose it; admin UI reads via the auth-gated admin settings endpoint.
**Testing note:** wa.me redirects to `api.whatsapp.com/send/` — URL assertions must accept both prefixes. E2E tester instructions must forbid modifying existing accounts (especially the admin user) — have them create their own throwaway accounts instead.
**Normalization rule:** all number↔key lookups (server and admin UI) must go through the same normalize step (0…→964…); raw-string lookups silently mismatch keys stored in the other format.

## Translated zod messages
Build zod schemas *inside* the component so `t(ckb, ar, en)` is in scope for message strings; module-level schemas silently reintroduce English-only validation errors.

## Password reset race
Code redemption must remain a single atomic conditional UPDATE (code + expiry inside the WHERE) to prevent replay races. Codes are stored plaintext by design so the admin can re-read and hand them over.
