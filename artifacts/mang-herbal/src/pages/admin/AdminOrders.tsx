import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useAdminGetOrders,
  useAdminUpdateOrderStatus,
  useAdminMarkOrdersSeen,
  getAdminGetOrdersQueryKey,
  getAdminGetUnseenOrdersCountQueryKey,
  Order,
} from '@workspace/api-client-react';
import { formatPrice, formatPhone } from '@/lib/utils';
import { buildOrderText, buildWaLink } from '@/lib/order-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Clock, Truck, CheckCircle2, XCircle, Copy, Send, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

export default function AdminOrders() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useAdminGetOrders();
  const updateStatus = useAdminUpdateOrderStatus();
  const markSeen = useAdminMarkOrdersSeen();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Mark everything as seen once the list is on screen; rows fetched as unseen
  // keep their highlight for this visit, but the notification badge clears.
  const hasUnseen = !!orders?.some((o) => !o.isSeen);
  useEffect(() => {
    if (hasUnseen && !markSeen.isPending) {
      markSeen.mutate(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminGetUnseenOrdersCountQueryKey() });
        },
      });
    }
  }, [hasUnseen]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: t('چاوەڕوانکراو', 'قيد الانتظار', 'Pending'), color: 'bg-yellow-500/10 text-yellow-500', icon: Clock };
      case 'confirmed': return { label: t('پشتڕاستکراوە', 'مؤكد', 'Confirmed'), color: 'bg-blue-500/10 text-blue-500', icon: Package };
      case 'shipped': return { label: t('نێردراوە', 'مشحون', 'Shipped'), color: 'bg-indigo-500/10 text-indigo-500', icon: Truck };
      case 'delivered': return { label: t('گەیەندراوە', 'تم التوصيل', 'Delivered'), color: 'bg-green-500/10 text-green-500', icon: CheckCircle2 };
      case 'cancelled': return { label: t('هەڵوەشاوەتەوە', 'ملغى', 'Cancelled'), color: 'bg-destructive/10 text-destructive', icon: XCircle };
      default: return { label: status, color: 'bg-secondary text-foreground', icon: Package };
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => {
        toast.success(t('باری داواکاری گۆڕدرا', 'تم تحديث حالة الطلب', 'Order status updated'));
        queryClient.invalidateQueries({ queryKey: getAdminGetOrdersQueryKey() });
      }
    });
  };

  const handleCopy = async (order: Order) => {
    const text = buildOrderText(order);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('زانیاری داواکاری کۆپی کرا', 'تم نسخ معلومات الطلب', 'Order info copied'));
    } catch {
      toast.error(t('کۆپیکردن سەرنەکەوت', 'فشل النسخ', 'Copy failed'));
    }
  };

  const handleShareWhatsApp = (order: Order) => {
    // Without a number, WhatsApp lets the admin pick any chat or group.
    window.open(buildWaLink(null, buildOrderText(order)), '_blank', 'noopener,noreferrer');
  };

  return (
    <AdminLayout title={t('داواکارییەکان', 'الطلبات', 'Orders')}>
      {/* Mobile: clear labeled order cards */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
        ) : orders && orders.length > 0 ? (
          orders.map(order => {
            const cfg = getStatusConfig(order.status);
            const Icon = cfg.icon;
            return (
              <div key={order.id} className={cn(
                "bg-card border rounded-2xl p-4 space-y-3 shadow-sm",
                !order.isSeen ? "border-primary/40 bg-primary/5" : "border-border/50"
              )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    #{order.id}
                    {!order.isSeen && (
                      <Badge className="bg-primary/15 text-primary border-none text-[10px] px-1.5">{t('نوێ', 'جديد', 'New')}</Badge>
                    )}
                  </div>
                  <Badge variant="outline" className={`border-none ${cfg.color} flex items-center gap-1.5`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground" dir="ltr">{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</p>

                <div className="bg-background/60 border border-border/40 rounded-xl p-3 space-y-2 text-sm">
                  {order.customerName && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-20 shrink-0">{t('ناو', 'الاسم', 'Name')}</span>
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">{t('مۆبایل', 'الهاتف', 'Phone')}</span>
                    <a href={`tel:${order.phone}`} dir="ltr" className="font-medium text-primary">{formatPhone(order.phone)}</a>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">{t('ناونیشان', 'العنوان', 'Address')}</span>
                    <span>{order.address}</span>
                  </div>
                  {order.note && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-20 shrink-0">{t('تێبینی', 'ملاحظة', 'Note')}</span>
                      <span>{order.note}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-background/40 rounded-lg px-3 py-2">
                      <span>
                        <span className="font-bold text-primary" dir="ltr">{item.quantity} ×</span>{' '}
                        {t(item.nameCkb, item.nameAr, item.nameEn)}
                      </span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="font-semibold">{t('کۆی گشتی', 'المجموع', 'Total')}</span>
                  <span className="font-bold text-primary text-lg">{formatPrice(order.total)}</span>
                </div>

                <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                  <SelectTrigger className="w-full h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('چاوەڕوانکراو', 'قيد الانتظار', 'Pending')}</SelectItem>
                    <SelectItem value="confirmed">{t('پشتڕاستکراوە', 'مؤكد', 'Confirmed')}</SelectItem>
                    <SelectItem value="shipped">{t('نێردراوە', 'مشحون', 'Shipped')}</SelectItem>
                    <SelectItem value="delivered">{t('گەیەندراوە', 'تم التوصيل', 'Delivered')}</SelectItem>
                    <SelectItem value="cancelled">{t('هەڵوەشاوەتەوە', 'ملغى', 'Cancelled')}</SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => handleCopy(order)} className="h-11 border-primary/20 text-primary hover:bg-primary/10">
                    <Copy className="w-4 h-4" />
                    {t('کۆپی', 'نسخ', 'Copy')}
                  </Button>
                  <Button variant="outline" onClick={() => handleShareWhatsApp(order)} className="h-11">
                    <Send className="w-4 h-4" />
                    {t('واتساپ', 'واتساب', 'WhatsApp')}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card border border-border/50 rounded-2xl p-12 text-center text-muted-foreground">
            {t('هیچ داواکارییەک نەدۆزرایەوە.', 'لم يتم العثور على طلبات.', 'No orders found.')}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="p-4 w-10"></th>
                <th className="p-4 font-semibold text-muted-foreground">{t('ژمارە', 'الرقم', 'ID')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('بەروار', 'التاريخ', 'Date')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('کڕیار', 'العميل', 'Customer')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('کۆی گشتی', 'المجموع', 'Total')}</th>
                <th className="p-4 font-semibold text-muted-foreground">{t('بارودۆخ', 'الحالة', 'Status')}</th>
                <th className="p-4 font-semibold text-muted-foreground text-right">{t('کردار', 'إجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="p-4"><Skeleton className="h-12 w-full" /></td>
                  </tr>
                ))
              ) : orders && orders.length > 0 ? (
                orders.map(order => {
                  const cfg = getStatusConfig(order.status);
                  const Icon = cfg.icon;
                  const isExpanded = expandedId === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      <tr className={cn(
                        "transition-colors cursor-pointer",
                        !order.isSeen ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/10"
                      )} onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                        <td className="p-4 text-muted-foreground">
                          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                        </td>
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            {!order.isSeen && <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />}
                            #{order.id}
                            {!order.isSeen && (
                              <Badge className="bg-primary/15 text-primary border-none text-[10px] px-1.5">{t('نوێ', 'جديد', 'New')}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm" dir="ltr">{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {order.customerName && <span className="font-medium text-sm">{order.customerName}</span>}
                            <span className="text-sm text-left text-muted-foreground" dir="ltr">{formatPhone(order.phone)}</span>
                            <span className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]" title={order.address}>{order.address}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-primary">{formatPrice(order.total)}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={`border-none ${cfg.color} flex w-max items-center gap-1.5`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(order)}
                              className="h-8 text-xs border-primary/20 hover:border-primary text-primary hover:bg-primary/10"
                              title={t('کۆپیکردنی زانیاری داواکاری', 'نسخ معلومات الطلب', 'Copy order info')}
                            >
                              <Copy className="w-3 h-3" />
                              {t('کۆپی', 'نسخ', 'Copy')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShareWhatsApp(order)}
                              className="h-8 text-xs"
                              title={t('ناردن بۆ واتساپ', 'إرسال إلى واتساب', 'Send to WhatsApp')}
                            >
                              <Send className="w-3 h-3" />
                              {t('واتساپ', 'واتساب', 'WhatsApp')}
                            </Button>
                            <Select
                              value={order.status}
                              onValueChange={(val) => handleStatusChange(order.id, val)}
                            >
                              <SelectTrigger className="w-[130px] h-8 text-xs bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t('چاوەڕوانکراو', 'قيد الانتظار', 'Pending')}</SelectItem>
                                <SelectItem value="confirmed">{t('پشتڕاستکراوە', 'مؤكد', 'Confirmed')}</SelectItem>
                                <SelectItem value="shipped">{t('نێردراوە', 'مشحون', 'Shipped')}</SelectItem>
                                <SelectItem value="delivered">{t('گەیەندراوە', 'تم التوصيل', 'Delivered')}</SelectItem>
                                <SelectItem value="cancelled">{t('هەڵوەشاوەتەوە', 'ملغى', 'Cancelled')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className={!order.isSeen ? "bg-primary/5" : "bg-secondary/10"}>
                          <td colSpan={7} className="p-6">
                            <div className="grid md:grid-cols-[1fr_300px] gap-6">
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-3">{t('کاڵاکانی داواکاری', 'منتجات الطلب', 'Order Items')}</h4>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-background/60 border border-border/50 rounded-xl px-4 py-2.5 text-sm">
                                      <span>
                                        <span className="font-bold text-primary" dir="ltr">{item.quantity} ×</span>{' '}
                                        {t(item.nameCkb, item.nameAr, item.nameEn)}
                                      </span>
                                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3 text-sm">
                                <h4 className="font-semibold text-sm text-muted-foreground">{t('زانیاری گەیاندن', 'معلومات التوصيل', 'Delivery Info')}</h4>
                                {order.customerName && (
                                  <p><span className="text-muted-foreground">{t('ناو:', 'الاسم:', 'Name:')}</span> {order.customerName}</p>
                                )}
                                <p><span className="text-muted-foreground">{t('مۆبایل:', 'الهاتف:', 'Phone:')}</span> <span dir="ltr">{formatPhone(order.phone)}</span></p>
                                <p><span className="text-muted-foreground">{t('ناونیشان:', 'العنوان:', 'Address:')}</span> {order.address}</p>
                                {order.note && (
                                  <p><span className="text-muted-foreground">{t('تێبینی:', 'ملاحظة:', 'Note:')}</span> {order.note}</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    {t('هیچ داواکارییەک نەدۆزرایەوە.', 'لم يتم العثور على طلبات.', 'No orders found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
