import { Suspense } from 'react';
import Link from 'next/link';
import { Package, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPurchaseHistory } from '@/lib/db/queries/purchases';
import { formatCurrency } from '@/lib/utils';

function PurchasesListSkeleton() {
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

async function PurchasesList() {
  const purchases = await getPurchaseHistory();

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg">No purchases yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Record your first stock-in to see it here
        </p>
        <Link href="/purchases/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Stock In
          </Button>
        </Link>
      </div>
    );
  }

  // Group purchases by date
  const groupedPurchases: Record<string, typeof purchases> = {};
  purchases.forEach((purchase) => {
    const date = new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (!groupedPurchases[date]) {
      groupedPurchases[date] = [];
    }
    groupedPurchases[date].push(purchase);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedPurchases).map(([date, datePurchases]) => {
        const dayTotal = datePurchases.reduce(
          (sum, p) => sum + Number(p.totalCost),
          0
        );
        const dayUnits = datePurchases.reduce((sum, p) => sum + p.quantity, 0);

        return (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background py-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                {date}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{dayUnits} units</Badge>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(dayTotal)}
                </Badge>
              </div>
            </div>

            {/* Purchases for this date */}
            {datePurchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{purchase.productName}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {purchase.productCode}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{purchase.quantity} × {formatCurrency(purchase.unitCost)}</span>
                        <span>•</span>
                        <span>
                          {new Date(purchase.purchaseDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {/* Location */}
                      <div className="flex items-center gap-1 mt-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="font-mono text-xs">
                          {purchase.locationCode}
                        </Badge>
                      </div>
                      {purchase.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {purchase.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(purchase.totalCost)}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        +{purchase.quantity}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {purchase.recordedByName}
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

export default async function PurchasesPage() {
  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase History</h1>
          <p className="text-sm text-muted-foreground">
            Stock-in records
          </p>
        </div>
        <Link href="/purchases/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Stock In
          </Button>
        </Link>
      </div>

      {/* Purchases List */}
      <Suspense fallback={<PurchasesListSkeleton />}>
        <PurchasesList />
      </Suspense>
    </div>
  );
}