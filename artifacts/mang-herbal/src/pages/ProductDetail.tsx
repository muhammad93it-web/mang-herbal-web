import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetProduct, useAddToCart, getGetCartQueryKey, useAddFavorite, useRemoveFavorite, useGetFavorites, getGetFavoritesQueryKey } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Star, Heart, ArrowRight, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartUI } from '@/store/ui-store';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const [, params] = useRoute('/products/:id');
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const { setIsOpen: setIsCartOpen } = useCartUI();
  
  const { data: product, isLoading, isError } = useGetProduct(id);
  const { data: favorites } = useGetFavorites();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  const [quantity, setQuantity] = useState(1);

  const isFavorite = favorites?.some((f: any) => (f.productId || f.id) === id);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate({ data: { productId: product.id, quantity } }, {
      onSuccess: (newCart) => {
        queryClient.setQueryData(getGetCartQueryKey(), newCart);
        setIsCartOpen(true);
        toast.success(t('کاڵاکە زیادکرا بۆ سەبەتە', 'تمت الإضافة إلى السلة', 'Added to cart'));
      }
    });
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFav.mutate({ productId: id }, {
        onSuccess: (newFavs) => {
          queryClient.setQueryData(getGetFavoritesQueryKey(), newFavs);
        }
      });
    } else {
      addFav.mutate({ productId: id }, {
        onSuccess: (newFavs) => {
          queryClient.setQueryData(getGetFavoritesQueryKey(), newFavs);
          toast.success(t('زیادکرا بۆ دڵخوازەکان', 'أضيفت للمفضلة', 'Added to favorites'));
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-24 grid md:grid-cols-2 gap-12">
        <Skeleton className="w-full aspect-square rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('بەرهەم نەدۆزرایەوە', 'المنتج غير موجود', 'Product not found')}</h2>
        <Link href="/products">
          <Button>{t('گەڕانەوە', 'العودة', 'Go back')}</Button>
        </Link>
      </div>
    );
  }

  const name = lang === 'ckb' ? product.nameCkb : lang === 'ar' ? product.nameAr : product.nameEn;
  const desc = lang === 'ckb' ? product.descCkb : lang === 'ar' ? product.descAr : product.descEn;
  const isRtl = lang !== 'en';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-border/40 bg-secondary/10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">{t('سەرەتا', 'الرئيسية', 'Home')}</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">{t('بەرهەمەکان', 'المنتجات', 'Products')}</Link>
          <span>/</span>
          <span className="text-foreground">{product.categorySlug}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {t('گەڕانەوە بۆ بەرهەمەکان', 'العودة للمنتجات', 'Back to products')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary border border-border/50">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <ShoppingBag className="w-24 h-24" />
              </div>
            )}
            {product.badge && (
              <Badge className="absolute top-6 right-6 bg-primary text-primary-foreground text-sm px-4 py-1">
                {product.badge}
              </Badge>
            )}
            <button 
              onClick={toggleFavorite}
              className="absolute top-6 left-6 w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-background hover:scale-105 transition-all text-muted-foreground hover:text-destructive"
            >
              <Heart className={cn("w-6 h-6 transition-colors", isFavorite && "fill-destructive text-destructive")} />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="text-primary font-medium tracking-wide uppercase text-sm mb-2 block">{product.categorySlug}</span>
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">{name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-5 h-5 fill-primary" />
                  <span className="font-bold">{product.rating.toFixed(1)}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="text-muted-foreground">{product.reviewCount || 0} {t('پێداچوونەوە', 'تقييم', 'Reviews')}</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                {product.inStock ? (
                  <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-sm font-medium">{t('بەردەستە', 'متوفر', 'In Stock')}</span>
                ) : (
                  <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded text-sm font-medium">{t('بەردەست نییە', 'غير متوفر', 'Out of Stock')}</span>
                )}
              </div>
              
              <div className="flex items-end gap-4">
                <span className="text-4xl font-serif font-bold text-foreground">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-xl text-muted-foreground line-through mb-1">{formatPrice(product.oldPrice)}</span>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-border/50 my-8" />

            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed mb-8">
              <p>{desc}</p>
            </div>

            {/* Action Area */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <div className="flex items-center border border-border/50 bg-background rounded-full p-1 w-full sm:w-32 h-14">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full flex items-center justify-center text-foreground hover:bg-secondary rounded-full transition-colors"
                >-</button>
                <span className="flex-1 text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full flex items-center justify-center text-foreground hover:bg-secondary rounded-full transition-colors"
                >+</button>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                disabled={!product.inStock || addToCart.isPending}
                className="flex-1 h-14 rounded-full text-lg font-medium shadow-xl shadow-primary/20"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {t('خستنە سەبەتە', 'أضف للسلة', 'Add to Cart')}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-secondary/20 rounded-2xl border border-border/50">
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <span className="font-medium text-sm text-foreground">{t('ڕەسەن و سروشتی', 'أصلي وطبيعي', 'Authentic & Natural')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-8 h-8 text-primary" />
                <span className="font-medium text-sm text-foreground">{t('گەیاندنی خێرا', 'توصيل سريع', 'Fast Delivery')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-8 h-8 text-primary" />
                <span className="font-medium text-sm text-foreground">{t('گەرەنتی گەڕاندنەوە', 'ضمان استرجاع', 'Return Guarantee')}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
