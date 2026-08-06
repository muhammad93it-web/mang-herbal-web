import React, { useRef } from 'react';
import { useLocation } from 'wouter';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCartUI } from '@/store/ui-store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetCart, useUpdateCartItem, useRemoveFromCart, getGetCartQueryKey } from '@workspace/api-client-react';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function CartSidebar() {
  const { isOpen, setIsOpen } = useCartUI();
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateItem.mutate({ productId, data: { quantity } }, {
      onSuccess: (newCart) => {
        queryClient.setQueryData(getGetCartQueryKey(), newCart);
      }
    });
  };

  const handleRemoveItem = (productId: number) => {
    removeItem.mutate({ productId }, {
      onSuccess: (newCart) => {
        queryClient.setQueryData(getGetCartQueryKey(), newCart);
      }
    });
  };

  const onCheckout = () => {
    setIsOpen(false);
    setLocation('/cart');
  };

  const items = cart?.items || [];
  const side = lang === 'en' ? 'right' : 'left';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side={side} className="w-full sm:max-w-md flex flex-col p-0 border-border bg-card">
        <SheetHeader className="p-6 border-b border-border/50">
          <SheetTitle className="font-serif text-2xl flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            {t('سەبەتەی کاڵاکان', 'سلة المشتريات', 'Shopping Cart')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium text-foreground">
                {t('سەبەتەکەت بەتاڵە', 'سلتك فارغة', 'Your cart is empty')}
              </p>
              <Button onClick={() => { setIsOpen(false); setLocation('/products'); }} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                {t('بگەڕێوە بۆ بەرهەمەکان', 'العودة للمنتجات', 'Continue Shopping')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-secondary border border-border shrink-0">
                    {item.product.imageUrl ? (
                      <img src={getImageUrl(item.product.imageUrl) ?? undefined} alt={item.product.nameEn} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-foreground line-clamp-1">
                        {lang === 'ckb' ? item.product.nameCkb : lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                      </h4>
                      {!item.product.inStock && (
                        <p className="text-[11px] text-destructive font-medium mt-0.5">
                          {t('بەردەست نییە', 'غير متوفر', 'Out of stock')}
                        </p>
                      )}
                      <p className="text-primary font-bold mt-1 text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{item.quantity} × {formatPrice(item.product.price)}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={updateItem.isPending}
                          className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={updateItem.isPending}
                          className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={removeItem.isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-secondary/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium">{t('کۆی گشتی', 'المجموع', 'Total')}</span>
              <span className="text-2xl font-bold text-primary font-serif">{formatPrice(cart?.total || 0)}</span>
            </div>
            <Button onClick={onCheckout} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg rounded-md font-medium">
              {t('چوون بۆ کڕین', 'إتمام الطلب', 'Checkout')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
