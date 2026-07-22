import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetFavorites } from '@workspace/api-client-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Heart, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Favorites() {
  const { t } = useLanguage();
  const { data: favorites, isLoading } = useGetFavorites();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 mb-12 border-b border-border/50 pb-6">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <Heart className="w-6 h-6 fill-destructive" />
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-1">
              {t('دڵخوازەکان', 'المفضلة', 'Favorites')}
            </h1>
            <p className="text-muted-foreground">
              {t('ئەو بەرهەمانەی کە دڵخوازتن', 'المنتجات التي أحببتها', 'Products you loved')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-[4/5] rounded-xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))
          ) : favorites && favorites.length > 0 ? (
            favorites.map((fav: any) => (
              <ProductCard key={fav.id || fav.productId} product={fav.product || fav} />
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-border/50 rounded-3xl bg-secondary/10">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 text-muted-foreground/30">
                <Heart className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                {t('هیچ دڵخوازێکت نییە', 'لا توجد مفضلة', 'No favorites yet')}
              </h3>
              <p className="text-muted-foreground max-w-md mb-8">
                {t('دەتوانیت بە کلیک کردن لەسەر هێمای دڵ بەرهەمەکان زیاد بکەیت بۆ ئێرە.', 'يمكنك إضافة المنتجات إلى هنا بالنقر على أيقونة القلب.', 'You can add products here by clicking the heart icon.')}
              </p>
              <Link href="/products">
                <Button size="lg" className="rounded-full">
                  {t('گەڕان بەدوای بەرهەمەکان', 'تصفح المنتجات', 'Browse Products')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
