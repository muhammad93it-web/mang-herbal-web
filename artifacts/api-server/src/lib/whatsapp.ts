import type { ordersTable } from "@workspace/db";

type OrderRow = typeof ordersTable.$inferSelect;
type SettingRow = { key: string; valueEn: string };

/** Normalize an Iraqi phone number to international format without "+" (0750... -> 964750...). */
export function normalizeWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00964")) return digits.slice(2);
  if (digits.startsWith("964")) return digits;
  if (digits.startsWith("0")) return `964${digits.slice(1)}`;
  return `964${digits}`;
}

/** Parse the comma-separated `order_whatsapp_numbers` setting. */
export function parseNumbers(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,،;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse the `order_whatsapp_apikeys` setting ("07501234567:123456,0770...:9999")
 * into a map keyed by the normalized international number.
 */
export function parseKeyPairs(value: string | null | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!value) return map;
  for (const part of value.split(/[,،;\s]+/)) {
    const [num, key] = part.split(":");
    if (!num || !key) continue;
    const norm = normalizeWhatsAppNumber(num);
    if (norm && key.trim()) map.set(norm, key.trim());
  }
  return map;
}

function formatPrice(n: number): string {
  return `${n.toLocaleString("en-US")} د.ع`;
}

/** Kurdish order message for the store owner (same shape as the storefront's copy). */
export function buildOrderText(order: OrderRow): string {
  const lines: string[] = [];
  lines.push("داواکاری نوێ — Mang Herbal");
  lines.push(`ژمارەی داواکاری: #${order.id}`);
  if (order.customerName) lines.push(`ناو: ${order.customerName}`);
  lines.push(`مۆبایل: ${order.phone}`);
  lines.push(`ناونیشان: ${order.address}`);
  if (order.note) lines.push(`تێبینی: ${order.note}`);
  lines.push("----------------");
  const items = (order.items as Array<{ quantity: number; nameCkb: string; price: number }>) || [];
  for (const item of items) {
    lines.push(`${item.quantity} × ${item.nameCkb} — ${formatPrice(item.price * item.quantity)}`);
  }
  lines.push("----------------");
  lines.push(`کۆی گشتی: ${formatPrice(order.total)}`);
  lines.push(`بەروار: ${order.createdAt.toISOString().slice(0, 16).replace("T", " ")}`);
  return lines.join("\n");
}

/**
 * Send a WhatsApp text via CallMeBot (free personal-notification API).
 * Never throws — returns { ok, detail } so callers can log/report.
 */
export async function sendCallMeBot(
  phone964: string,
  apiKey: string,
  text: string
): Promise<{ ok: boolean; detail: string }> {
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=%2B${phone964}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    const raw = await resp.text();
    // CallMeBot answers 200 with an HTML page; strip tags for a readable detail.
    const detail = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 250);
    const failed = resp.status >= 400 || /invalid|not registered|error|only.*personal/i.test(detail);
    return { ok: !failed, detail };
  } catch (e) {
    return { ok: false, detail: String(e).slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fire-and-forget notification of a new order to every configured owner number
 * that has a CallMeBot API key. Numbers without a key are skipped (they still
 * get orders via the customer deep link and the admin panel).
 */
export async function notifyOrderToOwners(settings: SettingRow[], order: OrderRow): Promise<void> {
  const numbers = parseNumbers(settings.find((s) => s.key === "order_whatsapp_numbers")?.valueEn);
  const keys = parseKeyPairs(settings.find((s) => s.key === "order_whatsapp_apikeys")?.valueEn);
  if (numbers.length === 0) return;
  const text = buildOrderText(order);
  for (const raw of numbers) {
    const norm = normalizeWhatsAppNumber(raw);
    if (!norm) continue;
    const apiKey = keys.get(norm);
    if (!apiKey) {
      console.log(`[whatsapp-notify] ${norm}: no API key configured, skipping auto-send`);
      continue;
    }
    const result = await sendCallMeBot(norm, apiKey, text);
    console.log(
      `[whatsapp-notify] order #${order.id} -> ${norm}: ${result.ok ? "sent" : "FAILED"} (${result.detail.slice(0, 120)})`
    );
  }
}
