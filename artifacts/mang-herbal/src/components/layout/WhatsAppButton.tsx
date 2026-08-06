import React from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetSettings } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { normalizeWhatsAppNumber } from '@/lib/order-text';

const DEFAULT_WHATSAPP = '9647701432814';

/**
 * Floating WhatsApp contact button, always visible on storefront pages.
 * Number comes from the `social_whatsapp` site setting (editable in admin
 * settings), falling back to the shop's default number.
 */
export function WhatsAppButton() {
  const { t, lang } = useLanguage();
  const [location] = useLocation();
  const { data: settings } = useGetSettings();

  // Keep the admin dashboard clean
  if (location.startsWith('/admin')) return null;

  const setting = settings?.find((s) => s.key === 'social_whatsapp');
  const raw = setting?.valueEn || setting?.valueCkb || setting?.valueAr || '';
  // Handles 0770…, +964…, 00964… and bare local forms alike
  const digits = normalizeWhatsAppNumber(raw) || DEFAULT_WHATSAPP;

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noreferrer"
      aria-label={t('پەیوەندی بە واتساپ', 'تواصل عبر واتساب', 'Chat on WhatsApp')}
      title={t('پەیوەندی بە واتساپ', 'تواصل عبر واتساب', 'Chat on WhatsApp')}
      className={cn(
        'fixed z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center',
        'shadow-lg shadow-black/40 border border-white/20',
        'animate-in zoom-in-50 fade-in duration-500',
        'hover:scale-110 active:scale-95 transition-transform',
        // Sit above the mobile bottom tab bar; lower on desktop
        'bottom-24 md:bottom-6',
        lang === 'en' ? 'right-4 md:right-6' : 'left-4 md:left-6'
      )}
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8" aria-hidden="true">
        <path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.117.555 4.184 1.607 6.004L4 29l8.184-1.582A11.94 11.94 0 0 0 16.004 27C22.625 27 28 21.617 28 15.004 28 8.383 22.625 3 16.004 3zm0 21.82a9.9 9.9 0 0 1-5.043-1.379l-.361-.214-4.859.939.973-4.742-.236-.375A9.86 9.86 0 0 1 6.107 15C6.107 9.545 10.549 5.107 16.004 5.107c5.451 0 9.889 4.438 9.889 9.897 0 5.455-4.438 9.816-9.889 9.816zm5.43-7.402c-.297-.149-1.758-.867-2.031-.967-.272-.099-.471-.148-.669.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      </svg>
    </a>
  );
}
