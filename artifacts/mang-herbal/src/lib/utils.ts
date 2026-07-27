import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US').format(price) + ' د.ع'
}

export function formatPhone(phone: string): string {
  // Adds LTR marks around phone to prevent RTL weirdness
  return `\u202A${phone}\u202C`
}

export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
  const base = import.meta.env.BASE_URL; 
  const path = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  return base.endsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
