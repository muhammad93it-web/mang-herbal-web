import { pool } from "@workspace/db";

/**
 * Generates a fully self-contained SQL restore file for the whole store
 * database. Constraints (learned from the owner's hosting setup):
 *  - Must run in Neon's WEB SQL editor: plain INSERTs only (no COPY FROM
 *    stdin), no psql meta-commands.
 *  - Must round-trip values exactly: timestamp/jsonb columns are selected
 *    with ::text casts so the driver never converts them to JS Dates/objects
 *    (avoids timezone mangling on hosts with a non-UTC clock).
 *  - Restoring REPLACES everything (drop schema + recreate), so running the
 *    file twice is safe.
 *
 * NOTE: the DDL below mirrors lib/db/src/schema — when the schema changes,
 * update this file in the same commit.
 */

const SCHEMA_DDL = `CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"reset_code" text,
	"reset_code_expires_at" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_ckb" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);

CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_ckb" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"desc_ckb" text NOT NULL,
	"desc_ar" text NOT NULL,
	"desc_en" text NOT NULL,
	"price" integer NOT NULL,
	"old_price" integer,
	"category_slug" text NOT NULL,
	"image_url" text,
	"badge" text,
	"in_stock" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"rating" numeric(3, 1) DEFAULT '4.5' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total" integer NOT NULL,
	"customer_name" text,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"note" text,
	"is_seen" boolean DEFAULT false NOT NULL,
	"items" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value_ckb" text DEFAULT '' NOT NULL,
	"value_ar" text DEFAULT '' NOT NULL,
	"value_en" text DEFAULT '' NOT NULL
);`;

type Col = { name: string; castText?: boolean };
type TableSpec = {
  table: string;
  orderBy: string;
  serial?: boolean;
  cols: Col[];
};

const TABLES: TableSpec[] = [
  {
    table: "users",
    orderBy: "id",
    serial: true,
    cols: [
      { name: "id" },
      { name: "name" },
      { name: "phone" },
      { name: "email" },
      { name: "password_hash" },
      { name: "role" },
      { name: "reset_code" },
      { name: "reset_code_expires_at", castText: true },
      { name: "last_login_at", castText: true },
      { name: "created_at", castText: true },
    ],
  },
  {
    table: "categories",
    orderBy: "id",
    serial: true,
    cols: [
      { name: "id" },
      { name: "slug" },
      { name: "name_ckb" },
      { name: "name_ar" },
      { name: "name_en" },
    ],
  },
  {
    table: "products",
    orderBy: "id",
    serial: true,
    cols: [
      { name: "id" },
      { name: "name_ckb" },
      { name: "name_ar" },
      { name: "name_en" },
      { name: "desc_ckb" },
      { name: "desc_ar" },
      { name: "desc_en" },
      { name: "price" },
      { name: "old_price" },
      { name: "category_slug" },
      { name: "image_url" },
      { name: "badge" },
      { name: "in_stock" },
      { name: "is_featured" },
      { name: "rating" },
      { name: "review_count" },
      { name: "created_at", castText: true },
    ],
  },
  {
    table: "orders",
    orderBy: "id",
    serial: true,
    cols: [
      { name: "id" },
      { name: "user_id" },
      { name: "status" },
      { name: "total" },
      { name: "customer_name" },
      { name: "phone" },
      { name: "address" },
      { name: "note" },
      { name: "is_seen" },
      { name: "items", castText: true },
      { name: "created_at", castText: true },
    ],
  },
  {
    table: "cart_items",
    orderBy: "id",
    serial: true,
    cols: [
      { name: "id" },
      { name: "user_id" },
      { name: "product_id" },
      { name: "quantity" },
      { name: "created_at", castText: true },
    ],
  },
  {
    table: "favorites",
    orderBy: "id",
    serial: true,
    cols: [
      { name: "id" },
      { name: "user_id" },
      { name: "product_id" },
      { name: "created_at", castText: true },
    ],
  },
  {
    table: "site_settings",
    orderBy: "key",
    cols: [
      { name: "key" },
      { name: "value_ckb" },
      { name: "value_ar" },
      { name: "value_en" },
    ],
  },
];

/** SQL literal for a value already normalized to string/number/boolean/null. */
function lit(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return `'${String(v).replace(/'/g, "''")}'`;
}

export async function generateBackupSql(): Promise<string> {
  const dataParts: string[] = [];
  const counts: Array<{ table: string; rows: number }> = [];

  // One repeatable-read read-only transaction = a consistent snapshot even
  // when orders arrive while the backup is being generated.
  const client = await pool.connect();
  try {
    await client.query(
      "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
    );
    for (const spec of TABLES) {
      const selectList = spec.cols
        .map((c) =>
          c.castText ? `"${c.name}"::text AS "${c.name}"` : `"${c.name}"`,
        )
        .join(", ");
      const result = await client.query(
        `SELECT ${selectList} FROM "${spec.table}" ORDER BY "${spec.orderBy}"`,
      );
      counts.push({ table: spec.table, rows: result.rows.length });

      const colNames = spec.cols.map((c) => `"${c.name}"`).join(", ");
      dataParts.push(`-- ${spec.table} (${result.rows.length} rows)`);
      for (const row of result.rows as Array<Record<string, unknown>>) {
        const values = spec.cols.map((c) => lit(row[c.name])).join(", ");
        dataParts.push(
          `INSERT INTO "${spec.table}" (${colNames}) VALUES (${values});`,
        );
      }
      dataParts.push("");
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }

  const setvals = TABLES.filter((t) => t.serial).map(
    (t) =>
      `SELECT setval(pg_get_serial_sequence('${t.table}','id'), COALESCE((SELECT MAX(id) FROM "${t.table}"), 0) + 1, false);`,
  );

  const summary = counts.map((c) => `--   ${c.table}: ${c.rows}`).join("\n");

  return [
    `-- Mang Herbal database backup`,
    `-- Created: ${new Date().toISOString()}`,
    `-- Contents:`,
    summary,
    `--`,
    `-- RESTORE: paste this WHOLE file into the Neon SQL Editor and press Run.`,
    `-- WARNING: restoring deletes current data and replaces it with this copy.`,
    ``,
    `-- Pin literal parsing so quote-doubling escaping is always interpreted`,
    `-- correctly, regardless of the restore session's defaults.`,
    `SET standard_conforming_strings = on;`,
    ``,
    `DROP SCHEMA public CASCADE;`,
    `CREATE SCHEMA public;`,
    ``,
    SCHEMA_DDL,
    ``,
    ...dataParts,
    ...setvals,
    ``,
    `SELECT (SELECT count(*) FROM products) AS products,`,
    `       (SELECT count(*) FROM categories) AS categories,`,
    `       (SELECT count(*) FROM orders) AS orders,`,
    `       (SELECT count(*) FROM users) AS users;`,
    ``,
  ].join("\n");
}
