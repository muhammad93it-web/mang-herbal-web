import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminGetOrders, useAdminUpdateOrderStatus, getAdminGetOrdersQueryKey } from '@workspace/api-client-react';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useAdminGetOrders();
  const updateStatus = useAdminUpdateOrderStatus();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500', icon: Clock };
      case 'confirmed': return { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-500', icon: Package };
      case 'shipped': return { label: 'Shipped', color: 'bg-indigo-500/10 text-indigo-500', icon: Truck };
      case 'delivered': return { label: 'Delivered', color: 'bg-green-500/10 text-green-500', icon: CheckCircle2 };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: XCircle };
      default: return { label: status, color: 'bg-secondary text-foreground', icon: Package };
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    // @ts-ignore - The types match the enum but might be slightly strict
    updateStatus.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => {
        toast.success('Order status updated');
        queryClient.invalidateQueries({ queryKey: getAdminGetOrdersQueryKey() });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Manage all orders</p>
            </div>
          </div>
          
          <Link href="/admin/products">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              Manage Products <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="p-4 font-semibold text-muted-foreground">Order ID</th>
                  <th className="p-4 font-semibold text-muted-foreground">Date</th>
                  <th className="p-4 font-semibold text-muted-foreground">Customer Info</th>
                  <th className="p-4 font-semibold text-muted-foreground">Total</th>
                  <th className="p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="p-4"><Skeleton className="h-12 w-full" /></td>
                    </tr>
                  ))
                ) : orders && orders.length > 0 ? (
                  orders.map(order => {
                    const cfg = getStatusConfig(order.status);
                    const Icon = cfg.icon;
                    return (
                      <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="p-4 font-medium">#{order.id}</td>
                        <td className="p-4 text-muted-foreground text-sm" dir="ltr">{format(new Date(order.createdAt), 'PP')}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm" dir="ltr">{order.phone}</span>
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
                        <td className="p-4 text-right">
                          <Select 
                            value={order.status} 
                            onValueChange={(val) => handleStatusChange(order.id, val)}
                          >
                            <SelectTrigger className="w-[140px] ml-auto h-8 text-xs bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
