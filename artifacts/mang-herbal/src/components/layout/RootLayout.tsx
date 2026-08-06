import React from 'react';
import { useLocation } from 'wouter';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { WhatsAppButton } from './WhatsAppButton';
import { cn } from '@/lib/utils';

export function RootLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');

  // Without this, SPA route changes keep the old scroll position: tapping a
  // bottom tab while scrolled down shows the same footer area on the new page,
  // which reads as "the tap did nothing" on mobile. Only in-app (push)
  // navigations reset — browser back/forward (popstate) keeps the browser's
  // own scroll restoration, and the initial mount is left alone.
  const lastPopAt = React.useRef(0);
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    const markPop = () => {
      lastPopAt.current = Date.now();
    };
    window.addEventListener('popstate', markPop);
    return () => window.removeEventListener('popstate', markPop);
  }, []);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // A location change right after a popstate is a back/forward navigation —
    // let the browser restore its own scroll position. A time window (instead
    // of a consumed boolean flag) can't get stuck or be consumed out of order.
    if (Date.now() - lastPopAt.current < 300) return;
    window.scrollTo(0, 0);
  }, [location]);
  return (
    <div className={cn(
      'min-h-[100dvh] flex flex-col bg-background selection:bg-primary/30 selection:text-primary',
      // Reserve space for the mobile bottom tab bar on storefront pages
      !isAdmin && 'pb-20 md:pb-0'
    )}>
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppButton />
      <MobileNav />
    </div>
  );
}
