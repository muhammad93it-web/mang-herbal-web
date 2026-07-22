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
