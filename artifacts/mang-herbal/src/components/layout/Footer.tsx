import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, Facebook, Phone, Mail, MapPin, Heart, MessageCircle } from 'lucide-react';
import logoPath from '@assets/logo_png_be_back_1784753437461.png';
import { formatPhone } from '@/lib/utils';
import { useGetSettings } from '@workspace/api-client-react';

export function Footer() {
  const { t, lang } = useLanguage();
  const { data: settings } = useGetSettings();

  const getSetting = (key: string, fallback: string = '') => {
    const s = settings?.find(s => s.key === key);
    if (!s) return fallback;
    if (lang === 'ckb' && s.valueCkb) return s.valueCkb;
    if (lang === 'ar' && s.valueAr) return s.valueAr;
    if (lang === 'en' && s.valueEn) return s.valueEn;
    return s.valueEn || s.valueCkb || s.valueAr || fallback;
  };

  const getExactSetting = (key: string) => {
    const s = settings?.find(s => s.key === key);
    // for exact values like URLs or phone numbers that don't need translation
    return s?.valueEn || s?.valueCkb || s?.valueAr || '';
  };

  const aboutFallback = t(
    'باشترین بەرهەمە سروشتییەکان بۆ جوانی و تەندروستیت. لە هەولێرەوە بۆ هەموو کوردستان.',
    'أفضل المنتجات الطبيعية لجمالك وصحتك. من أربيل إلى كل مكان.',
    'The finest natural products for your beauty and health. From Erbil to everywhere.'
  );

  const addressFallback = t('نەورۆز، هەولێر، عێراق', 'نوروز، أربيل، العراق', 'Nawroz, Erbil, Iraq');

  const phone = getExactSetting('contact_phone') || '+964 770 143 2814';
  const email = getExactSetting('contact_email') || 'info@mangherbal.com';
  
  const instagram = getExactSetting('social_instagram');
  const facebook = getExactSetting('social_facebook');
  const tiktok = getExactSetting('social_tiktok');
  const whatsapp = getExactSetting('social_whatsapp');

  return (
    <footer className="bg-card border-t border-border pt-16 pb-8 mt-auto relative z-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-primary/20 bg-black flex items-center justify-center shadow-lg shadow-primary/10">
                <img src={logoPath} alt="Mang Herbal" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-wide gold-gradient-text">
                Mang Herbal
              </span>
            </Link>
            <p className="text-muted-foreground text-sm font-light max-w-sm mb-8 leading-relaxed">
              {getSetting('footer_about', aboutFallback)}
            </p>
            <div className="flex items-center gap-4">
              {instagram && (
                <a href={instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors border border-transparent hover:border-green-500/30">
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h3 className="font-serif text-xl text-foreground mb-6 font-semibold">
              {t('بەستەرەکان', 'روابط سريعة', 'Quick Links')}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                  {t('سەرەتا', 'الرئيسية', 'Home')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                  {t('هەموو بەرهەمەکان', 'كل المنتجات', 'All Products')}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                  {t('سەبەتە', 'السلة', 'Cart')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h3 className="font-serif text-xl text-foreground mb-6 font-semibold">
              {t('پەیوەندی', 'تواصل معنا', 'Contact Us')}
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-muted-foreground justify-center md:justify-start group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MapPin className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="mt-2 leading-tight">{getSetting('contact_address', addressFallback)}</span>
              </li>
              <li className="flex items-center gap-4 text-muted-foreground justify-center md:justify-start group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Phone className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span dir="ltr" className="font-medium tracking-wide">{formatPhone(phone)}</span>
              </li>
              <li className="flex items-center gap-4 text-muted-foreground justify-center md:justify-start group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mail className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between text-sm font-light text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Mang Herbal. {t('هەموو مافەکان پارێزراوە.', 'جميع الحقوق محفوظة.', 'All rights reserved.')}</p>
          <p className="flex items-center gap-1.5 bg-secondary/50 px-4 py-2 rounded-full">
            {t('دروستکراوە بە', 'صنع بـ', 'Crafted with')} <Heart className="w-4 h-4 text-destructive fill-destructive" /> {t('لە هەولێر', 'في أربيل', 'in Erbil')}
          </p>
        </div>
      </div>
    </footer>
  );
}
