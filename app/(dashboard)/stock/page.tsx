import { Suspense } from 'react';
import Link from 'next/link';
import { Package, AlertTriangle, PackageX, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStockOverview } from '@/lib/db/queries/stock';
import { StockBadge } from '@/components/stock/stock-badge';
import { formatCurrency } from '@/lib/utils';

interface StockPageProps {
  searchParams:  Promise<{ filter?: string }>;
}

function StockListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-5 bg-muted rounded w-32 mb-2" />
            <div className="h-4 bg-muted rounded w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function StockList({ filter }: { filter?: string }) {
  const data = await getStockOverview(filter);

  if (data.products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg">No products found</h3>
        <p className="text-sm text-muted-foreground">
          {filter === 'low' ? 'No low stock items' : 
           filter === 'out' ? 'No out of stock items' : 
           'No products in inventory'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="hover: bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {product.productId}
                    </span>
                  </div>
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Reorder at:  {product.reorderLevel} units
                  </p>
                </div>
                <div className="text-right">
                  <StockBadge
                    status={product.stockStatus}
                    quantity={product.currentStock}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Value: {formatCurrency(product.currentStock * Number(product.costPrice))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

async function StockSummary() {
  const data = await getStockOverview();

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-3 text-center">
          <Package className="h-5 w-5 mx-auto text-green-500 mb-1" />
          <p className="text-2xl font-bold">{data.summary.inStock}</p>
          <p className="text-xs text-muted-foreground">In Stock</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
          <p className="text-2xl font-bold text-amber-500">{data.summary.lowStock}</p>
          <p className="text-xs text-muted-foreground">Low Stock</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <PackageX className="h-5 w-5 mx-auto text-red-500 mb-1" />
          <p className="text-2xl font-bold text-red-500">{data.summary.outOfStock}</p>
          <p className="text-xs text-muted-foreground">Out</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function StockPage({ searchParams }: StockPageProps) {
  const params = await searchParams;
  const filter = params.filter || 'all';

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Stock Overview</h1>
        <p className="text-sm text-muted-foreground">
          Monitor inventory levels
        </p>
      </div>

      {/* Summary Cards */}
      <Suspense fallback={<div className="h-24 bg-muted animate-pulse rounded-lg" />}>
        <StockSummary />
      </Suspense>

      {/* Filter Tabs */}
      <Tabs defaultValue={filter} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" asChild>
            <Link href="/stock? filter=all">All</Link>
          </TabsTrigger>
          <TabsTrigger value="low" asChild>
            <Link href="/stock?filter=low">Low Stock</Link>
          </TabsTrigger>
          <TabsTrigger value="out" asChild>
            <Link href="/stock?filter=out">Out of Stock</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stock List */}
      <Suspense fallback={<StockListSkeleton />}>
        <StockList filter={filter} />
      </Suspense>
    </div>
  );
}