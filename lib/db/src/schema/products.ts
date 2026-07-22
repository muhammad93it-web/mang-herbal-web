import { pgTable, serial, text, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  nameCkb: text("name_ckb").notNull(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descCkb: text("desc_ckb").notNull(),
  descAr: text("desc_ar").notNull(),
  descEn: text("desc_en").notNull(),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  categorySlug: text("category_slug").notNull(),
  imageUrl: text("image_url"),
  badge: text("badge"),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.5"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
