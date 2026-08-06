import React from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, User, Menu, X, LogOut, Package, ShieldCheck, Heart, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGetCart } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { KurdistanFlag, IraqFlag, UKFlag } from './flags';
import logoPath from '@assets/logo_png_be_back_1784753437461.png';
import { cn } from '@/lib/utils';
import { useCartUI } from '@/store/ui-store';
import { toast } from 'sonner';

const LANGS = [
  { code: 'ckb' as const, name: 'کوردی', Flag: KurdistanFlag },
  { code: 'ar' as const, name: 'العربية', Flag: IraqFlag },
  { code: 'en' as const, name: 'English', Flag: UKFlag },
];

export function Navbar() {
  const [location, navigate] = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const { data: cart } = useGetCart();
  const { setIsOpen: setIsCartOpen } = useCartUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const currentLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
    toast.success(t('بە سەرکەوتوویی چوویتە دەرەوە', 'تم تسجيل الخروج بنجاح', 'You have signed out'), {
      description: t('بەخێربێیتەوە هەر کاتێک ویستت.', 'نتمنى رؤيتك مجدداً قريباً.', 'We hope to see you again soon.'),
    });
  };

  const navLinks = [
    { href: '/', label: t('سەرەتا', 'الرئيسية', 'Home') },
    { href: '/products', label: t('بەرهەمەکان', 'المنتجات', 'Products') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'border-border/60 bg-background/95 shadow-lg shadow-black/30'
          : 'border-border/40 bg-background/80'
      )}
    >
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary/20 group-hover:border-primary/50 transition-colors bg-black flex items-center justify-center">
            <img src={logoPath} alt="Mang Herbal" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
          </div>
          <span className="font-serif text-xl font-bold tracking-wide gold-gradient-text hidden sm:block">
            Mang Herbal
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative py-2",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
              {location === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Language Switcher — flag + language name */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
                <span className="inline-block w-9 h-6 rounded-[4px] overflow-hidden ring-1 ring-border/60 shadow-sm shrink-0">
                  <currentLang.Flag className="w-full h-full" />
                </span>
                <span className="text-sm font-medium">{currentLang.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-card border-border">
              {LANGS.map(({ code, name, Flag }) => (
                <DropdownMenuItem key={code} onClick={() => setLang(code)} className="gap-3 cursor-pointer">
                  <span className="inline-block w-9 h-6 rounded-[4px] overflow-hidden ring-1 ring-border/60 shadow-sm shrink-0">
                    <Flag className="w-full h-full" />
                  </span>
                  <span className="flex-1">{name}</span>
                  {lang === code && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin panel — visible button for admins */}
          {user?.role === 'admin' && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary"
              >
                <ShieldCheck className="w-4 h-4" />
                {t('پانێڵی بەڕێوەبەر', 'لوحة الإدارة', 'Admin Panel')}
              </Button>
            </Link>
          )}

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartItemsCount}
              </span>
            )}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-secondary text-secondary-foreground border border-border">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <div className="px-2 py-1.5 text-sm font-medium text-foreground mb-1 border-b border-border">
                  {user.name}
                </div>
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      {t('داشبۆردی ئەدمین', 'لوحة الإدارة', 'Admin')}
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link href="/orders">
                  <DropdownMenuItem className="cursor-pointer">
                    <Package className="w-4 h-4 mr-2" />
                    {t('داواکارییەکانم', 'طلباتي', 'My Orders')}
                  </DropdownMenuItem>
                </Link>
                <Link href="/favorites">
                  <DropdownMenuItem className="cursor-pointer">
                    <Heart className="w-4 h-4 mr-2" />
                    {t('دڵخوازەکان', 'المفضلة', 'Favorites')}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer mt-1">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('چوونە دەرەوە', 'تسجيل خروج', 'Logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden sm:flex border-primary/20 hover:border-primary text-primary hover:bg-primary/10">
                {t('چوونە ژوورەوە', 'تسجيل الدخول', 'Login')}
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "text-lg font-medium p-2 rounded-md transition-colors hover:bg-secondary",
                location === link.href ? "text-primary bg-secondary/50" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary"
              >
                <ShieldCheck className="w-4 h-4" />
                {t('پانێڵی بەڕێوەبەر', 'لوحة الإدارة', 'Admin Panel')}
              </Button>
            </Link>
          )}
          {!user && (
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {t('چوونە ژوورەوە', 'تسجيل الدخول', 'Login')}
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
