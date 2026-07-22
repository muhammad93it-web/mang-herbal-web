import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, Facebook, Phone, Mail, MapPin, Heart } from 'lucide-react';
import logoPath from '@assets/logo_png_be_back_1784753437461.png';
import { formatPhone } from '@/lib/utils';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/20 bg-black flex items-center justify-center">
                <img src={logoPath} alt="Mang Herbal" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-wide gold-gradient-text">
                Mang Herbal
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
              {t(
                'باشترین بەرهەمە سروشتییەکان بۆ جوانی و تەندروستیت. لە هەولێرەوە بۆ هەموو کوردستان.',
                'أفضل المنتجات الطبيعية لجمالك وصحتك. من أربيل إلى كل مكان.',
                'The finest natural products for your beauty and health. From Erbil to everywhere.'
              )}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h3 className="font-serif text-lg text-foreground mb-6 font-semibold">
              {t('بەستەرەکان', 'روابط سريعة', 'Quick Links')}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('سەرەتا', 'الرئيسية', 'Home')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('هەموو بەرهەمەکان', 'كل المنتجات', 'All Products')}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('سەبەتە', 'السلة', 'Cart')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h3 className="font-serif text-lg text-foreground mb-6 font-semibold">
              {t('پەیوەندی', 'تواصل معنا', 'Contact Us')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground justify-center md:justify-start">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>{t('نەورۆز، هەولێر، عێراق', 'نوروز، أربيل، العراق', 'Nawroz, Erbil, Iraq')}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground justify-center md:justify-start">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span dir="ltr">{formatPhone('+964 750 000 0000')}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground justify-center md:justify-start">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>info@mangherbal.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Mang Herbal. {t('هەموو مافەکان پارێزراوە.', 'جميع الحقوق محفوظة.', 'All rights reserved.')}</p>
          <p className="flex items-center gap-1">
            {t('دروستکراوە بە', 'صنع بـ', 'Crafted with')} <Heart className="w-4 h-4 text-primary fill-primary/20" /> {t('لە هەولێر', 'في أربيل', 'in Erbil')}
          </p>
        </div>
      </div>
    </footer>
  );
}
