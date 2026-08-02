import { paramToInt } from "../lib/params";
import { Router } from "express";
import { db, productsTable, ordersTable, usersTable, favoritesTable, siteSettingsTable } from "@workspace/db";
import { eq, ne, count, sum, desc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { AdminCreateProductBody, AdminUpdateProductBody, AdminUpdateOrderStatusBody, AdminUpdateSettingsBody, AdminTestWhatsAppBody } from "@workspace/api-zod";
import { normalizeWhatsAppNumber, sendCallMeBot } from "../lib/whatsapp";

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
    customerName: o.customerName ?? null, isSeen: o.isSeen,
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
  const id = paramToInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [product] = await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(formatProduct(product));
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = paramToInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

// Orders
router.get("/admin/orders", requireAdmin, async (_req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  res.json(orders.map(formatOrder));
});

router.get("/admin/orders/unseen-count", requireAdmin, async (_req, res) => {
  const [row] = await db.select({ total: count() }).from(ordersTable).where(eq(ordersTable.isSeen, false));
  res.json({ count: row.total });
});

router.post("/admin/orders/mark-seen", requireAdmin, async (_req, res) => {
  await db.update(ordersTable).set({ isSeen: true }).where(eq(ordersTable.isSeen, false));
  res.json({ success: true });
});

router.patch("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const id = paramToInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AdminUpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [order] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(formatOrder(order));
});

// Users
router.get("/admin/users", requireAdmin, async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  const now = Date.now();
  res.json(users.map((u) => {
    const codeActive = !!u.resetCode && !!u.resetCodeExpiresAt && u.resetCodeExpiresAt.getTime() > now;
    return {
      id: u.id, name: u.name, phone: u.phone, email: u.email ?? null, role: u.role,
      createdAt: u.createdAt.toISOString(),
      hasResetCode: codeActive,
      resetCode: codeActive ? u.resetCode : null,
      resetCodeExpiresAt: codeActive && u.resetCodeExpiresAt ? u.resetCodeExpiresAt.toISOString() : null,
    };
  }));
});

router.post("/admin/users/:id/reset-code", requireAdmin, async (req, res) => {
  const id = paramToInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const [user] = await db.update(usersTable)
    .set({ resetCode: code, resetCodeExpiresAt: expiresAt })
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({ code, expiresAt: expiresAt.toISOString() });
});

// Settings
router.get("/admin/settings", requireAdmin, async (_req, res) => {
  const settings = await db.select().from(siteSettingsTable);
  res.json(settings.map((s) => ({ key: s.key, valueCkb: s.valueCkb, valueAr: s.valueAr, valueEn: s.valueEn })));
});

router.put("/admin/settings", requireAdmin, async (req, res) => {
  const parsed = AdminUpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  for (const s of parsed.data.settings) {
    await db.insert(siteSettingsTable)
      .values({ key: s.key, valueCkb: s.valueCkb, valueAr: s.valueAr, valueEn: s.valueEn })
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: { valueCkb: s.valueCkb, valueAr: s.valueAr, valueEn: s.valueEn },
      });
  }

  const settings = await db.select().from(siteSettingsTable);
  res.json(settings.map((s) => ({ key: s.key, valueCkb: s.valueCkb, valueAr: s.valueAr, valueEn: s.valueEn })));
});

// WhatsApp test send (CallMeBot)
router.post("/admin/whatsapp-test", requireAdmin, async (req, res) => {
  const parsed = AdminTestWhatsAppBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const norm = normalizeWhatsAppNumber(parsed.data.phone);
  if (!norm) { res.status(400).json({ error: "Invalid phone" }); return; }
  const result = await sendCallMeBot(
    norm,
    parsed.data.apiKey,
    "Mang Herbal — تاقیکردنەوە: ئەگەر ئەم نامەیە گەیشت، ناردنی ئۆتۆماتیکی داواکارییەکان چالاکە."
  );
  res.json({ success: result.ok, detail: result.detail });
});

// Stats
router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [orderCounts] = await db.select({ total: count() }).from(ordersTable);
  const [pendingCounts] = await db.select({ total: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const [deliveredCounts] = await db.select({ total: count() }).from(ordersTable).where(eq(ordersTable.status, "delivered"));
  const [revenue] = await db.select({ total: sum(ordersTable.total) }).from(ordersTable).where(ne(ordersTable.status, "cancelled"));
  const [userCounts] = await db.select({ total: count() }).from(usersTable).where(eq(usersTable.role, "customer"));
  const [productCounts] = await db.select({ total: count() }).from(productsTable);
  const [favoriteCounts] = await db.select({ total: count() }).from(favoritesTable);

  res.json({
    totalOrders: orderCounts.total,
    pendingOrders: pendingCounts.total,
    deliveredOrders: deliveredCounts.total,
    totalRevenue: parseInt(revenue.total ?? "0") || 0,
    totalUsers: userCounts.total,
    totalProducts: productCounts.total,
    totalFavorites: favoriteCounts.total,
  });
});

export default router;
