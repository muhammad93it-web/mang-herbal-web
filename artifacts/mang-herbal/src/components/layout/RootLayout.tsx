import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartSidebar } from '@/components/cart/CartSidebar';

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
}
