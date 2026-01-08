import Link from 'next/link';
import { TrendingUp, DollarSign, Receipt, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Business insights and analytics
        </p>
      </div>

      {/* Report Cards */}
      <div className="space-y-3">
        <Link href="/reports/profit-loss">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Profit & Loss</h3>
                <p className="text-sm text-muted-foreground">
                  Revenue, costs, and net profit
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/sales">
          <Card className="hover: bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark: bg-blue-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Sales Report</h3>
                <p className="text-sm text-muted-foreground">
                  Daily, weekly, monthly sales
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/expenses">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Receipt className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Expenses</h3>
                <p className="text-sm text-muted-foreground">
                  Operating costs breakdown
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}