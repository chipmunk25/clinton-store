import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/db/queries/settings";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  DollarSign,
  PackageX,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardStats,
  getRecentActivity,
} from "@/lib/db/queries/dashboard";
import { formatCurrency } from "@/lib/utils";

// Loading skeletons
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

function ActivitySkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-32 mb-1" />
                <div className="h-3 bg-muted rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm">Today's Sales</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.todaySales)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.todaySalesCount} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="h-4 w-4" />
            <span className="text-sm">Products</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.activeProducts} active
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
          <Link
            href="/stock? filter=low"
            className="text-xs text-primary hover:underline"
          >
            View items →
          </Link>
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
          <Link
            href="/stock?filter=out"
            className="text-xs text-primary hover:underline"
          >
            View items →
          </Link>
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
          <Link href="/stock?filter=low">
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {stats.lowStockItems.slice(0, 5).map((item) => (
            <Link
              key={item.productId}
              href={`/products/${item.id}`}
              className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded"
            >
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {item.productCode}
                </p>
              </div>
              <Badge
                variant={item.currentStock === 0 ? "destructive" : "outline"}
                className="font-mono"
              >
                {item.currentStock} left
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function RecentActivity() {
  const activities = await getRecentActivity();

  if (activities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <Link href="/sales">
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 py-2 border-b last:border-0"
            >
              <div
                className={`p-2 rounded-full shrink-0 ${
                  activity.type === "sale"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-blue-100 dark:bg-blue-900"
                }`}
              >
                {activity.type === "sale" ? (
                  <ShoppingCart className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <Plus className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.type === "sale" ? "Sold" : "Stocked"}{" "}
                  {activity.quantity} × {formatCurrency(activity.unitPrice)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-semibold ${
                    activity.type === "sale"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {activity.type === "sale" ? "+" : "-"}
                  {formatCurrency(activity.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const settings = await getSettings();

  // Get greeting based on time
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  return (
    <div className="space-y-6 py-4">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening at {settings.storeName}
        </p>
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

      {/* Recent Activity */}
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
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
        <CardContent className="pt-0 grid grid-cols-4 gap-2">
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
          <Link href="/stock">
            <Button variant="outline" className="w-full h-auto py-3 flex-col">
              <Package className="h-5 w-5 mb-1" />
              <span className="text-xs">Stock</span>
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" className="w-full h-auto py-3 flex-col">
              <TrendingUp className="h-5 w-5 mb-1" />
              <span className="text-xs">Reports</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
