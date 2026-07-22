import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  total: integer("total").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  note: text("note"),
  items: jsonb("items").notNull().$type<Array<{
    productId: number;
    quantity: number;
    price: number;
    nameCkb: string;
    nameAr: string;
    nameEn: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
