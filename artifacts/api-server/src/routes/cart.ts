import { paramToInt } from "../lib/params";
import { Router } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";

const router = Router();

async function getCartForUser(userId: number) {
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.userId, userId));

  if (items.length === 0) return { items: [], total: 0 };

  const productIds = items.map((i) => i.productId);
  const products = await db.select().from(productsTable);
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const cartItems = items
    .filter((i) => productMap[i.productId])
    .map((i) => {
      const p = productMap[i.productId];
      return {
        productId: i.productId,
        quantity: i.quantity,
        product: {
          id: p.id, nameCkb: p.nameCkb, nameAr: p.nameAr, nameEn: p.nameEn,
          descCkb: p.descCkb, descAr: p.descAr, descEn: p.descEn,
          price: p.price, oldPrice: p.oldPrice ?? null,
          categorySlug: p.categorySlug, imageUrl: p.imageUrl ?? null,
          badge: p.badge ?? null, inStock: p.inStock, isFeatured: p.isFeatured,
          rating: parseFloat(String(p.rating)), reviewCount: p.reviewCount,
          createdAt: p.createdAt.toISOString(),
        },
      };
    });

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  return { items: cartItems, total };
}

router.get("/cart", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  res.json(await getCartForUser(userId));
});

router.post("/cart/items", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { productId, quantity } = parsed.data;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  if (!product.inStock) { res.status(400).json({ error: "OUT_OF_STOCK" }); return; }

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ userId, productId, quantity });
  }

  res.json(await getCartForUser(userId));
});

router.patch("/cart/items/:productId", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const productId = paramToInt(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { quantity } = parsed.data;

  await db
    .update(cartItemsTable)
    .set({ quantity })
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

  res.json(await getCartForUser(userId));
});

router.delete("/cart/items/:productId", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const productId = paramToInt(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }

  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

  res.json(await getCartForUser(userId));
});

router.delete("/cart/clear", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  res.json({ success: true });
});

export default router;
