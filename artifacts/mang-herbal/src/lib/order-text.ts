import type { Order } from '@workspace/api-client-react';
import { formatPrice } from './utils';

/**
 * Normalize an Iraqi phone number to WhatsApp international format (no +).
 * "07501263713" -> "9647501263713"
 */
export function normalizeWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('00964')) return digits.slice(2);
  if (digits.startsWith('964')) return digits;
  if (digits.startsWith('0')) return `964${digits.slice(1)}`;
  return `964${digits}`;
}

/** Parse the comma/space separated `order_whatsapp_numbers` setting into a list. */
export function parseWhatsAppNumbers(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,،;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build the full order message (Kurdish — it is addressed to the store owner)
 * used for WhatsApp sending and one-tap copy in the admin panel.
 */
export function buildOrderText(order: Order): string {
  const lines: string[] = [];
  lines.push('داواکاری نوێ — Mang Herbal');
  lines.push(`ژمارەی داواکاری: #${order.id}`);
  if (order.customerName) lines.push(`ناو: ${order.customerName}`);
  lines.push(`مۆبایل: ${order.phone}`);
  lines.push(`ناونیشان: ${order.address}`);
  if (order.note) lines.push(`تێبینی: ${order.note}`);
  lines.push('----------------');
  for (const item of order.items) {
    lines.push(`${item.quantity} × ${item.nameCkb} — ${formatPrice(item.price * item.quantity)}`);
  }
  lines.push('----------------');
  lines.push(`کۆی گشتی: ${formatPrice(order.total)}`);
  lines.push(`بەروار: ${new Date(order.createdAt).toISOString().slice(0, 16).replace('T', ' ')}`);
  return lines.join('\n');
}

/**
 * wa.me link. With a number it opens a chat with that number;
 * without a number WhatsApp lets the sender pick any chat/group.
 */
export function buildWaLink(number: string | null, text: string): string {
  const encoded = encodeURIComponent(text);
  return number ? `https://wa.me/${number}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

/** Parse the admin-only `order_whatsapp_apikeys` setting ("num:key,num:key") keyed by raw number. */
export function parseWhatsAppKeyPairs(value: string | null | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  if (!value) return map;
  for (const part of value.split(/[,،;\s]+/)) {
    const [num, key] = part.split(':');
    if (num && key && key.trim()) {
      const norm = normalizeWhatsAppNumber(num.trim()) || num.trim();
      map[norm] = key.trim();
    }
  }
  return map;
}

/** Serialize a number→apikey map back to the setting format. */
export function serializeWhatsAppKeyPairs(map: Record<string, string>): string {
  return Object.entries(map)
    .filter(([num, key]) => num && key)
    .map(([num, key]) => `${num}:${key}`)
    .join(',');
}
