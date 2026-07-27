import { paramToInt } from "../lib/params";
import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, type SQL } from "drizzle-orm";

const router = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    nameCkb: p.nameCkb,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    descCkb: p.descCkb,
    descAr: p.descAr,
    descEn: p.descEn,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    categorySlug: p.categorySlug,
    imageUrl: p.imageUrl ?? null,
    badge: p.badge ?? null,
    inStock: p.inStock,
    isFeatured: p.isFeatured,
    rating: parseFloat(String(p.rating)),
    reviewCount: p.reviewCount,
    createdAt: p.createdAt.toISOString(),
  };
}

function isValidStr(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v !== "null" && v !== "undefined";
}

router.get("/products", async (req, res) => {
  const { category, search, minPrice, maxPrice, featured } = req.query as Record<string, string>;

  const conditions: SQL[] = [];
  if (isValidStr(category)) conditions.push(eq(productsTable.categorySlug, category));
  if (isValidStr(minPrice)) { const n = parseInt(minPrice); if (!isNaN(n) && n > 0) conditions.push(gte(productsTable.price, n)); }
  if (isValidStr(maxPrice)) { const n = parseInt(maxPrice); if (!isNaN(n)) conditions.push(lte(productsTable.price, n)); }
  if (featured === "true") conditions.push(eq(productsTable.isFeatured, true));
  if (isValidStr(search)) conditions.push(ilike(productsTable.nameCkb, `%${search}%`));

  const products = await db
    .select()
    .from(productsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.createdAt);

  res.json(products.map(formatProduct));
});

router.get("/products/:id", async (req, res) => {
  const id = paramToInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  res.json(formatProduct(product));
});

export default router;
