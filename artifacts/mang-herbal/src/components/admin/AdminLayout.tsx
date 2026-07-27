import React from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminGetUnseenOrdersCount, getAdminGetUnseenOrdersCountQueryKey } from '@workspace/api-client-react';
import { LayoutDashboard, Package, Users, Settings, ShoppingCart, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const { t } = useLanguage();
  const [location] = useLocation();

  // Poll for new (unseen) orders so the admin gets notified while working.
  const { data: unseen } = useAdminGetUnseenOrdersCount({
    query: { queryKey: getAdminGetUnseenOrdersCountQueryKey(), refetchInterval: 20000 },
  });
  const unseenCount = unseen?.count ?? 0;

  const links = [
    { href: '/admin', icon: LayoutDashboard, label: t('داشبۆرد', 'لوحة القيادة', 'Dashboard') },
    { href: '/admin/orders', icon: ShoppingCart, label: t('داواکارییەکان', 'الطلبات', 'Orders'), badge: unseenCount },
    { href: '/admin/products', icon: Package, label: t('بەرهەمەکان', 'المنتجات', 'Products') },
    { href: '/admin/users', icon: Users, label: t('بەکارهێنەران', 'المستخدمين', 'Users') },
    { href: '/admin/settings', icon: Settings, label: t('ڕێکخستنەکان', 'الإعدادات', 'Settings') },
  ];

  const isLinkActive = (href: string) =>
    href === '/admin' ? location === '/admin' : location.startsWith(href);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* Mobile: compact horizontal admin tabs (app-style) */}
      <div className="md:hidden sticky top-20 z-40 bg-card/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = isLinkActive(link.href);
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm whitespace-nowrap shrink-0 transition-colors",
                isActive ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" : "bg-secondary/40 text-muted-foreground"
              )}>
                <Icon className="w-4 h-4" />
                {link.label}
                {!!link.badge && (
                  <span className={cn(
                    "min-w-5 h-5 px-1 rounded-full text-xs font-bold flex items-center justify-center",
                    isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                  )}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border/50 bg-card p-6 flex-col gap-8 md:sticky md:top-20 md:h-[calc(100vh-5rem)]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">{t('بەڕێوەبردن', 'الإدارة', 'Admin')}</h2>
          <p className="text-sm text-muted-foreground">{t('پانێڵی کۆنترۆڵ', 'لوحة التحكم', 'Control Panel')}</p>
        </div>
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = isLinkActive(link.href);
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
                {!!link.badge && (
                  <span className={cn(
                    "ms-auto min-w-6 h-6 px-1.5 rounded-full text-xs font-bold flex items-center justify-center",
                    isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                  )}>
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground">{title}</h1>
          <Link
            href="/admin/orders"
            className="relative w-11 h-11 rounded-full border border-border/50 bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors shrink-0"
            aria-label={t('ئاگادارییەکان', 'الإشعارات', 'Notifications')}
          >
            <Bell className="w-5 h-5" />
            {unseenCount > 0 && (
              <span className="absolute -top-1 -end-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {unseenCount}
              </span>
            )}
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
