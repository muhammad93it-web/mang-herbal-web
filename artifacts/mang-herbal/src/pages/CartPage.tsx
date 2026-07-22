import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGetCart, useCreateOrder, getGetCartQueryKey } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const checkoutSchema = z.object({
  phone: z.string().min(10, "Phone number is too short"),
  address: z.string().min(10, "Please provide a complete address"),
  note: z.string().optional()
});

export default function CartPage() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: cart } = useGetCart();
  const createOrder = useCreateOrder();
  
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: user?.phone || '',
      address: '',
      note: ''
    }
  });

  const onSubmit = (data: z.infer<typeof checkoutSchema>) => {
    if (!cart?.items?.length) return;
    
    if (!user) {
      toast.error(t('تکایە سەرەتا بچۆ ژوورەوە', 'يرجى تسجيل الدخول أولاً', 'Please login first'));
      setLocation('/login?redirect=/cart');
      return;
    }

    createOrder.mutate({ data }, {
      onSuccess: (order) => {
        setSuccessOrderId(order.id);
        queryClient.setQueryData(getGetCartQueryKey(), { items: [], total: 0 });
        toast.success(t('داواکاریەکەت سەرکەوتوو بوو', 'تم تقديم الطلب بنجاح', 'Order placed successfully'));
      },
      onError: (err: any) => {
        toast.error(err?.data?.error || t('هەڵەیەک ڕوویدا', 'حدث خطأ', 'An error occurred'));
      }
    });
  };

  const isRtl = lang !== 'en';

  if (successOrderId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
          {t('سوپاس بۆ کڕینەکەت', 'شكراً لتسوقك', 'Thank you for your order')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
          {t('داواکاریەکەت بە سەرکەوتوویی وەرگیرا، ژمارەی داواکاری:', 'تم استلام طلبك بنجاح، رقم الطلب:', 'Your order has been received successfully, Order ID:')} <span className="font-bold text-foreground">#{successOrderId}</span>
        </p>
        <Button onClick={() => setLocation('/orders')} size="lg">
          {t('بینینی داواکارییەکانم', 'عرض طلباتي', 'View My Orders')}
        </Button>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center text-muted-foreground/50 mb-8">
          <ShoppingBag className="w-16 h-16" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
          {t('سەبەتەکەت بەتاڵە', 'سلتك فارغة', 'Your cart is empty')}
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          {t('تکایە چەند بەرهەمێک بخەرە سەبەتەکەتەوە پێش کڕین.', 'يرجى إضافة بعض المنتجات إلى سلتك قبل الشراء.', 'Please add some products to your cart before checkout.')}
        </p>
        <Button onClick={() => setLocation('/products')} size="lg" className="rounded-full">
          {t('گەڕان بەدوای بەرهەمەکان', 'تصفح المنتجات', 'Browse Products')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-12">
          {t('تەواوکردنی کڕین', 'إتمام الشراء', 'Checkout')}
        </h1>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          {/* Checkout Form */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-border/50">
              {t('زانیاری گەیاندن', 'معلومات التوصيل', 'Delivery Information')}
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ژمارەی تەلەفۆن', 'رقم الهاتف', 'Phone Number')}</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" placeholder="+964 750 000 0000" className="bg-background text-left" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ناونیشانی تەواو', 'العنوان الكامل', 'Full Address')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder={t('پارێزگا، گەڕەک، کۆڵان، ژمارەی خانوو...', 'المحافظة، الحي، الزقاق، رقم الدار...', 'City, Neighborhood, Street, House No...')} className="bg-background min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('تێبینی (ئارەزوومەندانە)', 'ملاحظة (اختياري)', 'Note (Optional)')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('هەر تێبینییەک بۆ گەیاندن...', 'أي ملاحظة حول التوصيل...', 'Any delivery notes...')} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createOrder.isPending} className="w-full h-14 rounded-full text-lg mt-4 shadow-xl shadow-primary/20">
                  {createOrder.isPending ? t('چاوەڕوان بە...', 'يرجى الانتظار...', 'Please wait...') : t('پشتڕاستکردنەوەی داواکاری', 'تأكيد الطلب', 'Confirm Order')}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="bg-secondary/10 border border-border/50 rounded-3xl p-6 md:p-8 sticky top-24">
            <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-border/50">
              {t('پوختەی داواکاری', 'ملخص الطلب', 'Order Summary')}
            </h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-4 text-sm">
                  <div className="flex gap-3">
                    <span className="font-bold text-muted-foreground w-6 text-right">{item.quantity}x</span>
                    <span className="text-foreground line-clamp-1">
                      {lang === 'ckb' ? item.product.nameCkb : lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                    </span>
                  </div>
                  <span className="font-medium shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border/50 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('کۆی کاڵاکان', 'مجموع المنتجات', 'Subtotal')}</span>
                <span>{formatPrice(cart?.total || 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('تێچووی گەیاندن', 'تكلفة التوصيل', 'Delivery Fee')}</span>
                <span>{t('دواتر دیاری دەکرێت', 'يحدد لاحقاً', 'Determined later')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t border-border/50">
                <span>{t('کۆی گشتی', 'المجموع', 'Total')}</span>
                <span className="font-serif">{formatPrice(cart?.total || 0)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
