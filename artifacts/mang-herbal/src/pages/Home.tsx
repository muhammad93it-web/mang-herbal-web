import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetProducts, useGetStats, useGetSettings } from '@workspace/api-client-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, Sparkles, Droplets, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, getImageUrl } from '@/lib/utils';

export default function Home() {
  const { t, lang } = useLanguage();
  
  // Get featured products
  const { data: products, isLoading } = useGetProducts({ featured: true });
  const { data: stats } = useGetStats();
  const { data: settings } = useGetSettings();

  const isRtl = lang !== 'en';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const getSetting = (key: string, fallback: string = '') => {
    const s = settings?.find(s => s.key === key);
    if (!s) return fallback;
    if (lang === 'ckb' && s.valueCkb) return s.valueCkb;
    if (lang === 'ar' && s.valueAr) return s.valueAr;
    if (lang === 'en' && s.valueEn) return s.valueEn;
    return s.valueEn || s.valueCkb || s.valueAr || fallback;
  };

  // Hero image is a site setting (admin can change it in Settings);
  // defaults to the bundled public/hero.jpg that ships with the package.
  const heroSrc = getImageUrl(getSetting('hero_image', '') || 'hero.jpg')!;

  const badgeFallback = t('سروشتی و پاک', 'طبيعي ونقي', '100% Natural & Pure');
  const title1Fallback = t('جوانی سروشت', 'جمال الطبيعة', 'The Beauty of');
  const title2Fallback = t('لەلای ئێمەیە', 'بين يديك', 'Nature is Here');
  const subtitleFallback = t(
    'باشترین پێکهاتە سروشتییەکان بۆ پێست و قژت. بەرهەمی خۆماڵی بەرزترین کوالێتی کە جوانیت دەردەخات.',
    'أفضل المكونات الطبيعية لبشرتك وشعرك. منتجات محلية بأعلى جودة تبرز جمالك الحقيقي.',
    'The finest natural ingredients for your skin and hair. Premium local products that reveal your true beauty.'
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        <div className="container relative z-10 mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-start space-y-6 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs md:text-sm font-bold tracking-widest uppercase shadow-lg shadow-primary/5">
              <Sparkles className="w-4 h-4" />
              {getSetting('hero_badge', badgeFallback)}
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] text-foreground">
              {getSetting('hero_title_1', title1Fallback)} <br />
              <span className="gold-gradient-text block mt-2">{getSetting('hero_title_2', title2Fallback)}</span>
            </h1>
            
            <p className="text-base md:text-lg font-light text-muted-foreground max-w-lg leading-relaxed">
              {getSetting('hero_subtitle', subtitleFallback)}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base rounded-full font-medium group shadow-xl shadow-primary/20">
                  {t('بینینی بەرهەمەکان', 'تسوق الآن', 'Shop Now')}
                  <ArrowIcon className={cn("w-5 h-5 transition-transform group-hover:translate-x-1", isRtl && "group-hover:-translate-x-1")} />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto h-12 px-8 text-base rounded-full font-medium border-primary/20 text-foreground hover:bg-primary/10"
              >
                {t('زیاتر بزانە', 'اعرف المزيد', 'Learn More')}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 pt-1 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-primary" />
                {t('١٠٠٪ سروشتی', '١٠٠٪ طبيعي', '100% Natural')}
              </span>
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="inline-flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-primary" />
                {t('بێ کیمیای زیانبەخش', 'بدون كيماويات ضارة', 'No harsh chemicals')}
              </span>
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {t('کوالێتی بەرز', 'جودة عالية', 'Premium quality')}
              </span>
            </div>
          </div>
          
          <div className="relative hidden lg:block animate-in fade-in duration-1000 delay-300">
            <div className="relative w-full max-w-[420px] mx-auto">
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -inset-3 rounded-[2.5rem] border border-primary/20 rotate-2 pointer-events-none" />
              <div className="absolute -inset-3 rounded-[2.5rem] border border-primary/10 -rotate-1 pointer-events-none" />
              <div className="aspect-[4/5] w-full rounded-[2rem] overflow-hidden border border-border/50 bg-secondary/50 relative group shadow-2xl">
                <img
                  src={heroSrc}
                  alt="Mang Herbal"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent" />
              </div>
              <div className="absolute top-6 -left-5 bg-card/90 backdrop-blur-md border border-primary/25 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2 text-sm font-medium text-foreground">
                <Leaf className="w-4 h-4 text-primary" />
                {t('١٠٠٪ سروشتی', '١٠٠٪ طبيعي', '100% Natural')}
              </div>
              <div className="absolute top-1/2 -right-5 bg-card/90 backdrop-blur-md border border-primary/25 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                {t('کوالێتی بەرز', 'جودة عالية', 'Premium Quality')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-border/40 bg-secondary/10 relative z-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-3xl md:text-4xl font-serif font-extrabold text-primary">{stats?.totalProducts || 50}+</span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">{t('بەرهەمی سروشتی', 'منتج طبيعي', 'Natural Products')}</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-3xl md:text-4xl font-serif font-extrabold text-primary">{stats?.happyCustomers || 1200}+</span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">{t('کڕیاری دڵخۆش', 'عميل سعيد', 'Happy Customers')}</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-3xl md:text-4xl font-serif font-extrabold text-primary">100%</span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">{t('بێ ماددەی کیمیایی', 'خالي من الكيماويات', 'Chemical Free')}</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-3xl md:text-4xl font-serif font-extrabold text-primary">24/7</span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">{t('پشتگیری کڕیاران', 'دعم العملاء', 'Customer Support')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-4 max-w-2xl">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                {t('بەرهەمە تایبەتەکان', 'منتجاتنا المميزة', 'Featured Products')}
              </h2>
              <p className="text-muted-foreground text-base">
                {t('باشترین بەرهەمەکانمان کە کڕیاران زۆرترین خواستیان لەسەر بووە.', 'أفضل منتجاتنا التي نالت إعجاب عملائنا.', 'Our finest and most loved products by our customers.')}
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="h-12 px-6 rounded-full border-primary/20 text-primary hover:bg-primary/10 group">
                {t('هەموو بەرهەمەکان', 'عرض الكل', 'View All')}
                <ArrowIcon className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", isRtl && "group-hover:-translate-x-1")} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="w-full aspect-square rounded-[2rem]" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))
            ) : products && products.length > 0 ? (
              products.slice(0, 4).map((product, i) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className={`animate-in slide-in-from-bottom-8 fade-in duration-1000`}
                  style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                {t('هیچ بەرهەمێک نەدۆزرایەوە.', 'لم يتم العثور على منتجات.', 'No products found.')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="about" className="py-16 md:py-20 bg-card border-t border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {t('بۆچی Mang Herbal؟', 'لماذا Mang Herbal؟', 'Why Mang Herbal?')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('ئێمە بڕوامان بە هێزی سروشت هەیە بۆ چارەسەر و جوانی.', 'نحن نؤمن بقوة الطبيعة في العلاج والجمال.', 'We believe in the power of nature for healing and beauty.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-background border border-border/50 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-4 hover-elevate transition-all duration-500 hover:border-primary/30">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">
                {t('١٠٠٪ سروشتی', 'طبيعي 100%', '100% Natural')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('هەموو پێکهاتەکانمان لە سروشتەوە سەرچاوەیان گرتووە بەبێ هیچ ماددەیەکی کیمیایی زیانبەخش.', 'جميع مكوناتنا مستمدة من الطبيعة بدون أي مواد كيميائية ضارة.', 'All our ingredients are sourced from nature without any harmful chemicals.')}
              </p>
            </div>

            <div className="bg-background border border-border/50 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-4 hover-elevate transition-all duration-500 translate-y-0 md:translate-y-8 hover:border-primary/30">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner">
                <Droplets className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">
                {t('دروستکراوی دەستی', 'صناعة يدوية', 'Handcrafted')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('بەرهەمەکانمان بە خۆشەویستی و ئاگادارییەکی زۆرەوە بە دەست دروست دەکرێن.', 'منتجاتنا تصنع يدوياً بحب وعناية فائقة للحفاظ على جودتها.', 'Our products are handcrafted with love and utmost care to maintain quality.')}
              </p>
            </div>

            <div className="bg-background border border-border/50 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-4 hover-elevate transition-all duration-500 hover:border-primary/30">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">
                {t('کوالێتی بەرز', 'جودة عالية', 'Premium Quality')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('باشترین جۆری ڕووەک و زەیتەکان بەکاردەهێنین بۆ دڵنیابوون لە باشترین ئەنجام.', 'نستخدم أفضل أنواع الأعشاب والزيوت لضمان أفضل النتائج.', 'We use the finest herbs and oils to ensure the best results.')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
