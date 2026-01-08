import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Package, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSalesReport } from '@/lib/db/queries/reports';
import { formatCurrency } from '@/lib/utils';

interface SalesReportPageProps {
  searchParams: Promise<{ period?: string }>;
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3]. map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-6 bg-muted rounded w-32 mb-2" />
            <div className="h-8 bg-muted rounded w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function SalesReport({ period }: { period:  string }) {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week': 
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate. getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }

  const report = await getSalesReport(startDate, endDate);

  const periodLabel =
    period === 'today'
      ? 'Today'
      : period === 'week'
      ? 'Last 7 Days'
      : period === 'year'
      ? 'Last 12 Months'
      :  'Last 30 Days';

  return (
    <div className="space-y-4">
      {/* Period Label */}
      <div className="text-center py-2">
        <span className="text-sm text-muted-foreground">{periodLabel}</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(report.totalSales)}
            </p>
            <p className="text-xs text-muted-foreground">Total Sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{report.totalQuantity}</p>
            <p className="text-xs text-muted-foreground">Items Sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Average Order Value */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Average Sale Value</span>
            <span className="text-xl font-bold">
              {formatCurrency(report.averageOrderValue)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      {report.topProducts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.topProducts. map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {product.productId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Sales */}
      {report.salesByDay.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.salesByDay.slice(-7).map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {day.count} sales
                    </Badge>
                    <span className="font-medium">{formatCurrency(day.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function SalesReportPage({ searchParams }: SalesReportPageProps) {
  const params = await searchParams;
  const period = params.period || 'month';

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Sales Report</h1>
          <p className="text-sm text-muted-foreground">
            Sales performance analysis
          </p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['today', 'week', 'month', 'year'].map((p) => (
          <Link key={p} href={`/reports/sales?period=${p}`}>
            <Button
              variant={period === p ? 'default' :  'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              {p === 'today'
                ? 'Today'
                : p === 'week'
                ? '7 Days'
                : p === 'month'
                ?  '30 Days'
                : '12 Months'}
            </Button>
          </Link>
        ))}
      </div>

      {/* Report */}
      <Suspense fallback={<ReportSkeleton />}>
        <SalesReport period={period} />
      </Suspense>
    </div>
  );
}