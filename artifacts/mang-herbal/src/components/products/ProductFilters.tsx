import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';
import { useGetCategories } from '@workspace/api-client-react';

interface FiltersProps {
  categorySlug: string | null;
  setCategorySlug: (s: string | null) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (v: boolean) => void;
  maxPossiblePrice?: number;
}

export function ProductFilters({
  categorySlug,
  setCategorySlug,
  priceRange,
  setPriceRange,
  featuredOnly,
  setFeaturedOnly,
  maxPossiblePrice = 100000,
}: FiltersProps) {
  const { t, lang } = useLanguage();
  const { data: categories = [] } = useGetCategories();

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 sticky top-24 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <h3 className="font-serif text-xl font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          {t('پاڵاوتن', 'تصفية', 'Filters')}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setCategorySlug(null);
            setPriceRange([0, maxPossiblePrice]);
            setFeaturedOnly(false);
          }}
          className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs"
        >
          <X className="w-3 h-3 mr-1" />
          {t('لابردن', 'إلغاء', 'Clear')}
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground text-lg">{t('جۆرەکان', 'الفئات', 'Categories')}</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id="cat-all" 
              checked={categorySlug === null}
              onCheckedChange={() => setCategorySlug(null)}
              className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label htmlFor="cat-all" className="text-sm font-medium cursor-pointer flex-1 mr-2 px-2">
              {t('هەموو جۆرەکان', 'كل الفئات', 'All Categories')}
            </Label>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id={`cat-${cat.slug}`} 
                checked={categorySlug === cat.slug}
                onCheckedChange={() => setCategorySlug(cat.slug)}
                className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label htmlFor={`cat-${cat.slug}`} className="text-sm font-medium cursor-pointer flex-1 mr-2 px-2 flex justify-between">
                <span>{lang === 'ckb' ? cat.nameCkb : lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
                {cat.productCount !== undefined && (
                  <span className="text-xs text-muted-foreground bg-secondary px-2 rounded-full">
                    {cat.productCount}
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-6">
        <h4 className="font-medium text-foreground text-lg">{t('نرخ', 'السعر', 'Price')}</h4>
        <Slider 
          defaultValue={[0, maxPossiblePrice]} 
          value={priceRange}
          max={maxPossiblePrice} 
          step={1000} 
          onValueChange={(vals) => setPriceRange([vals[0], vals[1]])}
          className="my-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Other options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox 
            id="featured" 
            checked={featuredOnly}
            onCheckedChange={(c) => setFeaturedOnly(!!c)}
            className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Label htmlFor="featured" className="text-sm font-medium cursor-pointer flex-1 mr-2 px-2">
            {t('تەنها تایبەتەکان', 'المميزة فقط', 'Featured Only')}
          </Label>
        </div>
      </div>
    </div>
  );
}
