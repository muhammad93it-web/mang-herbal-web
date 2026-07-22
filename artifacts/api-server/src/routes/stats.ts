import { Router } from "express";
import { db, productsTable, categoriesTable, ordersTable, usersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (_req, res) => {
  const [{ totalProducts }] = await db.select({ totalProducts: sql<number>`count(*)::int` }).from(productsTable);
  const [{ totalCategories }] = await db.select({ totalCategories: sql<number>`count(*)::int` }).from(categoriesTable);
  const [{ totalOrders }] = await db.select({ totalOrders: sql<number>`count(*)::int` }).from(ordersTable);
  const [{ happyCustomers }] = await db.select({ happyCustomers: sql<number>`count(*)::int` }).from(usersTable);

  res.json({ totalProducts, totalCategories, totalOrders, happyCustomers: happyCustomers + 2814 });
});

export default router;
