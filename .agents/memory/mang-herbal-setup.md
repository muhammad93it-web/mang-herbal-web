---
name: Mang Herbal project setup
description: Key decisions and pitfalls for the Mang Herbal e-commerce React+Vite app
---

## API routing fix
`setBaseUrl` must be set to `''` (empty string) in App.tsx.
The shared proxy routes `/api` → api-server (port 8080). If setBaseUrl is set to `import.meta.env.BASE_URL` (e.g. `/mang-herbal`), API calls go to `/mang-herbal/api/...` which 404s.

**Why:** pnpm-workspace proxy is path-based; API server handles `/api` prefix globally.

## Products route null-guard
Query params sent as string "null"/"undefined" from the frontend must be filtered in the backend with an `isValidStr()` guard before adding Drizzle conditions.
`parseInt("null")` = NaN causes DB query failures.

## Admin credentials
Phone: 1 / Password: 1 (role: admin) — user requested simple credentials on 2026-07-27.
Admin panel button is visible in navbar (desktop + mobile menu) when logged in as admin.

## DB schema
Tables: users, categories, products, cart_items, orders, favorites
Seeded: 6 categories, 11 products, 1 admin user

## Auth
JWT via SESSION_SECRET env var. Token stored in localStorage key "mang_token".
setAuthTokenGetter wired in AuthContext to inject Bearer token into API calls.
