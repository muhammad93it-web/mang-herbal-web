import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartUIProvider } from '@/store/ui-store';
import { RootLayout } from '@/components/layout/RootLayout';
import { setBaseUrl } from '@workspace/api-client-react';

import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import CartPage from '@/pages/CartPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Orders from '@/pages/Orders';
import Favorites from '@/pages/Favorites';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import { useEffect } from 'react';

// Configure the base URL for API calls so we don't need to specify it manually everywhere.
// API calls go through the shared proxy at /api — no base URL prefix needed
setBaseUrl('');

const queryClient = new QueryClient();

// Route guards
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!user) return null;

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!user || user.role !== 'admin') return null;

  return <Component />;
}

function AppRouter() {
  return (
    <RootLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={CartPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Protected */}
        <Route path="/orders">
          {() => <ProtectedRoute component={Orders} />}
        </Route>
        <Route path="/favorites">
          {() => <ProtectedRoute component={Favorites} />}
        </Route>

        {/* Admin */}
        <Route path="/admin">
          {() => <AdminRoute component={AdminDashboard} />}
        </Route>
        <Route path="/admin/products">
          {() => <AdminRoute component={AdminProducts} />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </RootLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartUIProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <AppRouter />
              </WouterRouter>
              <Toaster />
            </CartUIProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
