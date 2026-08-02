// Phusion Passenger (cPanel) launcher for the Mang Herbal server.
// Passenger requires a CommonJS entry file; the real server is an ESM bundle,
// so this file just sets defaults and dynamically imports it.
const path = require("node:path");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
// Serve the built storefront from ./public (absolute path, independent of cwd).
process.env.STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, "public");

import("./dist/index.mjs").catch((err) => {
  console.error("Failed to start Mang Herbal server:", err);
  process.exit(1);
});
