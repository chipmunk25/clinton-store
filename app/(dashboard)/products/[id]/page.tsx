import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/session';
import { getProductById } from '@/lib/db/queries/products';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StockBadge } from '@/components/stock/stock-badge';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const product = await getProductById(id);
  const isAdmin = user?.role === 'admin';

  if (!product) {
    notFound();
  }

  const profit = Number(product.sellingPrice) - Number(product.costPrice);
  const margin = (profit / Number(product.sellingPrice)) * 100;

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-mono">
            {product.productId}
          </p>
          <h1 className="text-xl font-bold">{product.name}</h1>
        </div>
        {isAdmin && (
          <Link href={`/products/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Stock Status Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-3xl font-bold">{product. currentStock}</p>
            </div>
            <StockBadge
              status={product.stockStatus}
              quantity={product.currentStock}
              className="text-base px-3 py-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total In</p>
                <p className="font-semibold">{product.totalPurchased}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Out</p>
                <p className="font-semibold">{product.totalSold}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost Price</span>
            <span className="font-medium">{formatCurrency(product. costPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Selling Price</span>
            <span className="font-medium text-primary">
              {formatCurrency(product.sellingPrice)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Profit / Unit</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(profit)} ({margin.toFixed(1)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {product.categoryName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="secondary">{product.categoryName}</Badge>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reorder Level</span>
            <span className="font-medium">{product.reorderLevel} units</span>
          </div>
          {product.expiryDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expiry Date</span>
              <span className="font-medium">{formatDate(product. expiryDate)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Added</span>
            <span className="font-medium">{formatDate(product.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/sales/new? product=${product.productId}`}>
          <Button className="w-full">Record Sale</Button>
        </Link>
        <Link href={`/purchases/new?product=${product.productId}`}>
          <Button variant="outline" className="w-full">Stock In</Button>
        </Link>
      </div>
    </div>
  );
}