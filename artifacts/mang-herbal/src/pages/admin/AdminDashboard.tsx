import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminGetStats } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Package, Users, ShoppingCart, DollarSign, Clock, CheckCircle2, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { data: stats, isLoading } = useAdminGetStats();

  const cards = [
    { label: t('کۆی داهات', 'إجمالي الإيرادات', 'Total Revenue'), value: stats ? formatPrice(stats.totalRevenue) : '', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: t('کۆی داواکارییەکان', 'إجمالي الطلبات', 'Total Orders'), value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('داواکارییەکانی چاوەڕوانکراو', 'الطلبات قيد الانتظار', 'Pending Orders'), value: stats?.pendingOrders || 0, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: t('داواکارییە گەیەندراوەکان', 'الطلبات الموصلة', 'Delivered Orders'), value: stats?.deliveredOrders || 0, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t('کۆی بەکارهێنەران', 'إجمالي المستخدمين', 'Total Users'), value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: t('کۆی بەرهەمەکان', 'إجمالي المنتجات', 'Total Products'), value: stats?.totalProducts || 0, icon: Package, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: t('کۆی دڵخوازەکان', 'إجمالي المفضلة', 'Total Favorites'), value: stats?.totalFavorites || 0, icon: Heart, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <AdminLayout title={t('داشبۆردی سەرەکی', 'لوحة القيادة الرئيسية', 'Main Dashboard')}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))
        ) : (
          cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col justify-between hover-elevate transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-muted-foreground text-sm font-medium mb-1">{card.label}</h3>
                  <div className="text-2xl font-bold text-foreground font-serif">{card.value}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
