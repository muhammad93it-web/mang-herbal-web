import React from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGetCart, getGetCartQueryKey } from '@workspace/api-client-react';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/** App-style bottom tab bar, mobile only. Hidden on admin pages. */
export function MobileNav() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();
  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: !!user } });

  if (location.startsWith('/admin')) return null;

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const tabs = [
    { href: '/', icon: Home, label: t('سەرەتا', 'الرئيسية', 'Home'), active: location === '/' },
    { href: '/products', icon: LayoutGrid, label: t('بەرهەمەکان', 'المنتجات', 'Products'), active: location.startsWith('/products') },
    { href: '/favorites', icon: Heart, label: t('دڵخوازەکان', 'المفضلة', 'Favorites'), active: location.startsWith('/favorites') },
    { href: '/cart', icon: ShoppingBag, label: t('سەبەتە', 'السلة', 'Cart'), active: location.startsWith('/cart'), badge: cartCount },
    user
      ? { href: '/orders', icon: User, label: t('داواکارییەکانم', 'طلباتي', 'My Orders'), active: location.startsWith('/orders') }
      : { href: '/login', icon: User, label: t('هەژمار', 'الحساب', 'Account'), active: location.startsWith('/login') || location.startsWith('/register') },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                tab.active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <span className="relative">
                <Icon className={cn('w-5 h-5', tab.active && 'drop-shadow-[0_0_6px_rgba(201,168,76,0.5)]')} />
                {!!tab.badge && (
                  <span className="absolute -top-1.5 -end-2.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span className="truncate max-w-[64px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
