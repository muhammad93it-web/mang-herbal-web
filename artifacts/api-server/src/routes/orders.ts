import { paramToInt } from "../lib/params";
import { Router } from "express";
import { db, ordersTable, cartItemsTable, productsTable, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateOrderBody } from "@workspace/api-zod";
import { notifyOrderToOwners } from "../lib/whatsapp";

const router = Router();

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    userId: o.userId,
    status: o.status,
    total: o.total,
    customerName: o.customerName ?? null,
    isSeen: o.isSeen,
    phone: o.phone,
    address: o.address,
    note: o.note ?? null,
    items: o.items as any[],
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/orders", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(ordersTable.createdAt);
  res.json(orders.map(formatOrder));
});

router.post("/orders", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  // get cart items
  const cartItems = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.userId, userId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const products = await db.select().from(productsTable);
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const orderItems = cartItems
    .filter((i) => productMap[i.productId])
    .map((i) => {
      const p = productMap[i.productId];
      return { productId: i.productId, quantity: i.quantity, price: p.price, nameCkb: p.nameCkb, nameAr: p.nameAr, nameEn: p.nameEn };
    });

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({ userId, status: "pending", total, customerName: parsed.data.name, phone: parsed.data.phone, address: parsed.data.address, note: parsed.data.note ?? null, items: orderItems })
    .returning();

  // clear cart
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  // Fire-and-forget WhatsApp notification to the store owner(s); never blocks or fails the order.
  db.select()
    .from(siteSettingsTable)
    .then((rows) => notifyOrderToOwners(rows, order))
    .catch((err) => console.error("[whatsapp-notify]", err));

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", requireAuth, async (req, res) => {
  const { id: userId } = (req as any).user;
  const id = paramToInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  if (!order || order.userId !== userId) { res.status(404).json({ error: "Order not found" }); return; }

  res.json(formatOrder(order));
});

export default router;
