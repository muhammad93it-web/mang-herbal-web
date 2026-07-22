import { Router } from "express";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { name, phone, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Phone already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, phone, passwordHash, role: "customer" }).returning();

  const token = signToken({ id: user.id, role: user.role });
  res.status(201).json({
    user: { id: user.id, name: user.name, phone: user.phone, role: user.role, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { phone, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Phone or password incorrect" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Phone or password incorrect" });
    return;
  }

  const token = signToken({ id: user.id, role: user.role });
  res.json({
    user: { id: user.id, name: user.name, phone: user.phone, role: user.role, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const { id } = (req as any).user;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, phone: user.phone, role: user.role, createdAt: user.createdAt.toISOString() });
});

export default router;
