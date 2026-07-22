import { Router } from "express";
import { db, favoritesTable, productsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/favorites", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
  if (favs.length === 0) { res.json([]); return; }

  const productIds = favs.map((f) => f.productId);
  const products = await db.select().from(productsTable).where(inArray(productsTable.id, productIds));

  res.json(products.map((p) => ({
    id: p.id, nameCkb: p.nameCkb, nameAr: p.nameAr, nameEn: p.nameEn,
    descCkb: p.descCkb, descAr: p.descAr, descEn: p.descEn,
    price: p.price, oldPrice: p.oldPrice ?? null,
    categorySlug: p.categorySlug, imageUrl: p.imageUrl ?? null,
    badge: p.badge ?? null, inStock: p.inStock, isFeatured: p.isFeatured,
    rating: parseFloat(String(p.rating)), reviewCount: p.reviewCount,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/favorites/:productId", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }

  const [existing] = await db
    .select()
    .from(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, productId)))
    .limit(1);

  if (!existing) {
    await db.insert(favoritesTable).values({ userId, productId });
  }
  res.json({ success: true });
});

router.delete("/favorites/:productId", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }

  await db
    .delete(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.productId, productId)));

  res.json({ success: true });
});

export default router;
