import { pgTable, text } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  valueCkb: text("value_ckb").notNull().default(""),
  valueAr: text("value_ar").notNull().default(""),
  valueEn: text("value_en").notNull().default(""),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
