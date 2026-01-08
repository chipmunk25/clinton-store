'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LowStockItem {
  id: string;
  productId: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
}

interface ExpiringItem {
  id: string;
  productId: string;
  name: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface NotificationData {
  lowStockItems: LowStockItem[];
  expiringItems: ExpiringItem[];
  outOfStockCount: number;
}

export function LowStockAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts =
    (data?.lowStockItems. length || 0) +
    (data?.expiringItems.length || 0) +
    (data?.outOfStockCount || 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalAlerts > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {totalAlerts > 9 ? '9+' : totalAlerts}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </SheetTitle>
          <SheetDescription>
            Stock alerts and reminders
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : totalAlerts === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Out of Stock */}
              {data?.outOfStockCount && data.outOfStockCount > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Out of Stock</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {data.outOfStockCount} product{data.outOfStockCount !== 1 ? 's' :  ''} out of stock
                  </p>
                  <Link href="/stock? filter=out">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full border-red-300 text-red-600 hover:bg-red-100"
                      onClick={() => setIsOpen(false)}
                    >
                      View Items
                    </Button>
                  </Link>
                </div>
              )}

              {/* Low Stock Items */}
              {data?.lowStockItems && data.lowStockItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Low Stock ({data.lowStockItems.length})
                  </h3>
                  <div className="space-y-2">
                    {data.lowStockItems. map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {item.productId}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                              {item.currentStock} left
                            </Badge>
                          </div>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Reorder level: {item.reorderLevel}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Expiring Items */}
              {data?.expiringItems && data.expiringItems. length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Expiring Soon ({data.expiringItems.length})
                  </h3>
                  <div className="space-y-2">
                    {data.expiringItems. map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.id}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {item. productId}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                item.daysUntilExpiry <= 3
                                  ?  'bg-red-100 text-red-700 border-red-300'
                                  : 'bg-orange-100 text-orange-700 border-orange-300'
                              }
                            >
                              {item.daysUntilExpiry} days
                            </Badge>
                          </div>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}