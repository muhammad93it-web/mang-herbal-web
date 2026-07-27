import React from 'react';
import { useLocation } from 'wouter';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { cn } from '@/lib/utils';

export function RootLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');
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
      <MobileNav />
    </div>
  );
}
