import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAddToCart, getGetCartQueryKey } from '@workspace/api-client-react';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: (newCart) => {
        queryClient.setQueryData(getGetCartQueryKey(), newCart);
        setIsCartOpen(true);
        toast.success(t('کاڵاکە زیادکرا بۆ سەبەتە', 'تمت الإضافة إلى السلة', 'Added to cart'));
      },
      onError: () => {
        toast.error(t('هەڵەیەک ڕوویدا', 'حدث خطأ', 'An error occurred'));
      }
    });
  };

  return (
    <Link href={`/products/${product.id}`} className={cn("group flex flex-col rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover-elevate", className)} style={style}>
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-secondary overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary-foreground/10 flex items-center justify-center text-muted-foreground/30">
            <ShoppingBag className="w-8 h-8" />
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        {product.badge && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-none font-medium px-2 py-0.5 pointer-events-none">
            {product.badge}
          </Badge>
        )}
        
        {/* Quick Actions (Desktop only hover) */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4">
          <Button 
            onClick={handleAddToCart}
            disabled={!product.inStock || addToCart.isPending}
            className="w-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t('خستنە سەبەتە', 'أضف للسلة', 'Add to Cart')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs text-primary/80 font-medium mb-2">
          {product.categorySlug}
        </div>
        <h3 className="font-serif text-lg text-foreground font-semibold leading-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {desc}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-lg">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Star className="w-4 h-4 fill-primary" />
            <span className="text-sm font-medium text-foreground">{product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
