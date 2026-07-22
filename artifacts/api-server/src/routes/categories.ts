import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/categories", async (_req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.id);
  // get product counts per category
  const counts = await db
    .select({ slug: productsTable.categorySlug, count: sql<number>`count(*)::int` })
    .from(productsTable)
    .groupBy(productsTable.categorySlug);
  const countMap = Object.fromEntries(counts.map((c) => [c.slug, c.count]));
  res.json(cats.map((c) => ({ ...c, productCount: countMap[c.slug] ?? 0 })));
});

export default router;
