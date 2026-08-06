import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@workspace/api-client-react';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { ShoppingBag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAddToCart, getGetCartQueryKey, useGetCategories } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartUI } from '@/store/ui-store';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCard({ product, className, style }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const { setIsOpen: setIsCartOpen } = useCartUI();

  const name = lang === 'ckb' ? product.nameCkb : lang === 'ar' ? product.nameAr : product.nameEn;
  const desc = lang === 'ckb' ? product.descCkb : lang === 'ar' ? product.descAr : product.descEn;

  const { data: categories = [] } = useGetCategories();
  const category = categories.find((c) => c.slug === product.categorySlug);
  const categoryName = category
    ? (lang === 'ckb' ? category.nameCkb : lang === 'ar' ? category.nameAr : category.nameEn)
    : product.categorySlug;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: (newCart) => {
        queryClient.setQueryData(getGetCartQueryKey(), newCart);
        setIsCartOpen(true);
        toast.success(t('کاڵاکە زیادکرا بۆ سەبەتە', 'تمت الإضافة إلى السلة', 'Added to cart'));
      },
      onError: (error) => {
        if ((error as any)?.data?.error === 'OUT_OF_STOCK') {
          toast.error(t('ئەم کاڵایە ئێستا بەردەست نییە', 'هذا المنتج غير متوفر حالياً', 'This product is currently out of stock'));
          return;
        }
        toast.error(t('هەڵەیەک ڕوویدا', 'حدث خطأ', 'An error occurred'));
      }
    });
  };

  const resolvedImage = getImageUrl(product.imageUrl);

  return (
    <Link href={`/products/${product.id}`} className={cn("group flex flex-col rounded-3xl overflow-hidden bg-card border border-border/40 hover:border-primary/40 transition-all duration-500 hover-elevate shadow-lg hover:shadow-primary/5", className)} style={style}>
      {/* Image Container */}
      <div className="relative aspect-square bg-secondary/30 overflow-hidden flex items-center justify-center p-2">
        {resolvedImage ? (
          <img 
            src={resolvedImage} 
            alt={name} 
            className="w-full h-full object-cover rounded-2xl transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-secondary-foreground/5 flex items-center justify-center text-muted-foreground/20">
            <ShoppingBag className="w-10 h-10" />
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        {product.badge && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-none font-medium px-2.5 py-0.5 text-xs shadow-lg shadow-primary/20 pointer-events-none z-10">
            {product.badge}
          </Badge>
        )}

        {!product.inStock && (
          <Badge className="absolute top-3 left-3 bg-foreground/85 text-background border-none font-medium px-2.5 py-0.5 text-xs pointer-events-none z-10">
            {t('بەردەست نییە', 'غير متوفر', 'Out of stock')}
          </Badge>
        )}
        
        {/* Quick Actions (Desktop only hover) */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 px-3 z-10">
          <Button 
            onClick={handleAddToCart}
            disabled={!product.inStock || addToCart.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl rounded-full h-10 text-xs md:text-sm"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t('خستنە سەبەتە', 'أضف للسلة', 'Add to Cart')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-1 bg-gradient-to-b from-card to-background">
        <div className="text-[11px] md:text-xs text-primary/90 font-medium mb-1.5 tracking-wider">
          {categoryName}
        </div>
        <h3 className="font-serif text-base md:text-lg text-foreground font-semibold leading-tight line-clamp-1 mb-1.5 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
          {desc}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-base md:text-lg">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through mt-0.5">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-full border border-border/50 text-primary">
            <Star className="w-3.5 h-3.5 fill-primary" />
            <span className="text-xs font-bold text-foreground pt-0.5">{product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
