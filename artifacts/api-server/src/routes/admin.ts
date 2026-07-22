import { Router } from "express";
import { db, productsTable, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { AdminCreateProductBody, AdminUpdateProductBody, AdminUpdateOrderStatusBody } from "@workspace/api-zod";

const router = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id, nameCkb: p.nameCkb, nameAr: p.nameAr, nameEn: p.nameEn,
    descCkb: p.descCkb, descAr: p.descAr, descEn: p.descEn,
    price: p.price, oldPrice: p.oldPrice ?? null,
    categorySlug: p.categorySlug, imageUrl: p.imageUrl ?? null,
    badge: p.badge ?? null, inStock: p.inStock, isFeatured: p.isFeatured,
    rating: parseFloat(String(p.rating)), reviewCount: p.reviewCount,
    createdAt: p.createdAt.toISOString(),
  };
}

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id, userId: o.userId, status: o.status, total: o.total,
    phone: o.phone, address: o.address, note: o.note ?? null,
    items: o.items as any[], createdAt: o.createdAt.toISOString(),
  };
}

// Products
router.get("/admin/products", requireAdmin, async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.id);
  res.json(products.map(formatProduct));
});

router.post("/admin/products", requireAdmin, async (req, res) => {
  const parsed = AdminCreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    rating: "4.5",
    reviewCount: 0,
  }).returning();
  res.status(201).json(formatProduct(product));
});

router.patch("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [product] = await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(formatProduct(product));
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

// Orders
router.get("/admin/orders", requireAdmin, async (_req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(orders.map(formatOrder));
});

router.patch("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AdminUpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [order] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(formatOrder(order));
});

export default router;
