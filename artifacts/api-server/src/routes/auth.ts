import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { and, eq, gt, isNull } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import { RegisterBody, LoginBody, ResetPasswordBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { name, phone, password } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Phone already registered" });
    return;
  }

  const existingEmail = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existingEmail.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const [user] = await db.insert(usersTable).values({ name, phone, email, passwordHash, role: "customer", lastLoginAt: new Date() }).returning();

    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
      token,
    });
  } catch (err) {
    // Two concurrent registrations can both pass the pre-checks; the second
    // insert then hits a unique constraint (pg 23505). Map it to the same
    // friendly 400 instead of a 500.
    const pgErr = (err ?? {}) as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } };
    const code = pgErr.code ?? pgErr.cause?.code;
    const constraint = pgErr.constraint ?? pgErr.cause?.constraint ?? "";
    if (code === "23505") {
      res.status(400).json({ error: constraint.includes("email") ? "Email already registered" : "Phone already registered" });
      return;
    }
    throw err;
  }
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

  // First ever login -> the storefront shows a special welcome message.
  // Claimed atomically (WHERE last_login_at IS NULL) so two concurrent
  // logins can never both win the first-login welcome.
  const claimed = await db.update(usersTable)
    .set({ lastLoginAt: new Date() })
    .where(and(eq(usersTable.id, user.id), isNull(usersTable.lastLoginAt)))
    .returning({ id: usersTable.id });
  const firstLogin = claimed.length > 0;
  if (!firstLogin) {
    await db.update(usersTable).set({ lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));
  }

  const token = signToken({ id: user.id, role: user.role });
  res.json({
    user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
    token,
    firstLogin,
  });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.post("/auth/reset-password", async (req, res) => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { phone, code, newPassword } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (!user || !user.resetCode || user.resetCode !== code.trim()) {
    res.status(400).json({ error: "Invalid code" });
    return;
  }
  if (!user.resetCodeExpiresAt || user.resetCodeExpiresAt.getTime() < Date.now()) {
    res.status(400).json({ error: "Code expired" });
    return;
  }

  // Atomic redemption: code + expiry re-checked in the WHERE clause so two
  // concurrent submissions cannot both redeem the same code (replay race).
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const redeemed = await db.update(usersTable)
    .set({ passwordHash, resetCode: null, resetCodeExpiresAt: null })
    .where(and(
      eq(usersTable.id, user.id),
      eq(usersTable.resetCode, code.trim()),
      gt(usersTable.resetCodeExpiresAt, new Date()),
    ))
    .returning();
  if (redeemed.length === 0) {
    res.status(400).json({ error: "Invalid code" });
    return;
  }

  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const { id } = (req as any).user;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() });
});

export default router;
