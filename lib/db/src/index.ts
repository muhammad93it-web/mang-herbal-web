import {
  drizzle as drizzlePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import pg from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Neon endpoints also speak the Postgres protocol over WebSockets on port
// 443. Shared hosts (e.g. Namecheap cPanel) usually block outbound TCP 5432,
// so for *.neon.tech we connect via WebSocket instead of raw TCP.
// DB_DRIVER=pg or DB_DRIVER=neon-ws overrides the hostname detection.
function detectDriver(): "neon-ws" | "pg" {
  const override = process.env.DB_DRIVER;
  if (override === "pg" || override === "neon-ws") return override;
  try {
    const host = new URL(process.env.DATABASE_URL!).hostname;
    if (host.endsWith(".neon.tech")) return "neon-ws";
  } catch {
    // fall through to pg; the pool will surface a clear connection error
  }
  return "pg";
}

export const dbDriver = detectDriver();

let poolInstance: pg.Pool;
let dbInstance: NodePgDatabase<typeof schema>;

if (dbDriver === "neon-ws") {
  neonConfig.webSocketConstructor = ws; // Node < 22 has no global WebSocket
  const neonPool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
    // Shared hosting (Passenger) may run several app processes; keep each
    // process's pool tiny and close idle sockets quickly so Neon's compute
    // can suspend when the shop is quiet.
    max: 2,
    idleTimeoutMillis: 30_000,
  });
  // NeonPool is API-compatible with pg.Pool (query/connect/end), and the
  // neon-serverless drizzle instance has the same query API as node-postgres.
  poolInstance = neonPool as unknown as pg.Pool;
  dbInstance = drizzleNeon(neonPool, {
    schema,
  }) as unknown as NodePgDatabase<typeof schema>;
} else {
  poolInstance = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzlePg(poolInstance, { schema });
}

export const pool = poolInstance;
export const db = dbInstance;

export * from "./schema";
