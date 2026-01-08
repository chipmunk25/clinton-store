import Link from 'next/link';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProductsWithStock } from '@/lib/db/queries/products';
import { formatCurrency } from '@/lib/utils';
import { StockBadge } from '@/components/stock/stock-badge';

interface ProductsListProps {
  searchQuery?:  string;
}

export async function ProductsList({ searchQuery }: ProductsListProps) {
  const products = await getProductsWithStock(searchQuery);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg">No products found</h3>
        <p className="text-sm text-muted-foreground">
          {searchQuery
            ? `No products match "${searchQuery}"`
            : 'Start by adding your first product'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {product.productId}
                    </span>
                    {product.categoryName && (
                      <Badge variant="secondary" className="text-xs">
                        {product. categoryName}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Cost: {formatCurrency(product. costPrice)}
                    </span>
                    <span className="font-medium text-primary">
                      Sell: {formatCurrency(product. sellingPrice)}
                    </span>
                  </div>
                </div>
                <StockBadge
                  status={product.stockStatus}
                  quantity={product.currentStock}
                />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}