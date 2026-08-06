import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Reveal } from '@/components/ui/reveal';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

export default function Products() {
  const { t } = useLanguage();
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const { data: products, isLoading } = useGetProducts({
    search: debouncedSearch || null,
    category: categorySlug,
    minPrice: priceRange[0],
    maxPrice: priceRange[1] < 100000 ? priceRange[1] : null,
    featured: featuredOnly ? true : null
  });

  return (
    <div className="min-h-screen pt-12 pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="mb-12 space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            {t('بەرهەمەکان', 'المنتجات', 'Products')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t('گەڕان بەدوای باشترین بەرهەمە سروشتییەکان بۆ جوانی و تەندروستیت.', 'ابحث عن أفضل المنتجات الطبيعية لجمالك وصحتك.', 'Browse our finest natural products for your beauty and health.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <ProductFilters 
              categorySlug={categorySlug}
              setCategorySlug={setCategorySlug}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              featuredOnly={featuredOnly}
              setFeaturedOnly={setFeaturedOnly}
            />
          </aside>

          {/* Main Content */}
          <main className="flex flex-col gap-6">
            {/* Search and Mobile Filter Toggle */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('گەڕان بۆ بەرهەم...', 'ابحث عن منتج...', 'Search products...')}
                  className="pl-4 pr-10 h-12 bg-card border-border/50 text-base rounded-xl"
                  dir="auto"
                />
              </div>
              {/* Future implementation: Mobile filter sheet trigger */}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="w-full aspect-square rounded-xl" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))
              ) : products && products.length > 0 ? (
                products.map((product, i) => (
                  <Reveal key={product.id} delay={(i % 4) * 90} className="h-full">
                    <ProductCard product={product} className="h-full" />
                  </Reveal>
                ))
              ) : (
                <div className="col-span-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-border/50 rounded-2xl bg-secondary/10">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t('هیچ بەرهەمێک نەدۆزرایەوە', 'لم يتم العثور على منتجات', 'No products found')}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {t('تکایە گەڕانەکەت بگۆڕە یان پاڵاوتنەکان کەم بکەرەوە.', 'يرجى تغيير كلمات البحث أو تخفيف التصفية.', 'Please try changing your search terms or relaxing filters.')}
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
