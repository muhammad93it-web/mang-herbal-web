import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGetCart, useCreateOrder, useGetSettings, getGetCartQueryKey, Order } from '@workspace/api-client-react';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { parseWhatsAppNumbers, normalizeWhatsAppNumber, buildOrderText, buildWaLink } from '@/lib/order-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, CheckCircle2, LogIn, UserPlus, Send } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function CartPage() {
  const { t, lang } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: !!user } });
  const { data: settings } = useGetSettings();
  const createOrder = useCreateOrder();

  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const checkoutSchema = z.object({
    name: z.string().min(2, t('تکایە ناوی تەواو بنووسە', 'يرجى كتابة الاسم الكامل', 'Please enter your full name')),
    phone: z.string().min(10, t('ژمارەی مۆبایل تەواو نییە', 'رقم الهاتف غير مكتمل', 'Phone number is too short')),
    address: z.string().min(10, t('تکایە ناونیشانی تەواو بنووسە', 'يرجى كتابة العنوان الكامل', 'Please provide a complete address')),
    note: z.string().optional(),
  });

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: '', phone: '', address: '', note: '' },
  });

  // Prefill name/phone from the signed-in account once it loads.
  useEffect(() => {
    if (user) {
      if (!form.getValues('name')) form.setValue('name', user.name);
      if (!form.getValues('phone')) form.setValue('phone', user.phone);
    }
  }, [user?.id]);

  const whatsappNumbers = parseWhatsAppNumbers(
    settings?.find((s) => s.key === 'order_whatsapp_numbers')?.valueEn
  );

  const onSubmit = (data: z.infer<typeof checkoutSchema>) => {
    if (!cart?.items?.length || !user) return;
    createOrder.mutate({ data }, {
      onSuccess: (order) => {
        setSuccessOrder(order);
        queryClient.setQueryData(getGetCartQueryKey(), { items: [], total: 0 });
        toast.success(t('داواکاریەکەت سەرکەوتوو بوو', 'تم تقديم الطلب بنجاح', 'Order placed successfully'));
        window.scrollTo({ top: 0 });
      },
      onError: (error) => {
        if ((error as any)?.data?.error === 'OUT_OF_STOCK') {
          // Refresh so the out-of-stock labels show up on the summary rows.
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast.error(t(
            'هەندێک لە کاڵاکانی سەبەتەکەت ئێستا بەردەست نین — تکایە لایانبەرە و دووبارە هەوڵبدەرەوە',
            'بعض منتجات سلتك غير متوفرة حالياً — يرجى إزالتها والمحاولة مجدداً',
            'Some items in your cart are out of stock — please remove them and try again'
          ));
          return;
        }
        toast.error(t('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە', 'حدث خطأ، حاول مرة أخرى', 'An error occurred, please try again'));
      },
    });
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (successOrder) {
    const orderText = buildOrderText(successOrder);
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
          {t('سوپاس بۆ کڕینەکەت', 'شكراً لتسوقك', 'Thank you for your order')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-2">
          {t('داواکاریەکەت بە سەرکەوتوویی وەرگیرا، ژمارەی داواکاری:', 'تم استلام طلبك بنجاح، رقم الطلب:', 'Your order has been received successfully, Order ID:')}{' '}
          <span className="font-bold text-foreground">#{successOrder.id}</span>
        </p>

        {whatsappNumbers.length > 0 && (
          <div className="max-w-md w-full mx-auto mt-8 bg-card border border-primary/30 rounded-3xl p-6 space-y-4">
            <p className="text-foreground font-medium">
              {t(
                'بۆ خێراکردنی گەیاندن، داواکارییەکەت بە واتساپ بۆمان بنێرە',
                'لتسريع التوصيل، أرسل طلبك إلينا عبر واتساب',
                'To speed up delivery, send us your order on WhatsApp'
              )}
            </p>
            <div className="flex flex-col gap-3">
              {whatsappNumbers.map((num, idx) => {
                const intl = normalizeWhatsAppNumber(num);
                if (!intl) return null;
                return (
                  <a key={num} href={buildWaLink(intl, orderText)} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-12 rounded-full text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                      <Send className="w-4 h-4" />
                      {t('ناردنی داواکاری بۆ واتساپ', 'إرسال الطلب عبر واتساب', 'Send order via WhatsApp')}
                      {whatsappNumbers.length > 1 && <span dir="ltr" className="text-sm opacity-90">({num})</span>}
                    </Button>
                  </a>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                'نامەکە پێشوەخت ئامادە کراوە — تەنها دوگمەی ناردن دابگرە.',
                'الرسالة جاهزة مسبقاً — فقط اضغط زر الإرسال.',
                'The message is pre-filled — just tap send.'
              )}
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <Button onClick={() => setLocation('/orders')} size="lg" variant="outline">
            {t('بینینی داواکارییەکانم', 'عرض طلباتي', 'View My Orders')}
          </Button>
          <Button onClick={() => setLocation('/products')} size="lg" variant="ghost">
            {t('کڕینی زیاتر', 'مواصلة التسوق', 'Continue Shopping')}
          </Button>
        </div>
      </div>
    );
  }

  // ── Login required ─────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8">
          <LogIn className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t('بۆ کڕین پێویستە بچیتە ژوورەوە', 'يجب تسجيل الدخول لإتمام الشراء', 'Please sign in to checkout')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
          {t(
            'تکایە بچۆ ژوورەوە یان هەژمارێک دروست بکە بۆ ئەوەی بتوانیت داواکاری بکەیت.',
            'يرجى تسجيل الدخول أو إنشاء حساب لتتمكن من تقديم الطلب.',
            'Please sign in or create an account to place your order.'
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setLocation('/login?redirect=/cart')} size="lg" className="rounded-full px-8">
            <LogIn className="w-4 h-4" />
            {t('چوونەژوورەوە', 'تسجيل الدخول', 'Sign In')}
          </Button>
          <Button onClick={() => setLocation('/register?redirect=/cart')} size="lg" variant="outline" className="rounded-full px-8">
            <UserPlus className="w-4 h-4" />
            {t('تۆمارکردن', 'إنشاء حساب', 'Create Account')}
          </Button>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (!authLoading && items.length === 0) {
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ناوی تەواو', 'الاسم الكامل', 'Full Name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('ناوی سیانی', 'الاسم الثلاثي', 'Your full name')} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ژمارەی مۆبایل', 'رقم الهاتف', 'Phone Number')}</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" placeholder="0750 000 0000" className="bg-background text-left" />
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
              {items.map((item) => {
                const resolvedImage = getImageUrl(item.product.imageUrl);
                return (
                  <div key={item.productId} className="flex justify-between gap-4 text-sm items-center">
                    <div className="flex gap-3 items-center">
                      <span className="font-bold text-muted-foreground w-6 text-right shrink-0">{item.quantity}x</span>
                      {resolvedImage ? (
                        <img src={resolvedImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary/50 shrink-0 border border-border flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground line-clamp-2">
                          {lang === 'ckb' ? item.product.nameCkb : lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                        </span>
                        {!item.product.inStock && (
                          <span className="text-[11px] text-destructive font-medium">
                            {t('بەردەست نییە', 'غير متوفر', 'Out of stock')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                );
              })}
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
