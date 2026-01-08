import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProfitLossReport } from '@/lib/db/queries/reports';
import { formatCurrency } from '@/lib/utils';

interface ProfitLossPageProps {
  searchParams: Promise<{ period?: string }>;
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4]. map((i) => (
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

async function ProfitLossReport({ period }: { period:  string }) {
  // Calculate date range based on period
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

  const report = await getProfitLossReport(startDate, endDate);

  const periodLabel = period === 'today' ?  'Today' : 
                      period === 'week' ? 'Last 7 Days' :
                      period === 'year' ? 'Last 12 Months' : 'Last 30 Days';

  return (
    <div className="space-y-4">
      {/* Period Label */}
      <div className="text-center py-2">
        <span className="text-sm text-muted-foreground">{periodLabel}</span>
      </div>

      {/* Revenue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(report.revenue. totalSales)}
          </p>
          <p className="text-sm text-muted-foreground">
            {report.revenue.salesCount} sales
          </p>
        </CardContent>
      </Card>

      {/* Cost of Goods Sold */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            Cost of Goods Sold
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-orange-600">
            {formatCurrency(report.costOfGoodsSold. totalCost)}
          </p>
          <p className="text-sm text-muted-foreground">
            Product costs
          </p>
        </CardContent>
      </Card>

      {/* Gross Profit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gross Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${report.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(report. grossProfit)}
          </p>
          <p className="text-sm text-muted-foreground">
            {report.grossMargin.toFixed(1)}% margin
          </p>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4 text-red-500" />
            Operating Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(report. expenses.total)}
          </p>
          {Object.entries(report.expenses.byCategory).length > 0 && (
            <div className="mt-3 space-y-1">
              {Object.entries(report.expenses.byCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{category}</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card className={report.netProfit >= 0 ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:bg-red-950'}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            Net Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-4xl font-bold ${report.netProfit >= 0 ? 'text-green-600' :  'text-red-600'}`}>
            {formatCurrency(report.netProfit)}
          </p>
          <p className="text-sm text-muted-foreground">
            {report.netMargin.toFixed(1)}% net margin
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ProfitLossPage({ searchParams }: ProfitLossPageProps) {
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
          <h1 className="text-xl font-bold">Profit & Loss</h1>
          <p className="text-sm text-muted-foreground">
            Business performance summary
          </p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['today', 'week', 'month', 'year'].map((p) => (
          <Link key={p} href={`/reports/profit-loss?period=${p}`}>
            <Button
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              {p === 'today' ? 'Today' : 
               p === 'week' ? '7 Days' :
               p === 'month' ? '30 Days' :  '12 Months'}
            </Button>
          </Link>
        ))}
      </div>

      {/* Report */}
      <Suspense fallback={<ReportSkeleton />}>
        <ProfitLossReport period={period} />
      </Suspense>
    </div>
  );
}