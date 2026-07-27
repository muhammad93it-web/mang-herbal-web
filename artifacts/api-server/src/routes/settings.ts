import { Router } from "express";
import { notInArray } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";

const router = Router();

// Settings that must never be exposed publicly (WhatsApp auto-send API keys).
export const PRIVATE_SETTING_KEYS = ["order_whatsapp_apikeys"];

router.get("/settings", async (_req, res) => {
  const settings = await db
    .select()
    .from(siteSettingsTable)
    .where(notInArray(siteSettingsTable.key, PRIVATE_SETTING_KEYS));
  res.json(settings.map((s) => ({
    key: s.key,
    valueCkb: s.valueCkb,
    valueAr: s.valueAr,
    valueEn: s.valueEn,
  })));
});

export default router;
