import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  DollarSign,
  PackageX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatCurrency } from "@/lib/utils";
import { getDashboardStats } from "@/lib/db/queries/dashboard";

// Loading skeleton
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded w-20 mb-2" />
            <div className="h-8 bg-muted rounded w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="h-4 w-4" />
            <span className="text-sm">Products</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Today's Sales</span>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(stats.todaySales)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">
            {stats.lowStockCount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <PackageX className="h-4 w-4 text-red-500" />
            <span className="text-sm">Out of Stock</span>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {stats.outOfStockCount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function LowStockAlerts() {
  const stats = await getDashboardStats();

  if (stats.lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          <Link href="/stock? filter=low">
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {stats.lowStockItems.slice(0, 5).map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.productId}
                </p>
              </div>
              <Badge
                variant={item.currentStock === 0 ? "destructive" : "outline"}
                className="font-mono"
              >
                {item.currentStock} left
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 py-4">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          Hello, {user?.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground">Here's what's happening today</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/sales/new">
          <Button className="w-full h-16 text-base" size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            New Sale
          </Button>
        </Link>
        <Link href="/purchases/new">
          <Button variant="outline" className="w-full h-16 text-base" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Stock In
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Low Stock Alerts */}
      <Suspense fallback={null}>
        <LowStockAlerts />
      </Suspense>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid grid-cols-3 gap-2">
          <Link href="/products">
            <Button variant="outline" className="w-full h-auto py-3 flex-col">
              <Package className="h-5 w-5 mb-1" />
              <span className="text-xs">Products</span>
            </Button>
          </Link>
          <Link href="/sales">
            <Button variant="outline" className="w-full h-auto py-3 flex-col">
              <ShoppingCart className="h-5 w-5 mb-1" />
              <span className="text-xs">Sales</span>
            </Button>
          </Link>
          <Link href="/reports/profit-loss">
            <Button variant="outline" className="w-full h-auto py-3 flex-col">
              <TrendingUp className="h-5 w-5 mb-1" />
              <span className="text-xs">P&L</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
