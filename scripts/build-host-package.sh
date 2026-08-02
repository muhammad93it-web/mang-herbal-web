#!/usr/bin/env bash
# Build the self-hosting package (mang-herbal-host-package.zip).
#
# Produces a zip the shop owner uploads to cPanel (Passenger + Node 20):
#   app.cjs            Passenger launcher (CJS -> imports ESM bundle)
#   dist/              bundled API server (self-contained, no node_modules)
#   public/            built storefront (served by the API via STATIC_DIR)
#   database.sql       full dump for a FRESH database (regenerated from live data at build time)
#   migrate-existing-db.sql  incremental migration for an EXISTING live database
#   SETUP-GUIDE.md     Kurdish setup guide
#
# Usage: bash scripts/build-host-package.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STAGE="$ROOT/build/host-package"
ZIP="$ROOT/mang-herbal-host-package.zip"

echo "==> Building storefront (BASE_PATH=/)"
# vite.config.ts requires PORT and BASE_PATH even for builds; PORT is unused at runtime here.
BASE_PATH=/ PORT=5000 NODE_ENV=production pnpm --filter @workspace/mang-herbal run build

echo "==> Building API server bundle"
pnpm --filter @workspace/api-server run build

echo "==> Assembling package"
rm -rf "$STAGE" "$ZIP"
mkdir -p "$STAGE"

cp -r artifacts/api-server/dist "$STAGE/dist"
# vite emits the storefront to dist/public — copy that inner dir, not dist itself
cp -r artifacts/mang-herbal/dist/public "$STAGE/public"
test -f "$STAGE/public/index.html" || { echo "ERROR: storefront index.html missing — wrong copy path"; exit 1; }
cp scripts/host-package/app.cjs "$STAGE/app.cjs"
cp scripts/host-package/package.json "$STAGE/package.json"
cp scripts/host-package/SETUP-GUIDE.md "$STAGE/SETUP-GUIDE.md"
# Ship the CURRENT data: dump the live dev database when available so the
# owner's products, settings, users and images always travel with the package.
if [ -n "${DATABASE_URL:-}" ] && pg_dump --no-owner --no-privileges --inserts "$DATABASE_URL" > "$STAGE/database.sql.raw" 2>/dev/null && [ -s "$STAGE/database.sql.raw" ]; then
  # The owner imports this through Neon's WEB SQL editor, which is not psql:
  # COPY FROM stdin blocks, psql meta-commands (\restrict/\unrestrict from
  # newer pg_dump) and PG17-only SETs all fail there. --inserts avoids COPY;
  # strip the rest so the file is plain SQL that runs anywhere.
  grep -v -e '^\\' -e '^SET transaction_timeout' "$STAGE/database.sql.raw" > "$STAGE/database.sql"
  rm -f "$STAGE/database.sql.raw"
  cp "$STAGE/database.sql" database.sql
  echo "    database.sql regenerated from the live database (plain INSERTs)"
else
  rm -f "$STAGE/database.sql.raw"
  cp database.sql "$STAGE/database.sql"
  echo "    WARNING: live dump unavailable — shipping the committed database.sql"
fi
cp migrate-existing-db.sql "$STAGE/migrate-existing-db.sql"

echo "==> Zipping"
(cd "$STAGE" && zip -rq "$ZIP" .)

echo "==> Done: $ZIP"
unzip -l "$ZIP" | tail -5
