import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetOrders } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function Orders() {
  const { t, lang } = useLanguage();
  const { data: orders, isLoading } = useGetOrders();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: t('چاوەڕێکراو', 'قيد الانتظار', 'Pending'), color: 'bg-yellow-500/10 text-yellow-500', icon: Clock };
      case 'confirmed': return { label: t('پشتڕاستکراوە', 'مؤكد', 'Confirmed'), color: 'bg-blue-500/10 text-blue-500', icon: Package };
      case 'shipped': return { label: t('نێردراوە', 'مشحون', 'Shipped'), color: 'bg-indigo-500/10 text-indigo-500', icon: Truck };
      case 'delivered': return { label: t('گەیشتووە', 'تم التوصيل', 'Delivered'), color: 'bg-green-500/10 text-green-500', icon: CheckCircle2 };
      case 'cancelled': return { label: t('هەڵوەشاوە', 'ملغي', 'Cancelled'), color: 'bg-destructive/10 text-destructive', icon: XCircle };
      default: return { label: status, color: 'bg-secondary text-foreground', icon: Package };
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            {t('داواکارییەکانم', 'طلباتي', 'My Orders')}
          </h1>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-48 rounded-2xl" />
            ))
          ) : orders && orders.length > 0 ? (
            orders.map((order) => {
              const cfg = getStatusConfig(order.status);
              const Icon = cfg.icon;
              return (
                <div key={order.id} className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 hover-elevate transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">#{order.id}</h3>
                        <Badge variant="outline" className={`border-none ${cfg.color} px-3 py-1 flex items-center gap-1.5`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm" dir="ltr">
                        {format(new Date(order.createdAt), 'PPp')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t('کۆی گشتی', 'المجموع', 'Total')}</p>
                      <p className="font-serif text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{t('کاڵاکان', 'المنتجات', 'Items')}</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border/30">
                          <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground font-bold shrink-0">
                            {item.quantity}x
                          </div>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">
                              {lang === 'ckb' ? item.nameCkb : lang === 'ar' ? item.nameAr : item.nameEn}
                            </p>
                            <p className="text-primary font-bold text-sm mt-0.5">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-24 bg-secondary/10 rounded-3xl border border-border/50">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('هیچ داواکارییەک نییە', 'لا توجد طلبات', 'No orders yet')}
              </h2>
              <p className="text-muted-foreground">
                {t('تا ئێستا هیچ داواکارییەکت ئەنجام نەداوە.', 'لم تقم بإجراء أي طلبات حتى الآن.', 'You haven\'t placed any orders yet.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
