import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSalesHistory } from '@/lib/db/queries/sales';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface SalesPageProps {
  searchParams: Promise<{ page?: string }>;
}

function SalesListSkeleton() {
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

async function SalesList() {
  const sales = await getSalesHistory();

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg">No sales yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Record your first sale to see it here
        </p>
        <Link href="/sales/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </Link>
      </div>
    );
  }

  // Group sales by date
  const groupedSales:  Record<string, typeof sales> = {};
  sales. forEach((sale) => {
    const date = new Date(sale.saleDate).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (!groupedSales[date]) {
      groupedSales[date] = [];
    }
    groupedSales[date]. push(sale);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedSales).map(([date, dateSales]) => {
        const dayTotal = dateSales.reduce(
          (sum, sale) => sum + Number(sale.totalAmount),
          0
        );

        return (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background py-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                {date}
              </h3>
              <Badge variant="secondary" className="font-mono">
                {formatCurrency(dayTotal)}
              </Badge>
            </div>

            {/* Sales for this date */}
            {dateSales.map((sale) => (
              <Card key={sale.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{sale.productName}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {sale.productCode}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{sale.quantity} × {formatCurrency(sale.unitPrice)}</span>
                        <span>•</span>
                        <span>
                          {new Date(sale.saleDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {sale.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {sale.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {sale.recordedByName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales History</h1>
          <p className="text-sm text-muted-foreground">
            Recent transactions
          </p>
        </div>
        <Link href="/sales/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Sale
          </Button>
        </Link>
      </div>

      {/* Sales List */}
      <Suspense fallback={<SalesListSkeleton />}>
        <SalesList />
      </Suspense>
    </div>
  );
}